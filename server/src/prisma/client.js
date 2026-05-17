import { PrismaClient } from "@prisma/client";

import { env } from "../config/env.js";

const globalForPrisma = globalThis;

function createPrismaClient() {
  return new PrismaClient({
    log:
      env.NODE_ENV === "production"
        ? ["error", "warn"]
        : ["query", "info", "warn", "error"],
  });
}

export const prisma = globalForPrisma.__prismaClient ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.__prismaClient = prisma;
}
