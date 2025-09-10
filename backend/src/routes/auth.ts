import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User";
import { Session } from "../models/Session";
import { env } from "../config/env";
import { requireAuth } from "../middlewares/auth";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../utils/cookies";

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

    // Generate refresh token
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    
    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    
    await Session.create({
      userId: user._id,
      refreshTokenHash,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      expiresAt
    });

    // Generate access token
    const accessToken = jwt.sign(
      { sub: (user._id as any).toString(), email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: "15m" }
    );

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    return res.json({ token: accessToken });
  } catch (err: any) {
    if ((err as any)?.issues) return res.status(400).json({ error: "Invalid input", details: (err as any).issues });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Public: refresh access token
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

    // Find session
    const sessions = await Session.find({ revokedAt: null, expiresAt: { $gt: new Date() } }).lean();
    let session = null;
    
    for (const s of sessions) {
      const isValid = await bcrypt.compare(refreshToken, s.refreshTokenHash);
      if (isValid) {
        session = s;
        break;
      }
    }
    
    if (!session) return res.status(401).json({ error: "Invalid refresh token" });

    // Get user
    const user = await User.findById(session.userId).lean();
    if (!user) return res.status(401).json({ error: "User not found" });

    // Generate new access token
    const accessToken = jwt.sign(
      { sub: user._id.toString(), email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: "15m" }
    );

    return res.json({ token: accessToken });
  } catch (err: any) {
    console.error("Refresh token error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// Public: logout
router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      // Revoke session
      const sessions = await Session.find({ revokedAt: null }).lean();
      for (const session of sessions) {
        const isValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
        if (isValid) {
          await Session.findByIdAndUpdate(session._id, { revokedAt: new Date() });
          break;
        }
      }
    }
    
    clearRefreshTokenCookie(res);
    return res.status(204).send();
  } catch (err: any) {
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