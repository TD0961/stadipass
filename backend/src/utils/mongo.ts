import mongoose from "mongoose";

export async function connectWithRetry(uri: string, maxRetries = 5, delayMs = 2000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      await mongoose.connect(uri);
      console.log("✅ Connected to MongoDB");
      return;
    } catch (err) {
      attempt++;
      console.error(`❌ MongoDB connection error (attempt ${attempt}/${maxRetries}):`, err);
      if (attempt >= maxRetries) throw err;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

export function setupGracefulShutdown() {
  const shutdown = async () => {
    try {
      await mongoose.connection.close();
      console.log("🛑 MongoDB connection closed. Exiting.");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}


