import express from "express";

import { securityMiddleware } from "./middlewares/security.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  app.use(securityMiddleware());
  app.use(requestLogger());
  app.use(rateLimiter());

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/healthz", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  // Backward compatibility + requested non-versioned routes
  app.use("/api", apiRouter);
  app.use("/api/v1", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
