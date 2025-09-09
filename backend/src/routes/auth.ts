import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { env } from "../config/env";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().optional()
});

// Public: signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = signupSchema.parse(req.body);

    const existing = await User.findOne({ email }).lean();
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, firstName, lastName, phone });

    return res.status(201).json({ id: user._id, email: user.email });
  } catch (err: any) {
    if ((err as any)?.issues) return res.status(400).json({ error: "Invalid input", details: (err as any).issues });
    return res.status(500).json({ error: "Internal server error" });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// Public: login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { sub: (user._id as any).toString(), email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: "1h" }
    );

    return res.json({ token });
  } catch (err: any) {
    if ((err as any)?.issues) return res.status(400).json({ error: "Invalid input", details: (err as any).issues });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Protected: get current user from token
router.get("/me", requireAuth, async (req, res) => {
  const auth = (req as any).auth as { sub?: string; email?: string } | undefined;
  if (!auth?.sub) return res.status(401).json({ error: "Unauthenticated" });
  const user = await User.findById(auth.sub).select("email _id firstName lastName phone role").lean();
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, role: user.role });
});

export default router;