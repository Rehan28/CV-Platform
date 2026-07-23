import { Router } from "express";
import { Op } from "sequelize";
import { Attribute, RecentlyUsedAttribute, PositionAttribute } from "../models";
import { ATTRIBUTE_CATEGORIES, ATTRIBUTE_TYPES } from "../models/Attribute";
import { attachUser, requireAuth, AuthedRequest } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const router = Router();
router.use(attachUser);

// GET /api/attributes?prefix=ie&category=Certification&recent=true
// Read access is open to any authenticated user (Candidates need to browse
// the library too, to opt attributes into their own profile).
router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const { prefix, category, recent } = req.query as Record<string, string | undefined>;

  if (recent === "true") {
    const rows = await RecentlyUsedAttribute.findAll({
      where: { userId: req.user!.id },
      order: [["usedAt", "DESC"]],
      limit: 10,
      include: [{ model: Attribute }],
    });
    return res.json(rows.map((r) => (r as any).Attribute));
  }

  const where: any = {};
  if (prefix) where.name = { [Op.like]: `${prefix}%` };
  if (category) where.category = category;

  const attributes = await Attribute.findAll({ where, order: [["name", "ASC"]], limit: 200 });
  res.json(attributes);
});

router.get("/meta", requireAuth, (_req, res) => {
  res.json({ categories: ATTRIBUTE_CATEGORIES, dataTypes: ATTRIBUTE_TYPES });
});

router.get("/:id", requireAuth, async (req, res) => {
  const attribute = await Attribute.findByPk(req.params.id);
  if (!attribute) return res.status(404).json({ error: "Attribute not found." });
  res.json(attribute);
});

router.post("/", requireRole("recruiter"), async (req: AuthedRequest, res) => {
  const { name, category, description, dataType, options } = req.body;
  if (!name || !category || !dataType) {
    return res.status(400).json({ error: "name, category, and dataType are required." });
  }
  if (!ATTRIBUTE_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Unknown category." });
  }
  if (!ATTRIBUTE_TYPES.includes(dataType)) {
    return res.status(400).json({ error: "Unknown data type." });
  }
  if (dataType === "one_of_many" && (!Array.isArray(options) || options.length < 2)) {
    return res.status(400).json({ error: "'One of many' attributes need at least 2 options." });
  }

  const existing = await Attribute.findOne({ where: { name } });
  if (existing) return res.status(409).json({ error: "An attribute with that name already exists." });

  const attribute = await Attribute.create({
    name,
    category,
    description: description || "",
    dataType,
    options: dataType === "one_of_many" ? options : null,
    createdById: req.user!.id,
  } as any);

  await RecentlyUsedAttribute.upsert({ userId: req.user!.id, attributeId: attribute.id, usedAt: new Date() });
  res.status(201).json(attribute);
});

router.put("/:id", requireRole("recruiter"), async (req: AuthedRequest, res) => {
  const attribute = await Attribute.findByPk(req.params.id);
  if (!attribute) return res.status(404).json({ error: "Attribute not found." });

  const { name, category, description, dataType, options } = req.body;

  if (attribute.isSystem && (name !== undefined || dataType !== undefined)) {
    return res.status(400).json({ error: "Built-in profile attributes can't have their name or type changed." });
  }
  if (name && name !== attribute.name) {
    const existing = await Attribute.findOne({ where: { name } });
    if (existing) return res.status(409).json({ error: "An attribute with that name already exists." });
  }
  if (category && !ATTRIBUTE_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Unknown category." });
  }

  await attribute.update({
    name: name ?? attribute.name,
    category: category ?? attribute.category,
    description: description ?? attribute.description,
    dataType: attribute.isSystem ? attribute.dataType : dataType ?? attribute.dataType,
    options: dataType === "one_of_many" ? options ?? attribute.options : attribute.options,
  });

  await RecentlyUsedAttribute.upsert({ userId: req.user!.id, attributeId: attribute.id, usedAt: new Date() });
  res.json(attribute);
});

router.delete("/:id", requireRole("recruiter"), async (req, res) => {
  const attribute = await Attribute.findByPk(req.params.id);
  if (!attribute) return res.status(404).json({ error: "Attribute not found." });
  if (attribute.isSystem) {
    return res.status(400).json({ error: "Built-in profile attributes can't be deleted." });
  }
  const usedInPositions = await PositionAttribute.count({ where: { attributeId: attribute.id } });
  if (usedInPositions > 0) {
    return res.status(409).json({
      error: `This attribute is used in ${usedInPositions} position(s) and can't be deleted while in use.`,
    });
  }
  await attribute.destroy();
  res.status(204).end();
});

// Called by the client whenever an attribute is actually applied somewhere
// (added to a position template, added to a profile's Info section, etc.)
router.post("/:id/touch", requireAuth, async (req: AuthedRequest, res) => {
  await RecentlyUsedAttribute.upsert({
    userId: req.user!.id,
    attributeId: req.params.id,
    usedAt: new Date(),
  });
  res.status(204).end();
});

export default router;
