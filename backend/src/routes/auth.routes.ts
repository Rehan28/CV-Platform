import { Router } from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import { User } from "../models";
import { signToken, attachUser, requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();
const COOKIE_OPTS = { httpOnly: true, sameSite: "lax" as const, maxAge: 7 * 24 * 3600 * 1000 };

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: "Email and an 8+ character password are required." });
  }
  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(409).json({ error: "An account with that email already exists." });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, roles: ["candidate"] } as any);
  const token = signToken(user.id);
  res.cookie("token", token, COOKIE_OPTS);
  res.status(201).json({ id: user.id, email: user.email, roles: user.roles });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  if (user.blocked) return res.status(403).json({ error: "This account has been blocked." });
  const token = signToken(user.id);
  res.cookie("token", token, COOKIE_OPTS);
  res.json({ id: user.id, email: user.email, roles: user.roles });
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.status(204).end();
});

router.get("/me", attachUser, requireAuth, (req: AuthedRequest, res) => {
  const u = req.user!;
  res.json({ id: u.id, email: u.email, roles: u.roles, profileVersion: u.profileVersion });
});

// --- Social login ---
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login?error=google" }),
  (req, res) => {
    const token = signToken((req.user as any).id);
    res.cookie("token", token, COOKIE_OPTS);
    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
  }
);

router.get("/facebook", passport.authenticate("facebook", { session: false }));
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: "/login?error=facebook" }),
  (req, res) => {
    const token = signToken((req.user as any).id);
    res.cookie("token", token, COOKIE_OPTS);
    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
  }
);

export default router;
