import { env } from "./env.js";

function format(level, message, meta) {
  const base = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta } : {}),
  };
  return env.NODE_ENV === "production" ? JSON.stringify(base) : base;
}

export const logger = {
  info(message, meta) {
    // eslint-disable-next-line no-console
    console.log(format("info", message, meta));
  },
  warn(message, meta) {
    // eslint-disable-next-line no-console
    console.warn(format("warn", message, meta));
  },
  error(message, meta) {
    // eslint-disable-next-line no-console
    console.error(format("error", message, meta));
  },
};
