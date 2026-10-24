import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import healthRoutes from "./routes/health.routes.js";
import taskRoutes from "./routes/task.routes.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: "10kb" }));

app.use("/api/health", healthRoutes);
app.use("/api/tasks", taskRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
