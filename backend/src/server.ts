import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRouter from "./routes/auth";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/logger";
import { connectWithRetry, setupGracefulShutdown } from "./utils/mongo";


dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"], credentials: true })); 
//app.use(requestLogger);
app.use(express.json());

// Health check route
app.get("/health", (_, res) => {
  res.json({ status: "OK", message: "StadiPass backend running 🚀" });
});

// Hello route
app.get("/hello", (_, res) => {
  res.json({ message: "Hello from StadiPass Backend" });
});

// Connect DB with retry and graceful shutdown
if (process.env.MONGO_URI) {
  connectWithRetry(process.env.MONGO_URI).catch((err) =>
    console.error("❌ MongoDB connection error:", err)
  );
  setupGracefulShutdown();
  app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
} else {
  console.warn("⚠️  MONGO_URI not set. Skipping MongoDB connection.");
}

// Routes
app.use("/api/auth", authRouter);


// Error handler should be last
app.use(errorHandler);


  