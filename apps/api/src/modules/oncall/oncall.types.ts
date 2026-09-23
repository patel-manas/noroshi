import { z } from "zod";

export const OnCallScheduleSchema = z.object({
  name: z.string().min(1),
  timezone: z.string().default("UTC"),
  currentUserId: z.string().uuid().optional(),
});

export type OnCallScheduleInput = z.infer<typeof OnCallScheduleSchema>;
