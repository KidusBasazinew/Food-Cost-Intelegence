import rateLimit from "express-rate-limit";

import { env } from "../config/env.js";

export function rateLimiter() {
  const isProd = env.NODE_ENV === "production";

  return rateLimit({
    windowMs: 60_000,
    limit: isProd ? 120 : 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests",
      errors: [{ code: "RATE_LIMITED" }],
    },
  });
}
