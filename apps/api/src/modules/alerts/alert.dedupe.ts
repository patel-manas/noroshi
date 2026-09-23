import { redis, RedisKeys } from "../../shared/redis/client.js";

export class AlertDeduplicator {
  private defaultTtlSeconds = 86400; // 24 hours

  async isDuplicate(orgId: string, dedupeKey: string): Promise<string | null> {
    const key = RedisKeys.alertDedupe(orgId, dedupeKey);
    return await redis.get(key);
  }

  async markSeen(orgId: string, dedupeKey: string, alertId: string, ttlSeconds?: number): Promise<void> {
    const key = RedisKeys.alertDedupe(orgId, dedupeKey);
    await redis.set(key, alertId, "EX", ttlSeconds || this.defaultTtlSeconds);
  }
}
