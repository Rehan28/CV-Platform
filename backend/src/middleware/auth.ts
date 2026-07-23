import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// Passport's own @types declare an empty Express.User interface that
// Request.user is typed against; augment it to be our real model so every
// route handler gets a properly typed req.user without re-declaring it.
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends InstanceType<typeof import("../models/User").User> {}
  }
}

export type AuthedRequest = Request;

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
}

// Populates req.user if a valid token is present; does NOT reject anonymous
// requests, since browsing positions/stats read-only is allowed logged-out.
export async function attachUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer /, "");
    if (!token) return next();
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = await User.findByPk(payload.sub);
    if (user && !user.blocked) req.user = user;
    next();
  } catch {
    next();
  }
}

// Hard gate for routes that require authentication.
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Authentication required." });
  next();
}
