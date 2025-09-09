import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRouter from "./routes/auth";
import stadiumsRouter from "./routes/stadiums";
import eventsRouter from "./routes/events";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/logger";
import { connectWithRetry, setupGracefulShutdown } from "./utils/mongo";
import { ensureAdminUser } from "./utils/bootstrap";
import { env } from "./config/env";


dotenv.config();

const app = express();
const PORT = env.port;

// Middleware
app.use(cors({ origin: env.corsOrigins, credentials: true })); 
//app.use(requestLogger);
app.use(express.json());

// Health check route
app.get("/health", (_, res) => {
  res.json({ status: "OK", version: env.appVersion, message: "StadiPass backend running 🚀" });
});

// Hello route
app.get("/hello", (_, res) => {
  res.json({ message: "Hello from StadiPass Backend" });
});

// Connect DB with retry and graceful shutdown (optional in CI)
if (env.mongoUri) {
  connectWithRetry(env.mongoUri).then(async () => {
    try {
      await ensureAdminUser();
    } catch (e) {
      console.error("❌ Failed to ensure admin user:", e);
    }
  }).catch((err) =>
    console.error("❌ MongoDB connection error:", err)
  );
  setupGracefulShutdown();
} else {
  console.warn("⚠️  MONGO_URI not set. Skipping MongoDB connection.");
}

// Start HTTP server regardless of DB presence so health checks work in CI
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/stadiums", stadiumsRouter);
app.use("/api/events", eventsRouter);


// Error handler should be last
app.use(errorHandler);


  