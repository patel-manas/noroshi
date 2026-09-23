import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { organizations, orgMembers } from "./orgs.js";
import { pages, pageMembers } from "./pages.js";
import { componentGroups, components } from "./components.js";
import {
  incidents,
  incidentUpdates,
  incidentPageMappings,
  incidentAffectedComponents,
  incidentAffectedComponentGroups,
} from "./incidents.js";
import { alerts } from "./alerts.js";

export const usersRelations = relations(users, ({ many }) => ({
  orgMemberships: many(orgMembers),
  pageMemberships: many(pageMembers),
  incidentUpdates: many(incidentUpdates),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(orgMembers),
  pages: many(pages),
  componentGroups: many(componentGroups),
  components: many(components),
  incidents: many(incidents),
  alerts: many(alerts),
}));

export const orgMembersRelations = relations(orgMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [orgMembers.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [orgMembers.userId],
    references: [users.id],
  }),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [pages.orgId],
    references: [organizations.id],
  }),
  members: many(pageMembers),
  componentGroups: many(componentGroups),
  components: many(components),
  incidentMappings: many(incidentPageMappings),
}));

export const pageMembersRelations = relations(pageMembers, ({ one }) => ({
  page: one(pages, {
    fields: [pageMembers.pageId],
    references: [pages.id],
  }),
  user: one(users, {
    fields: [pageMembers.userId],
    references: [users.id],
  }),
}));

export const componentGroupsRelations = relations(componentGroups, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [componentGroups.orgId],
    references: [organizations.id],
  }),
  page: one(pages, {
    fields: [componentGroups.pageId],
    references: [pages.id],
  }),
  components: many(components),
}));

export const componentsRelations = relations(components, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [components.orgId],
    references: [organizations.id],
  }),
  page: one(pages, {
    fields: [components.pageId],
    references: [pages.id],
  }),
  group: one(componentGroups, {
    fields: [components.groupId],
    references: [componentGroups.id],
  }),
  affectedIncidents: many(incidentAffectedComponents),
}));

export const incidentsRelations = relations(incidents, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [incidents.orgId],
    references: [organizations.id],
  }),
  updates: many(incidentUpdates),
  pages: many(incidentPageMappings),
  affectedComponents: many(incidentAffectedComponents),
  affectedComponentGroups: many(incidentAffectedComponentGroups),
}));

export const incidentUpdatesRelations = relations(incidentUpdates, ({ one }) => ({
  incident: one(incidents, {
    fields: [incidentUpdates.incidentId],
    references: [incidents.id],
  }),
  author: one(users, {
    fields: [incidentUpdates.authorId],
    references: [users.id],
  }),
}));

export const incidentPageMappingsRelations = relations(incidentPageMappings, ({ one }) => ({
  incident: one(incidents, {
    fields: [incidentPageMappings.incidentId],
    references: [incidents.id],
  }),
  page: one(pages, {
    fields: [incidentPageMappings.pageId],
    references: [pages.id],
  }),
}));

export const incidentAffectedComponentsRelations = relations(incidentAffectedComponents, ({ one }) => ({
  incident: one(incidents, {
    fields: [incidentAffectedComponents.incidentId],
    references: [incidents.id],
  }),
  component: one(components, {
    fields: [incidentAffectedComponents.componentId],
    references: [components.id],
  }),
}));

export const incidentAffectedComponentGroupsRelations = relations(incidentAffectedComponentGroups, ({ one }) => ({
  incident: one(incidents, {
    fields: [incidentAffectedComponentGroups.incidentId],
    references: [incidents.id],
  }),
  group: one(componentGroups, {
    fields: [incidentAffectedComponentGroups.groupId],
    references: [componentGroups.id],
  }),
}));
