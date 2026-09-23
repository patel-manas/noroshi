import { z } from "zod";

export const IngestAlertSchema = z.object({
  source: z.string().min(1),
  dedupeKey: z.string().min(1),
  message: z.string().min(1),
  payload: z.record(z.any()).optional(),
});

export type IngestAlertInput = z.infer<typeof IngestAlertSchema>;
