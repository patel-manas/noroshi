import { pgTable, uuid, varchar, text, jsonb, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { organizations } from "./orgs.js";

export const alerts = pgTable(
  "alerts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    source: varchar("source", { length: 100 }).notNull(), // 'datadog' | 'prometheus' | 'cloudwatch' | 'pagerduty' | etc.
    dedupeKey: varchar("dedupe_key", { length: 255 }).notNull(),
    message: text("message").notNull(),
    payload: jsonb("payload"),
    status: varchar("status", { length: 50 }).default("received").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("alert_org_dedupe_idx").on(table.orgId, table.dedupeKey),
    index("alerts_org_idx").on(table.orgId),
  ]
);

export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
