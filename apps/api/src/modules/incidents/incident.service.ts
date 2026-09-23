import { IncidentRepository } from "./incident.repository.js";
import { CreateIncidentInput, UpdateIncidentStatusInput, AddIncidentUpdateInput } from "./incident.types.js";
import { validateStateTransition, IncidentStatus } from "./incident-state-machine.js";
import { can, UserContext } from "../../shared/auth/rbac.js";
import { eventBus } from "../../shared/events/event-bus.js";
import { redis, RedisKeys } from "../../shared/redis/client.js";
import { incidentsTotal, incidentTransitionsTotal, activeIncidentsGauge } from "../../shared/telemetry/metrics.js";

export class IncidentService {
  constructor(private repo: IncidentRepository) {}

  async createIncident(userContext: UserContext, orgId: string, input: CreateIncidentInput) {
    if (!can(userContext, "incident:create", { orgId })) {
      throw new Error("Forbidden: insufficient permissions to create incident");
    }

    const incident = await this.repo.createIncident(
      {
        orgId,
        title: input.title,
        description: input.description,
        severity: input.severity,
        status: input.status,
      },
      input.pageIds,
      input.affectedComponents,
      input.affectedComponentGroups,
      userContext.userId
    );

    // Invalidate Redis cache for each mapped page
    for (const pageId of input.pageIds) {
      await redis.del(RedisKeys.activeIncidents(pageId)).catch(() => {});
    }

    // Emit domain event
    eventBus.emit("incident.created", {
      incidentId: incident.id,
      orgId,
      title: incident.title,
      severity: incident.severity,
      status: incident.status,
      pageIds: input.pageIds,
      componentIds: input.affectedComponents.map((c) => c.componentId),
      createdAt: incident.createdAt,
    });

    // Record Prometheus Metrics
    incidentsTotal.inc({ severity: incident.severity, status: incident.status });
    activeIncidentsGauge.inc();

    return incident;
  }

  async getIncidents(userContext: UserContext, orgId: string, status?: IncidentStatus) {
    if (!can(userContext, "incident:view", { orgId })) {
      throw new Error("Forbidden: insufficient permissions to view incidents");
    }
    return this.repo.getIncidents(orgId, status);
  }

  async getIncidentDetails(userContext: UserContext, orgId: string, incidentId: string) {
    if (!can(userContext, "incident:view", { orgId })) {
      throw new Error("Forbidden: insufficient permissions to view incident");
    }

    const incident = await this.repo.findIncidentById(orgId, incidentId);
    if (!incident) {
      throw new Error("Incident not found");
    }

    return incident;
  }

  async updateStatus(
    userContext: UserContext,
    orgId: string,
    incidentId: string,
    input: UpdateIncidentStatusInput
  ) {
    if (!can(userContext, "incident:update", { orgId })) {
      throw new Error("Forbidden: insufficient permissions to update incident");
    }

    const existing = await this.repo.findIncidentById(orgId, incidentId);
    if (!existing) {
      throw new Error("Incident not found");
    }

    // Validate state machine transition!
    validateStateTransition(existing.status as IncidentStatus, input.status);

    const updated = await this.repo.updateIncidentStatus(
      orgId,
      incidentId,
      input.status,
      userContext.userId,
      input.message
    );

    // Invalidate cache
    for (const pageId of existing.pageIds) {
      await redis.del(RedisKeys.activeIncidents(pageId)).catch(() => {});
    }

    // Emit domain events
    eventBus.emit("incident.updated", {
      incidentId,
      orgId,
      previousStatus: existing.status,
      newStatus: input.status,
      message: input.message,
      updatedAt: new Date(),
    });

    if (input.status === "resolved") {
      eventBus.emit("incident.resolved", {
        incidentId,
        orgId,
        resolvedAt: new Date(),
      });
      activeIncidentsGauge.dec();
    }

    // Record Prometheus Metrics
    incidentTransitionsTotal.inc({
      from_status: existing.status,
      to_status: input.status,
    });

    return updated;
  }

  async addUpdate(
    userContext: UserContext,
    orgId: string,
    incidentId: string,
    input: AddIncidentUpdateInput
  ) {
    if (!can(userContext, "incident:update", { orgId })) {
      throw new Error("Forbidden: insufficient permissions to update incident");
    }

    const existing = await this.repo.findIncidentById(orgId, incidentId);
    if (!existing) {
      throw new Error("Incident not found");
    }

    const targetStatus = input.status || (existing.status as IncidentStatus);
    if (input.status && input.status !== existing.status) {
      validateStateTransition(existing.status as IncidentStatus, input.status);
      await this.repo.updateIncidentStatus(
        orgId,
        incidentId,
        input.status,
        userContext.userId,
        input.message
      );
    } else {
      await this.repo.addUpdate(
        orgId,
        incidentId,
        input.message,
        targetStatus,
        userContext.userId
      );
    }

    // Emit event
    eventBus.emit("incident.updated", {
      incidentId,
      orgId,
      previousStatus: existing.status,
      newStatus: targetStatus,
      message: input.message,
      updatedAt: new Date(),
    });

    return this.repo.findIncidentById(orgId, incidentId);
  }
}
