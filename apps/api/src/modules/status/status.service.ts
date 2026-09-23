import { db, schema, eq, and, desc, inArray } from "../../shared/db/client.js";

export class StatusPageService {
  async getStatusPageData(slug: string) {
    // 1. Find page by slug
    const [page] = await db
      .select()
      .from(schema.pages)
      .where(eq(schema.pages.slug, slug))
      .limit(1);

    if (!page) {
      return null;
    }

    // 2. Fetch organization
    const [org] = await db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.id, page.orgId))
      .limit(1);

    // 3. Fetch component groups and components
    const groups = await db
      .select()
      .from(schema.componentGroups)
      .where(
        and(
          eq(schema.componentGroups.orgId, page.orgId),
          eq(schema.componentGroups.pageId, page.id)
        )
      )
      .orderBy(schema.componentGroups.orderIndex);

    const components = await db
      .select()
      .from(schema.components)
      .where(
        and(
          eq(schema.components.orgId, page.orgId),
          eq(schema.components.pageId, page.id)
        )
      )
      .orderBy(schema.components.orderIndex);

    // 4. Fetch incident mappings for this page
    const mappings = await db
      .select()
      .from(schema.incidentPageMappings)
      .where(
        and(
          eq(schema.incidentPageMappings.orgId, page.orgId),
          eq(schema.incidentPageMappings.pageId, page.id)
        )
      );

    const incidentIds = mappings.map((m) => m.incidentId);

    let activeIncidents: any[] = [];
    let pastIncidents: any[] = [];

    if (incidentIds.length > 0) {
      const pageIncidents = await db
        .select()
        .from(schema.incidents)
        .where(
          and(
            eq(schema.incidents.orgId, page.orgId),
            inArray(schema.incidents.id, incidentIds)
          )
        )
        .orderBy(desc(schema.incidents.createdAt));

      // Fetch all updates for these incidents
      const updates = await db
        .select()
        .from(schema.incidentUpdates)
        .where(
          and(
            eq(schema.incidentUpdates.orgId, page.orgId),
            inArray(schema.incidentUpdates.incidentId, incidentIds)
          )
        )
        .orderBy(desc(schema.incidentUpdates.createdAt));

      const updatesByIncident = updates.reduce((acc, u) => {
        acc[u.incidentId] = acc[u.incidentId] || [];
        acc[u.incidentId].push(u);
        return acc;
      }, {} as Record<string, typeof updates>);

      for (const inc of pageIncidents) {
        const enriched = {
          ...inc,
          updates: updatesByIncident[inc.id] || [],
        };
        if (inc.status === "resolved") {
          pastIncidents.push(enriched);
        } else {
          activeIncidents.push(enriched);
        }
      }
    }

    // 5. Compute overall system status
    let overallStatus: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance" = "operational";
    let statusHeadline = "All Systems Operational";
    let statusDescription = "All services and APIs are running normally without disruption.";

    const hasMajor = components.some((c) => c.status === "major_outage") || activeIncidents.some((i) => i.severity === "sev1");
    const hasPartial = components.some((c) => c.status === "partial_outage") || activeIncidents.some((i) => i.severity === "sev2");
    const hasDegraded = components.some((c) => c.status === "degraded_performance");
    const hasMaintenance = components.some((c) => c.status === "under_maintenance");

    if (hasMajor) {
      overallStatus = "major_outage";
      statusHeadline = "Major System Outage";
      statusDescription = "We are currently experiencing widespread service disruptions.";
    } else if (hasPartial) {
      overallStatus = "partial_outage";
      statusHeadline = "Partial System Outage";
      statusDescription = "Some services and functionalities are experiencing downtime.";
    } else if (hasDegraded) {
      overallStatus = "degraded";
      statusHeadline = "Degraded Performance";
      statusDescription = "Some services are experiencing elevated latency or transient errors.";
    } else if (hasMaintenance) {
      overallStatus = "maintenance";
      statusHeadline = "Scheduled Maintenance";
      statusDescription = "Routine maintenance is currently underway.";
    }

    // Group components under their respective groups
    const ungroupedComponents = components.filter((c) => !c.groupId);
    const groupedComponents = groups.map((g) => ({
      ...g,
      components: components.filter((c) => c.groupId === g.id),
    }));

    return {
      page,
      org,
      overallStatus,
      statusHeadline,
      statusDescription,
      groupedComponents,
      ungroupedComponents,
      activeIncidents,
      pastIncidents,
    };
  }
}
