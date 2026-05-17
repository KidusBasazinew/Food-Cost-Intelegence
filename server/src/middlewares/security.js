import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import { env } from "../config/env.js";

export function securityMiddleware() {
  const corsOptions = {
    origin: env.CLIENT_URL,
    credentials: true,
  };

  return [
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
    cors(corsOptions),
    cookieParser(),
    compression(),
  ];
}
