import { Response } from "express";
import { env } from "../config/env";

export function setRefreshTokenCookie(res: Response, token: string, tokenId?: string): void {
  const isProduction = env.nodeEnv === "production";
  
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/api/auth"
  });

  // Also set a non-HTTP-only tokenId cookie to locate the session quickly (not sensitive)
  if (tokenId) {
    res.cookie("refresh_token_id", tokenId, {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/api/auth"
    });
  }
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/api/auth"
  });
  res.clearCookie("refresh_token_id", {
    httpOnly: false,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/api/auth"
  });
}
