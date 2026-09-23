import { db, schema, eq, and, asc } from "../../shared/db/client.js";
import { ComponentStatus } from "./component.types.js";

export class ComponentRepository {
  async createGroup(data: {
    orgId: string;
    pageId: string;
    name: string;
    description?: string;
    orderIndex?: number;
  }) {
    const [group] = await db.insert(schema.componentGroups).values(data).returning();
    return group;
  }

  async getGroups(orgId: string, pageId: string) {
    return db
      .select()
      .from(schema.componentGroups)
      .where(
        and(
          eq(schema.componentGroups.orgId, orgId),
          eq(schema.componentGroups.pageId, pageId)
        )
      )
      .orderBy(asc(schema.componentGroups.orderIndex));
  }

  async createComponent(data: {
    orgId: string;
    pageId: string;
    groupId?: string;
    name: string;
    description?: string;
    status: ComponentStatus;
    orderIndex?: number;
  }) {
    const [comp] = await db.insert(schema.components).values(data).returning();
    return comp;
  }

  async getComponents(orgId: string, pageId: string) {
    return db
      .select()
      .from(schema.components)
      .where(
        and(
          eq(schema.components.orgId, orgId),
          eq(schema.components.pageId, pageId)
        )
      )
      .orderBy(asc(schema.components.orderIndex));
  }

  async findComponentById(orgId: string, componentId: string) {
    const [comp] = await db
      .select()
      .from(schema.components)
      .where(
        and(
          eq(schema.components.orgId, orgId),
          eq(schema.components.id, componentId)
        )
      )
      .limit(1);
    return comp || null;
  }

  async updateComponentStatus(orgId: string, componentId: string, status: ComponentStatus) {
    const [updated] = await db
      .update(schema.components)
      .set({ status, updatedAt: new Date() })
      .where(
        and(
          eq(schema.components.orgId, orgId),
          eq(schema.components.id, componentId)
        )
      )
      .returning();
    return updated;
  }
}
