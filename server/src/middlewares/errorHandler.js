import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/apiError.js";

export function errorHandler(err, _req, res, _next) {
  const normalized = ApiError.normalize(err);

  if (normalized.status >= 500) {
    logger.error(normalized.message, {
      code: normalized.code,
      stack: err?.stack,
    });
  }

  const errors = [];

  if (normalized.details) {
    errors.push(
      env.NODE_ENV !== "production"
        ? { code: normalized.code, details: normalized.details }
        : { code: normalized.code },
    );
  } else {
    errors.push({ code: normalized.code });
  }

  res.status(normalized.status).json({
    success: false,
    message: normalized.message,
    errors,
  });
}
