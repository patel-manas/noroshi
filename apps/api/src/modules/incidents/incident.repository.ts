import { db, schema, eq, and, desc } from "../../shared/db/client.js";
import { IncidentStatus } from "./incident-state-machine.js";
import { IncidentSeverity } from "./incident.types.js";

export class IncidentRepository {
  async createIncident(
    data: {
      orgId: string;
      title: string;
      description?: string;
      severity: IncidentSeverity;
      status: IncidentStatus;
    },
    pageIds: string[],
    affectedComponents: { componentId: string; impactStatus: string }[],
    affectedComponentGroups: { groupId: string; impactStatus: string }[],
    authorId?: string
  ) {
    return await db.transaction(async (tx) => {
      // 1. Create incident
      const [incident] = await tx
        .insert(schema.incidents)
        .values({
          orgId: data.orgId,
          title: data.title,
          description: data.description,
          severity: data.severity,
          status: data.status,
          resolvedAt: data.status === "resolved" ? new Date() : null,
        })
        .returning();

      // 2. Create initial timeline update
      await tx.insert(schema.incidentUpdates).values({
        incidentId: incident.id,
        orgId: data.orgId,
        authorId: authorId || null,
        message: data.description || `Incident created with status ${data.status}`,
        status: data.status,
      });

      // 3. Map pages
      if (pageIds.length > 0) {
        await tx.insert(schema.incidentPageMappings).values(
          pageIds.map((pageId) => ({
            incidentId: incident.id,
            pageId,
            orgId: data.orgId,
          }))
        );
      }

      // 4. Map affected components
      if (affectedComponents.length > 0) {
        await tx.insert(schema.incidentAffectedComponents).values(
          affectedComponents.map((c) => ({
            incidentId: incident.id,
            componentId: c.componentId,
            orgId: data.orgId,
            impactStatus: c.impactStatus,
          }))
        );

        // Update component statuses in the component table
        for (const c of affectedComponents) {
          await tx
            .update(schema.components)
            .set({ status: c.impactStatus, updatedAt: new Date() })
            .where(
              and(
                eq(schema.components.orgId, data.orgId),
                eq(schema.components.id, c.componentId)
              )
            );
        }
      }

      // 5. Map affected component groups
      if (affectedComponentGroups.length > 0) {
        await tx.insert(schema.incidentAffectedComponentGroups).values(
          affectedComponentGroups.map((g) => ({
            incidentId: incident.id,
            groupId: g.groupId,
            orgId: data.orgId,
            impactStatus: g.impactStatus,
          }))
        );

        // Also update all components in those groups
        for (const g of affectedComponentGroups) {
          await tx
            .update(schema.components)
            .set({ status: g.impactStatus, updatedAt: new Date() })
            .where(
              and(
                eq(schema.components.orgId, data.orgId),
                eq(schema.components.groupId, g.groupId)
              )
            );
        }
      }

      return incident;
    });
  }

  async getIncidents(orgId: string, status?: IncidentStatus) {
    const query = db
      .select()
      .from(schema.incidents)
      .where(
        status
          ? and(eq(schema.incidents.orgId, orgId), eq(schema.incidents.status, status))
          : eq(schema.incidents.orgId, orgId)
      )
      .orderBy(desc(schema.incidents.createdAt));

    return query;
  }

  async findIncidentById(orgId: string, incidentId: string) {
    const [incident] = await db
      .select()
      .from(schema.incidents)
      .where(
        and(eq(schema.incidents.orgId, orgId), eq(schema.incidents.id, incidentId))
      )
      .limit(1);

    if (!incident) return null;

    // Fetch related timeline updates, mapped pages, and affected components
    const updates = await db
      .select()
      .from(schema.incidentUpdates)
      .where(
        and(
          eq(schema.incidentUpdates.orgId, orgId),
          eq(schema.incidentUpdates.incidentId, incidentId)
        )
      )
      .orderBy(desc(schema.incidentUpdates.createdAt));

    const pageMappings = await db
      .select()
      .from(schema.incidentPageMappings)
      .where(
        and(
          eq(schema.incidentPageMappings.orgId, orgId),
          eq(schema.incidentPageMappings.incidentId, incidentId)
        )
      );

    const affectedComps = await db
      .select()
      .from(schema.incidentAffectedComponents)
      .where(
        and(
          eq(schema.incidentAffectedComponents.orgId, orgId),
          eq(schema.incidentAffectedComponents.incidentId, incidentId)
        )
      );

    const affectedGroups = await db
      .select()
      .from(schema.incidentAffectedComponentGroups)
      .where(
        and(
          eq(schema.incidentAffectedComponentGroups.orgId, orgId),
          eq(schema.incidentAffectedComponentGroups.incidentId, incidentId)
        )
      );

    return {
      ...incident,
      updates,
      pageIds: pageMappings.map((p) => p.pageId),
      affectedComponents: affectedComps,
      affectedComponentGroups: affectedGroups,
    };
  }

  async updateIncidentStatus(
    orgId: string,
    incidentId: string,
    newStatus: IncidentStatus,
    authorId?: string,
    message?: string
  ) {
    return await db.transaction(async (tx) => {
      const isResolved = newStatus === "resolved";

      const [updated] = await tx
        .update(schema.incidents)
        .set({
          status: newStatus,
          updatedAt: new Date(),
          resolvedAt: isResolved ? new Date() : null,
        })
        .where(
          and(eq(schema.incidents.orgId, orgId), eq(schema.incidents.id, incidentId))
        )
        .returning();

      // Add timeline update
      await tx.insert(schema.incidentUpdates).values({
        incidentId,
        orgId,
        authorId: authorId || null,
        message: message || `Status changed to ${newStatus}`,
        status: newStatus,
      });

      // If resolving incident, restore affected components back to 'operational'
      if (isResolved) {
        const affComps = await tx
          .select()
          .from(schema.incidentAffectedComponents)
          .where(
            and(
              eq(schema.incidentAffectedComponents.orgId, orgId),
              eq(schema.incidentAffectedComponents.incidentId, incidentId)
            )
          );

        for (const comp of affComps) {
          await tx
            .update(schema.components)
            .set({ status: "operational", updatedAt: new Date() })
            .where(
              and(
                eq(schema.components.orgId, orgId),
                eq(schema.components.id, comp.componentId)
              )
            );
        }

        const affGroups = await tx
          .select()
          .from(schema.incidentAffectedComponentGroups)
          .where(
            and(
              eq(schema.incidentAffectedComponentGroups.orgId, orgId),
              eq(schema.incidentAffectedComponentGroups.incidentId, incidentId)
            )
          );

        for (const group of affGroups) {
          await tx
            .update(schema.components)
            .set({ status: "operational", updatedAt: new Date() })
            .where(
              and(
                eq(schema.components.orgId, orgId),
                eq(schema.components.groupId, group.groupId)
              )
            );
        }
      }

      return updated;
    });
  }

  async addUpdate(orgId: string, incidentId: string, message: string, status: IncidentStatus, authorId?: string) {
    const [update] = await db
      .insert(schema.incidentUpdates)
      .values({
        incidentId,
        orgId,
        message,
        status,
        authorId: authorId || null,
      })
      .returning();
    return update;
  }
}
