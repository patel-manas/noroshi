import { z } from "zod";

export const ComponentStatusEnum = z.enum([
  "operational",
  "degraded_performance",
  "partial_outage",
  "major_outage",
  "under_maintenance",
]);

export type ComponentStatus = z.infer<typeof ComponentStatusEnum>;

export const CreateComponentGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  orderIndex: z.number().int().default(0),
});

export type CreateComponentGroupInput = z.infer<typeof CreateComponentGroupSchema>;

export const CreateComponentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  groupId: z.string().uuid().optional(),
  status: ComponentStatusEnum.default("operational"),
  orderIndex: z.number().int().default(0),
});

export type CreateComponentInput = z.infer<typeof CreateComponentSchema>;

export const UpdateComponentStatusSchema = z.object({
  status: ComponentStatusEnum,
});

export type UpdateComponentStatusInput = z.infer<typeof UpdateComponentStatusSchema>;
