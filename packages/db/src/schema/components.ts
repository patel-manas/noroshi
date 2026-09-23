import { pgTable, uuid, varchar, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { organizations } from "./orgs.js";
import { pages } from "./pages.js";

export const componentGroups = pgTable(
  "component_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    pageId: uuid("page_id")
      .references(() => pages.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    orderIndex: integer("order_index").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("comp_group_org_page_idx").on(table.orgId, table.pageId),
  ]
);

export const components = pgTable(
  "components",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    pageId: uuid("page_id")
      .references(() => pages.id, { onDelete: "cascade" })
      .notNull(),
    groupId: uuid("group_id").references(() => componentGroups.id, { onDelete: "set null" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    // operational | degraded_performance | partial_outage | major_outage | under_maintenance
    status: varchar("status", { length: 50 }).default("operational").notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("components_org_page_idx").on(table.orgId, table.pageId),
    index("components_group_idx").on(table.groupId),
  ]
);

export type ComponentGroup = typeof componentGroups.$inferSelect;
export type NewComponentGroup = typeof componentGroups.$inferInsert;
export type Component = typeof components.$inferSelect;
export type NewComponent = typeof components.$inferInsert;
