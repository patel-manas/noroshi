import { z } from "zod";
import { IncidentStatus } from "./incident-state-machine.js";

export const IncidentSeverityEnum = z.enum(["sev1", "sev2", "sev3"]);
export type IncidentSeverity = z.infer<typeof IncidentSeverityEnum>;

export const IncidentStatusEnum = z.enum(["triggered", "investigating", "resolved"]);

export const CreateIncidentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  severity: IncidentSeverityEnum.default("sev2"),
  status: IncidentStatusEnum.default("triggered"),
  pageIds: z.array(z.string().uuid()).default([]),
  affectedComponents: z
    .array(
      z.object({
        componentId: z.string().uuid(),
        impactStatus: z
          .enum([
            "operational",
            "degraded_performance",
            "partial_outage",
            "major_outage",
            "under_maintenance",
          ])
          .default("major_outage"),
      })
    )
    .default([]),
  affectedComponentGroups: z
    .array(
      z.object({
        groupId: z.string().uuid(),
        impactStatus: z
          .enum([
            "operational",
            "degraded_performance",
            "partial_outage",
            "major_outage",
            "under_maintenance",
          ])
          .default("major_outage"),
      })
    )
    .default([]),
});

export type CreateIncidentInput = z.infer<typeof CreateIncidentSchema>;

export const UpdateIncidentStatusSchema = z.object({
  status: IncidentStatusEnum,
  message: z.string().min(1).optional(),
});

export type UpdateIncidentStatusInput = z.infer<typeof UpdateIncidentStatusSchema>;

export const AddIncidentUpdateSchema = z.object({
  message: z.string().min(1),
  status: IncidentStatusEnum.optional(),
});

export type AddIncidentUpdateInput = z.infer<typeof AddIncidentUpdateSchema>;
