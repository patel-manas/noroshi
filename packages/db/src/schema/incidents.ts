import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { organizations } from "./orgs.js";
import { pages } from "./pages.js";
import { users } from "./users.js";
import { components, componentGroups } from "./components.js";

export const incidents = pgTable(
  "incidents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    // triggered | investigating | resolved
    status: varchar("status", { length: 50 }).default("triggered").notNull(),
    // sev1 | sev2 | sev3
    severity: varchar("severity", { length: 20 }).default("sev2").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [
    index("incidents_org_idx").on(table.orgId),
    index("incidents_org_status_idx").on(table.orgId, table.status),
  ]
);

export const incidentUpdates = pgTable(
  "incident_updates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    incidentId: uuid("incident_id")
      .references(() => incidents.id, { onDelete: "cascade" })
      .notNull(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    message: text("message").notNull(),
    status: varchar("status", { length: 50 }).notNull(), // snapshot of incident status at this update
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("incident_updates_incident_idx").on(table.incidentId),
    index("incident_updates_org_idx").on(table.orgId),
  ]
);

export const incidentPageMappings = pgTable(
  "incident_page_mappings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    incidentId: uuid("incident_id")
      .references(() => incidents.id, { onDelete: "cascade" })
      .notNull(),
    pageId: uuid("page_id")
      .references(() => pages.id, { onDelete: "cascade" })
      .notNull(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("incident_page_incident_idx").on(table.incidentId),
    index("incident_page_page_idx").on(table.pageId),
    index("incident_page_org_idx").on(table.orgId),
  ]
);

export const incidentAffectedComponents = pgTable(
  "incident_affected_components",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    incidentId: uuid("incident_id")
      .references(() => incidents.id, { onDelete: "cascade" })
      .notNull(),
    componentId: uuid("component_id")
      .references(() => components.id, { onDelete: "cascade" })
      .notNull(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    impactStatus: varchar("impact_status", { length: 50 }).default("major_outage").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("aff_comp_incident_idx").on(table.incidentId),
    index("aff_comp_component_idx").on(table.componentId),
    index("aff_comp_org_idx").on(table.orgId),
  ]
);

export const incidentAffectedComponentGroups = pgTable(
  "incident_affected_component_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    incidentId: uuid("incident_id")
      .references(() => incidents.id, { onDelete: "cascade" })
      .notNull(),
    groupId: uuid("group_id")
      .references(() => componentGroups.id, { onDelete: "cascade" })
      .notNull(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    impactStatus: varchar("impact_status", { length: 50 }).default("major_outage").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("aff_group_incident_idx").on(table.incidentId),
    index("aff_group_group_idx").on(table.groupId),
    index("aff_group_org_idx").on(table.orgId),
  ]
);

export type Incident = typeof incidents.$inferSelect;
export type NewIncident = typeof incidents.$inferInsert;
export type IncidentUpdate = typeof incidentUpdates.$inferSelect;
export type NewIncidentUpdate = typeof incidentUpdates.$inferInsert;
export type IncidentPageMapping = typeof incidentPageMappings.$inferSelect;
export type NewIncidentPageMapping = typeof incidentPageMappings.$inferInsert;
export type IncidentAffectedComponent = typeof incidentAffectedComponents.$inferSelect;
export type NewIncidentAffectedComponent = typeof incidentAffectedComponents.$inferInsert;
export type IncidentAffectedComponentGroup = typeof incidentAffectedComponentGroups.$inferSelect;
export type NewIncidentAffectedComponentGroup = typeof incidentAffectedComponentGroups.$inferInsert;
