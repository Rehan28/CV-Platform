import { Router } from "express";
import { Op } from "sequelize";
import { User, Attribute, Position, CV } from "../models";

const router = Router();

// Public - no auth required, per spec ("view public statistics").
router.get("/", async (_req, res) => {
  const since24h = new Date(Date.now() - 24 * 3600 * 1000);
  const [candidates, recruiters, positions, cvsTotal, cvsLast24h] = await Promise.all([
    User.count({ where: { roles: { [Op.substring]: "candidate" } } as any }),
    User.count({ where: { roles: { [Op.substring]: "recruiter" } } as any }),
    Position.count(),
    CV.count(),
    CV.count({ where: { createdAt: { [Op.gte]: since24h } } }),
  ]);
  const attributesCount = await Attribute.count();

  res.json({ candidates, recruiters, positions, cvsTotal, cvsLast24h, attributesCount });
});

export default router;
