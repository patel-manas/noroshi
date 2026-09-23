import { eventBus } from "../../shared/events/event-bus.js";

export function registerNotifyListeners() {
  eventBus.on("incident.created", async (payload) => {
    console.log(
      `[Domain Event: incident.created] Incident ${payload.incidentId} ('${payload.title}', ${payload.severity}) created in org ${payload.orgId}`
    );
    // In Phase 2, this will be dispatched to RabbitMQ / Notification Service
  });

  eventBus.on("incident.updated", async (payload) => {
    console.log(
      `[Domain Event: incident.updated] Incident ${payload.incidentId} transitioned from '${payload.previousStatus}' to '${payload.newStatus}'`
    );
  });

  eventBus.on("incident.resolved", async (payload) => {
    console.log(
      `[Domain Event: incident.resolved] Incident ${payload.incidentId} in org ${payload.orgId} resolved at ${payload.resolvedAt.toISOString()}`
    );
  });

  eventBus.on("alert.received", async (payload) => {
    console.log(
      `[Domain Event: alert.received] Alert ${payload.alertId} from ${payload.source} received in org ${payload.orgId} (dedupeKey: ${payload.dedupeKey})`
    );
  });

  eventBus.on("component.status_changed", async (payload) => {
    console.log(
      `[Domain Event: component.status_changed] Component ${payload.componentId} status changed from '${payload.previousStatus}' to '${payload.newStatus}'`
    );
  });
}
