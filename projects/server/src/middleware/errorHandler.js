import { env } from "../config/env.js";

export function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.path}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  let statusCode = error.statusCode || 500;
  let message = statusCode === 500 ? "Internal server error." : error.message;

  if (error.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Request body contains invalid JSON.";
  } else if (error.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body is too large.";
  } else if (error.name === "ValidationError" || error.name === "CastError") {
    statusCode = 400;
    message = error.message;
  } else if (error.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists.";
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    error: message,
    ...(env.nodeEnv !== "production" && statusCode >= 500
      ? { details: error.message }
      : {}),
  });
}
