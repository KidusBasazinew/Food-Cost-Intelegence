import { z } from "zod";

export const registerSchema = {
  body: z.object({
    hotel: z.object({
      name: z.string().min(2).max(120),
      slug: z
        .string()
        .min(2)
        .max(120)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Invalid slug")
        .optional(),
      email: z.string().email().optional(),
      phone: z.string().min(3).max(40).optional(),
      address: z.string().min(2).max(200).optional(),
      city: z.string().min(2).max(80).optional(),
      country: z.string().min(2).max(80).optional(),
      logoUrl: z.string().url().optional(),
    }),
    user: z.object({
      firstName: z.string().min(1).max(60),
      lastName: z.string().min(1).max(60),
      email: z.string().email(),
      password: z.string().min(8).max(128),
    }),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1).max(128),
  }),
};

export const refreshSchema = {
  body: z
    .object({
      refreshToken: z.string().min(20).optional(),
    })
    .optional(),
};
