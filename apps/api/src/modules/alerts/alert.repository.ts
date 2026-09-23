import { db, schema, eq, and, desc } from "../../shared/db/client.js";

export class AlertRepository {
  async findByDedupeKey(orgId: string, dedupeKey: string) {
    const [alert] = await db
      .select()
      .from(schema.alerts)
      .where(
        and(eq(schema.alerts.orgId, orgId), eq(schema.alerts.dedupeKey, dedupeKey))
      )
      .limit(1);
    return alert || null;
  }

  async createAlert(data: {
    orgId: string;
    source: string;
    dedupeKey: string;
    message: string;
    payload?: any;
    status?: string;
  }) {
    const [alert] = await db
      .insert(schema.alerts)
      .values({
        orgId: data.orgId,
        source: data.source,
        dedupeKey: data.dedupeKey,
        message: data.message,
        payload: data.payload,
        status: data.status || "received",
      })
      .returning();
    return alert;
  }

  async getAlerts(orgId: string, limit = 50) {
    return db
      .select()
      .from(schema.alerts)
      .where(eq(schema.alerts.orgId, orgId))
      .orderBy(desc(schema.alerts.createdAt))
      .limit(limit);
  }
}
