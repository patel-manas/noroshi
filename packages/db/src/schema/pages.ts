import { pgTable, uuid, varchar, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { organizations } from "./orgs.js";
import { users } from "./users.js";

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    description: text("description"),
    visibility: varchar("visibility", { length: 20 }).default("public").notNull(), // 'public' | 'private'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("page_org_slug_unique_idx").on(table.orgId, table.slug),
  ]
);

export const pageMembers = pgTable(
  "page_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pageId: uuid("page_id")
      .references(() => pages.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: varchar("role", { length: 50 }).default("page_editor").notNull(), // 'page_admin' | 'page_editor'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("page_member_unique_idx").on(table.pageId, table.userId),
  ]
);

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type PageMember = typeof pageMembers.$inferSelect;
export type NewPageMember = typeof pageMembers.$inferInsert;
