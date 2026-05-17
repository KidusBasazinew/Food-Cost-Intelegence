import morgan from "morgan";

import { env } from "../config/env.js";

export function requestLogger() {
  const format = env.NODE_ENV === "production" ? "combined" : "dev";
  return morgan(format);
}
