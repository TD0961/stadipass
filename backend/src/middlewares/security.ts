import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: {
      production: 5,
      development: 20,
      test: 100
    }
  },
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: {
      production: 100,
      development: 500,
      test: 1000
    }
  }
};

// Request ID middleware
export function requestId(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  req.headers['x-request-id'] = requestId;
  res.set('x-request-id', requestId);
  (req as any).requestId = requestId;
  next();
}

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Rate limiting for auth routes - environment-aware
export const authRateLimit = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.auth.windowMs,
  max: RATE_LIMIT_CONFIG.auth.max[env.NODE_ENV as keyof typeof RATE_LIMIT_CONFIG.auth.max] || RATE_LIMIT_CONFIG.auth.max.production,
  message: { error: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for CI/test users and localhost
  skip: (req) => {
    const email = req.body?.email;
    const ip = req.ip || req.connection.remoteAddress;
    
    // Skip for test users
    if (email && (email.includes('@example.com') || email.includes('ciuser-'))) {
      return true;
    }
    
    // Skip for localhost/CI environments
    if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || 
        req.get('host')?.includes('localhost') || 
        env.NODE_ENV === 'test') {
      return true;
    }
    
    return false;
  },
});

// Rate limiting for general API - environment-aware
export const apiRateLimit = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.api.windowMs,
  max: RATE_LIMIT_CONFIG.api.max[env.NODE_ENV as keyof typeof RATE_LIMIT_CONFIG.api.max] || RATE_LIMIT_CONFIG.api.max.production,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
