import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import { env } from "../config/env.js";

export function securityMiddleware() {
  const allowedOrigins = [env.CLIENT_URL, "http://localhost:5174"];
  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
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
