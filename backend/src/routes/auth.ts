import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User";
import { Session } from "../models/Session";
import { PasswordReset } from "../models/PasswordReset";
import { env } from "../config/env";
import { requireAuth } from "../middlewares/auth";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../utils/cookies";
import { sendEmail, getPasswordResetTemplate, getEmailVerificationTemplate } from "../services/emailService";

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

    // Generate email verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyUrl = `${env.appBaseUrl}/api/auth/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`;
    
    // Store verification token (we'll use PasswordReset model for simplicity)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours
    
    await PasswordReset.create({
      userId: user._id,
      tokenHash: await bcrypt.hash(verifyToken, 10),
      expiresAt,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // Log verification URL in non-production for testing
    if (env.nodeEnv !== "production") {
      console.log("📧 Email verification URL:", verifyUrl);
    }

    // Send verification email
    const emailTemplate = getEmailVerificationTemplate(verifyUrl, firstName);
    emailTemplate.to = email;
    await sendEmail(emailTemplate);

    return res.status(201).json({ 
      id: user._id, 
      email: user.email,
      message: "Account created. Please check your email to verify your account."
    });
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

    // Generate refresh token and token id
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const tokenId = crypto.randomUUID();
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    
    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    
    await Session.create({
      userId: user._id,
      tokenId,
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
    setRefreshTokenCookie(res, refreshToken, tokenId);

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
    const tokenId = req.cookies.refresh_token_id as string | undefined;
    if (!refreshToken) return res.status(401).json({ error: "No refresh token" });
    
    let session: any = null;
    if (tokenId) {
      session = await Session.findOne({ tokenId, revokedAt: null, expiresAt: { $gt: new Date() } });
      if (!session) return res.status(401).json({ error: "Invalid session" });
      const isValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (!isValid) return res.status(401).json({ error: "Invalid refresh token" });
    } else {
      // Backward-compatible fallback
      const sessions = await Session.find({ revokedAt: null, expiresAt: { $gt: new Date() } }).lean();
      for (const s of sessions) {
        const isValid = await bcrypt.compare(refreshToken, s.refreshTokenHash);
        if (isValid) { session = s; break; }
      }
      if (!session) return res.status(401).json({ error: "Invalid refresh token" });
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

    // Rotate refresh token
    const newRefreshToken = crypto.randomBytes(32).toString('hex');
    const newTokenId = crypto.randomUUID();
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

    await Session.findByIdAndUpdate((session as any)._id, {
      tokenId: newTokenId,
      refreshTokenHash: newRefreshTokenHash,
      expiresAt: newExpiresAt
    });

    setRefreshTokenCookie(res, newRefreshToken, newTokenId);

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
    const tokenId = req.cookies.refresh_token_id as string | undefined;
    if (refreshToken && tokenId) {
      await Session.findOneAndUpdate({ tokenId, revokedAt: null }, { revokedAt: new Date() });
    } else if (refreshToken) {
      // Fallback scan for older sessions without tokenId
      const sessions = await Session.find({ revokedAt: null }).lean();
      for (const session of sessions) {
        const isValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
        if (isValid) { await Session.findByIdAndUpdate(session._id, { revokedAt: new Date() }); break; }
      }
    }
    
    clearRefreshTokenCookie(res);
    return res.status(204).send();
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Public: request password reset
router.post("/request-reset", async (req, res) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    
    const user = await User.findOne({ email }).lean();
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({ message: "If an account with that email exists, we've sent a password reset link." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetUrl = `${env.appBaseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    // Store reset token
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes
    
    await PasswordReset.create({
      userId: user._id,
      tokenHash: await bcrypt.hash(resetToken, 10),
      expiresAt,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // Log reset URL in non-production for testing
    if (env.nodeEnv !== "production") {
      console.log("📧 Password reset URL:", resetUrl);
    }

    // Send reset email
    const emailTemplate = getPasswordResetTemplate(resetUrl, user.firstName);
    emailTemplate.to = email;
    await sendEmail(emailTemplate);

    return res.json({ message: "If an account with that email exists, we've sent a password reset link." });
  } catch (err: any) {
    if (err?.issues) return res.status(400).json({ error: "Invalid input", details: err.issues });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Public: reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, password } = z.object({
      email: z.string().email(),
      token: z.string().min(1),
      password: z.string().min(6)
    }).parse(req.body);

    // Find valid reset token
    const resetRecords = await PasswordReset.find({ 
      usedAt: null, 
      expiresAt: { $gt: new Date() } 
    }).lean();
    
    let validReset = null;
    for (const reset of resetRecords) {
      const isValid = await bcrypt.compare(token, reset.tokenHash);
      if (isValid) {
        validReset = reset;
        break;
      }
    }

    if (!validReset) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Verify user matches
    const user = await User.findById(validReset.userId);
    if (!user || user.email !== email) {
      return res.status(400).json({ error: "Invalid reset token" });
    }

    // Update password
    const passwordHash = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(user._id, { passwordHash });

    // Mark token as used
    await PasswordReset.findByIdAndUpdate(validReset._id, { usedAt: new Date() });

    // Revoke all sessions for security
    await Session.updateMany(
      { userId: user._id, revokedAt: null },
      { revokedAt: new Date() }
    );

    return res.json({ message: "Password reset successfully" });
  } catch (err: any) {
    if (err?.issues) return res.status(400).json({ error: "Invalid input", details: err.issues });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Public: verify email
router.post("/verify-email", async (req, res) => {
  try {
    const { email, token } = z.object({
      email: z.string().email(),
      token: z.string().min(1)
    }).parse(req.body);

    // Find valid verification token
    const resetRecords = await PasswordReset.find({ 
      usedAt: null, 
      expiresAt: { $gt: new Date() } 
    }).lean();
    
    let validReset = null;
    for (const reset of resetRecords) {
      const isValid = await bcrypt.compare(token, reset.tokenHash);
      if (isValid) {
        validReset = reset;
        break;
      }
    }

    if (!validReset) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    // Verify user matches
    const user = await User.findById(validReset.userId);
    if (!user || user.email !== email) {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    // Mark email as verified
    await User.findByIdAndUpdate(user._id, { emailVerifiedAt: new Date() });

    // Mark token as used
    await PasswordReset.findByIdAndUpdate(validReset._id, { usedAt: new Date() });

    return res.json({ message: "Email verified successfully" });
  } catch (err: any) {
    if (err?.issues) return res.status(400).json({ error: "Invalid input", details: err.issues });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Public: verify email via GET link
router.get("/verify-email", async (req, res) => {
  try {
    const { email, token } = z.object({
      email: z.string().email(),
      token: z.string().min(1)
    }).parse({ email: req.query.email, token: req.query.token });

    // Find valid verification token
    const resetRecords = await PasswordReset.find({ 
      usedAt: null, 
      expiresAt: { $gt: new Date() } 
    }).lean();
    
    let validReset: any = null;
    for (const reset of resetRecords) {
      const isValid = await bcrypt.compare(token as string, reset.tokenHash);
      if (isValid) {
        validReset = reset;
        break;
      }
    }

    if (!validReset) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    // Verify user matches
    const user = await User.findById(validReset.userId);
    if (!user || user.email !== email) {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    // Mark email as verified
    await User.findByIdAndUpdate(user._id, { emailVerifiedAt: new Date() });

    // Mark token as used
    await PasswordReset.findByIdAndUpdate(validReset._id, { usedAt: new Date() });

    return res.json({ message: "Email verified successfully" });
  } catch (err: any) {
    if (err?.issues) return res.status(400).json({ error: "Invalid input", details: err.issues });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Protected: resend verification email
router.post("/resend-verification", requireAuth, async (req, res) => {
  try {
    const auth = (req as any).auth as { sub?: string; email?: string } | undefined;
    if (!auth?.sub) return res.status(401).json({ error: "Unauthenticated" });
    
    const user = await User.findById(auth.sub);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (user.emailVerifiedAt) {
      return res.status(400).json({ error: "Email already verified" });
    }

    // Generate new verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyUrl = `${env.appBaseUrl}/api/auth/verify-email?token=${verifyToken}&email=${encodeURIComponent(user.email)}`;
    
    // Store verification token
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours
    
    await PasswordReset.create({
      userId: user._id,
      tokenHash: await bcrypt.hash(verifyToken, 10),
      expiresAt,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // Log verification URL in non-production for testing
    if (env.nodeEnv !== "production") {
      console.log("📧 Resend verification URL:", verifyUrl);
    }

    // Send verification email
    const emailTemplate = getEmailVerificationTemplate(verifyUrl, user.firstName);
    emailTemplate.to = user.email;
    await sendEmail(emailTemplate);

    return res.json({ message: "Verification email sent" });
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Protected: get current user from token
router.get("/me", requireAuth, async (req, res) => {
  const auth = (req as any).auth as { sub?: string; email?: string } | undefined;
  if (!auth?.sub) return res.status(401).json({ error: "Unauthenticated" });
  const user = await User.findById(auth.sub).select("email _id firstName lastName phone role emailVerifiedAt").lean();
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ 
    id: user._id, 
    email: user.email, 
    firstName: user.firstName, 
    lastName: user.lastName, 
    phone: user.phone, 
    role: user.role,
    emailVerified: !!user.emailVerifiedAt
  });
});

// OAuth callback endpoint
router.post("/oauth/callback", async (req, res) => {
  try {
    const { code, state } = z.object({
      code: z.string(),
      state: z.string()
    }).parse(req.body);

    let userInfo: any = null;

    if (state === 'google') {
      // Handle Google OAuth
      const { google } = await import('googleapis');
      const oauth2Client = new google.auth.OAuth2(
        env.googleClientId,
        env.googleClientSecret,
        `${env.appBaseUrl}/auth/callback`
      );

      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      
      userInfo = {
        email: data.email,
        firstName: data.given_name,
        lastName: data.family_name,
        provider: 'google',
        providerId: data.id
      };
    } else if (state === 'github') {
      // Handle GitHub OAuth
      const axios = (await import('axios')).default;
      const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: env.githubClientId,
        client_secret: env.githubClientSecret,
        code
      }, {
        headers: { Accept: 'application/json' }
      });

      const accessToken = tokenResponse.data.access_token;
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const primaryEmail = emailResponse.data.find((email: any) => email.primary)?.email || userResponse.data.email;

      userInfo = {
        email: primaryEmail,
        firstName: userResponse.data.name?.split(' ')[0] || userResponse.data.login,
        lastName: userResponse.data.name?.split(' ').slice(1).join(' ') || '',
        provider: 'github',
        providerId: userResponse.data.id.toString()
      };
    } else {
      return res.status(400).json({ error: 'Invalid OAuth provider' });
    }

    if (!userInfo.email) {
      return res.status(400).json({ error: 'Could not retrieve email from OAuth provider' });
    }

    // Find or create user
    let user = await User.findOne({ email: userInfo.email });
    
    if (!user) {
      // Create new user
      user = await User.create({
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        emailVerifiedAt: new Date(), // OAuth users are pre-verified
        oauthProvider: userInfo.provider,
        oauthProviderId: userInfo.providerId
      });
    } else {
      // Update existing user with OAuth info if not already set
      if (!user.oauthProvider) {
        user.oauthProvider = userInfo.provider;
        user.oauthProviderId = userInfo.providerId;
        await user.save();
      }
    }

    // Generate refresh token and token id
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const tokenId = crypto.randomUUID();
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    
    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    
    await Session.create({
      userId: user._id,
      tokenId,
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
    setRefreshTokenCookie(res, refreshToken, tokenId);

    return res.json({ 
      token: accessToken,
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: !!user.emailVerifiedAt
    });

  } catch (err: any) {
    console.error('OAuth callback error:', err);
    return res.status(500).json({ error: 'OAuth authentication failed' });
  }
});

export default router;