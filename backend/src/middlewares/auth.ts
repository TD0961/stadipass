import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header("authorization") || req.header("Authorization");
  if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return res.status(401).json({ error: "Invalid Authorization format" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    (req as any).auth = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = (req as any).auth as { role?: string } | undefined;
  if (!auth?.role || auth.role !== "admin") {
    return res.status(403).json({ error: "Admin role required" });
  }
  return next();
}


