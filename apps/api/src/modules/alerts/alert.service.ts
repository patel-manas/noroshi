import { AlertRepository } from "./alert.repository.js";
import { AlertDeduplicator } from "./alert.dedupe.js";
import { IngestAlertInput } from "./alert.types.js";
import { eventBus } from "../../shared/events/event-bus.js";
import { alertsReceivedTotal } from "../../shared/telemetry/metrics.js";

export class AlertService {
  constructor(
    private repo: AlertRepository,
    private dedupe: AlertDeduplicator
  ) {}

  async ingestAlert(orgId: string, input: IngestAlertInput) {
    // 1. Check Redis dedupe cache
    const cachedAlertId = await this.dedupe.isDuplicate(orgId, input.dedupeKey);
    if (cachedAlertId) {
      alertsReceivedTotal.inc({ source: input.source, deduplicated: "true" });
      return {
        id: cachedAlertId,
        deduplicated: true,
        message: "Alert already processed (cached)",
      };
    }

    // 2. Check DB fallback (in case cache expired but DB has it)
    const existing = await this.repo.findByDedupeKey(orgId, input.dedupeKey);
    if (existing) {
      await this.dedupe.markSeen(orgId, input.dedupeKey, existing.id);
      alertsReceivedTotal.inc({ source: input.source, deduplicated: "true" });
      return {
        id: existing.id,
        deduplicated: true,
        message: "Alert already processed (db)",
      };
    }

    // 3. Insert alert
    const alert = await this.repo.createAlert({
      orgId,
      source: input.source,
      dedupeKey: input.dedupeKey,
      message: input.message,
      payload: input.payload,
    });

    // 4. Mark seen in Redis
    await this.dedupe.markSeen(orgId, input.dedupeKey, alert.id);

    // 5. Emit in-process domain event
    eventBus.emit("alert.received", {
      alertId: alert.id,
      orgId,
      source: alert.source,
      dedupeKey: alert.dedupeKey,
      message: alert.message,
      createdAt: alert.createdAt,
    });

    alertsReceivedTotal.inc({ source: input.source, deduplicated: "false" });

    return {
      id: alert.id,
      deduplicated: false,
      alert,
    };
  }

  async getAlerts(orgId: string) {
    return this.repo.getAlerts(orgId);
  }
}
