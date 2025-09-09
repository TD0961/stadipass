import dotenv from "dotenv";

dotenv.config();

function parseCorsOrigins(raw: string | undefined): string[] {
  if (!raw) return ["http://localhost:5173", "http://localhost:3000"];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || "5000",
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
  appVersion: process.env.APP_VERSION || "dev",
} as const;


