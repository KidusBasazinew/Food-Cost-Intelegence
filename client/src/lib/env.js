import { z } from "zod";

const ClientEnvSchema = z.object({
  VITE_API_URL: z.string().url(),
});

export const clientEnv = ClientEnvSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
});
