import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import mongoose from "mongoose";

let httpServer;
let shuttingDown = false;

async function startServer() {
  await connectDatabase();

  httpServer = app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received. Shutting down gracefully.`);

  try {
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => (error ? reject(error) : resolve()));
      });
    }
    await mongoose.disconnect();
    process.exitCode = 0;
  } catch (error) {
    console.error("Graceful shutdown failed.", error);
    process.exitCode = 1;
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer().catch((error) => {
  console.error("Server startup failed.", error);
  process.exitCode = 1;
});
