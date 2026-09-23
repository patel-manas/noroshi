import { z } from "zod";

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6).optional(),
  organizationName: z.string().min(1).optional(),
  organizationSlug: z.string().min(1).optional(),
});

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
});

export type LoginUserInput = z.infer<typeof LoginUserSchema>;

export const CreateOrgSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
});

export type CreateOrgInput = z.infer<typeof CreateOrgSchema>;

export const CreatePageSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  visibility: z.enum(["public", "private"]).default("public"),
});

export type CreatePageInput = z.infer<typeof CreatePageSchema>;
