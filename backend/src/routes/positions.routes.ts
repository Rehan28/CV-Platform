import { Router } from "express";
import { Position, PositionAttribute, AccessRule, Attribute, CV } from "../models";
import { POSITION_LEVELS } from "../models/Position";
import { RULE_OPERATORS } from "../models/AccessRule";
import { attachUser, requireAuth, AuthedRequest } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { candidateSatisfiesRules, operatorsForType } from "../services/accessRule.service";

const router = Router();
router.use(attachUser);

async function serializePosition(position: Position, viewerId?: string) {
  const [attrs, rules] = await Promise.all([
    PositionAttribute.findAll({ where: { positionId: position.id }, include: [Attribute], order: [["order", "ASC"]] }),
    AccessRule.findAll({ where: { positionId: position.id }, include: [Attribute] }),
  ]);

  let eligible: boolean | null = null;
  if (viewerId) {
    eligible = position.isPublic || (await candidateSatisfiesRules(viewerId, rules));
  }

  return {
    id: position.id,
    title: position.title,
    shortDescription: position.shortDescription,
    company: position.company,
    level: position.level,
    isPublic: position.isPublic,
    maxProjects: position.maxProjects,
    projectTags: position.projectTags,
    version: position.version,
    createdAt: position.createdAt,
    updatedAt: position.updatedAt,
    attributes: attrs.map((pa: any) => ({ order: pa.order, ...pa.Attribute.toJSON() })),
    accessRules: rules.map((r: any) => ({
      id: r.id,
      attributeId: r.attributeId,
      attributeName: r.Attribute.name,
      operator: r.operator,
      value: r.value,
    })),
    eligible,
  };
}

// GET /api/positions - list. Anonymous + candidates see public positions plus
// (if authenticated) restricted ones, annotated with eligibility. Recruiters
// and Admins see everything, since the pool of positions is shared.
router.get("/", async (req: AuthedRequest, res) => {
  const isStaff = req.user?.hasRole("recruiter") || req.user?.hasRole("admin");
  const where = isStaff ? {} : req.user ? {} : { isPublic: true };
  const positions = await Position.findAll({ where, order: [["updatedAt", "DESC"]] });
  const serialized = await Promise.all(positions.map((p) => serializePosition(p, req.user?.id)));
  res.json(serialized);
});

router.get("/meta", requireAuth, (_req, res) => {
  res.json({ levels: POSITION_LEVELS, operators: RULE_OPERATORS });
});

router.get("/:id", async (req: AuthedRequest, res) => {
  const position = await Position.findByPk(req.params.id);
  if (!position) return res.status(404).json({ error: "Position not found." });
  res.json(await serializePosition(position, req.user?.id));
});

router.get("/:id/cvs", requireRole("recruiter"), async (req, res) => {
  const cvs = await CV.findAll({ where: { positionId: req.params.id, status: "published" } });
  res.json(cvs);
});

router.post("/", requireRole("recruiter"), async (req: AuthedRequest, res) => {
  const { title, shortDescription, company, level, isPublic, maxProjects, projectTags } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required." });
  if (level && !POSITION_LEVELS.includes(level)) return res.status(400).json({ error: "Unknown level." });

  const position = await Position.create({
    title,
    shortDescription: shortDescription || "",
    company: company || null,
    level: level || null,
    isPublic: isPublic ?? true,
    maxProjects: maxProjects ?? 3,
    projectTags: projectTags ?? [],
    createdById: req.user!.id,
  } as any);
  res.status(201).json(await serializePosition(position, req.user!.id));
});

router.post("/:id/duplicate", requireRole("recruiter"), async (req: AuthedRequest, res) => {
  const source = await Position.findByPk(req.params.id);
  if (!source) return res.status(404).json({ error: "Position not found." });

  const [attrs, rules] = await Promise.all([
    PositionAttribute.findAll({ where: { positionId: source.id } }),
    AccessRule.findAll({ where: { positionId: source.id } }),
  ]);

  const copy = await Position.create({
    title: `${source.title} (copy)`,
    shortDescription: source.shortDescription,
    company: source.company,
    level: source.level,
    isPublic: source.isPublic,
    maxProjects: source.maxProjects,
    projectTags: source.projectTags,
    createdById: req.user!.id,
  } as any);

  await Promise.all([
    ...attrs.map((a) => PositionAttribute.create({ positionId: copy.id, attributeId: a.attributeId, order: a.order })),
    ...rules.map((r) =>
      AccessRule.create({ positionId: copy.id, attributeId: r.attributeId, operator: r.operator, value: r.value })
    ),
  ]);

  res.status(201).json(await serializePosition(copy, req.user!.id));
});

// PUT /api/positions/:id - updates basic fields, attribute list, and access
// rules together under a single optimistic-lock version check.
router.put("/:id", requireRole("recruiter"), async (req: AuthedRequest, res) => {
  const position = await Position.findByPk(req.params.id);
  if (!position) return res.status(404).json({ error: "Position not found." });

  const { version, title, shortDescription, company, level, isPublic, maxProjects, projectTags, attributeIds, accessRules } =
    req.body;

  if (typeof version !== "number") return res.status(400).json({ error: "version is required." });
  if (version !== position.version) {
    return res.status(409).json({
      error: "This position was changed by someone else since you loaded it. Reload and try again.",
      currentVersion: position.version,
    });
  }
  if (level && !POSITION_LEVELS.includes(level)) return res.status(400).json({ error: "Unknown level." });

  if (Array.isArray(accessRules)) {
    for (const rule of accessRules) {
      const attribute = await Attribute.findByPk(rule.attributeId);
      if (!attribute) return res.status(400).json({ error: "Access rule references an unknown attribute." });
      if (!operatorsForType(attribute.dataType).includes(rule.operator)) {
        return res.status(400).json({ error: `Operator '${rule.operator}' isn't valid for a ${attribute.dataType} attribute.` });
      }
    }
  }

  await position.update({
    title: title ?? position.title,
    shortDescription: shortDescription ?? position.shortDescription,
    company: company ?? position.company,
    level: level ?? position.level,
    isPublic: isPublic ?? position.isPublic,
    maxProjects: maxProjects ?? position.maxProjects,
    projectTags: projectTags ?? position.projectTags,
    version: position.version + 1,
  });

  if (Array.isArray(attributeIds)) {
    await PositionAttribute.destroy({ where: { positionId: position.id } });
    await Promise.all(
      attributeIds.map((attributeId: string, order: number) =>
        PositionAttribute.create({ positionId: position.id, attributeId, order })
      )
    );
  }

  if (Array.isArray(accessRules)) {
    await AccessRule.destroy({ where: { positionId: position.id } });
    await Promise.all(
      accessRules.map((r: any) =>
        AccessRule.create({ positionId: position.id, attributeId: r.attributeId, operator: r.operator, value: r.value ?? null })
      )
    );
  }

  res.json(await serializePosition(position, req.user!.id));
});

router.delete("/:id", requireRole("recruiter"), async (req, res) => {
  const position = await Position.findByPk(req.params.id);
  if (!position) return res.status(404).json({ error: "Position not found." });
  await position.destroy(); // cascades access rules; CVs remain but are orphaned-hidden by query filters
  res.status(204).end();
});

export default router;
