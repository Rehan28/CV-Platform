import { Response, NextFunction } from "express";
import { AuthedRequest } from "./auth";
import { Role } from "../models/User";

// Admins can act as any role everywhere in the app, per spec ("effectively
// acting as the owner of every personal page" / "perform all Recruiter and
// Candidate actions"), so an admin check always short-circuits this gate.
export function requireRole(...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required." });
    if (req.user.hasRole("admin")) return next();
    if (roles.some((r) => req.user!.hasRole(r))) return next();
    return res.status(403).json({ error: "You don't have permission to do that." });
  };
}

// True if the request's user may act as the owner of the given userId
// (the resource owner themself, or an Admin).
export function isSelfOrAdmin(req: AuthedRequest, ownerId: string) {
  if (!req.user) return false;
  return req.user.id === ownerId || req.user.hasRole("admin");
}
