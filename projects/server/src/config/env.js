import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT || 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port,
  mongoUri: process.env.MONGODB_URI,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};
