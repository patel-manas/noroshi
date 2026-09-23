import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 100, 3000);
  },
  lazyConnect: false,
});

redis.on("error", (err) => {
  console.error("[Redis Error]", err.message);
});

export const RedisKeys = {
  alertDedupe: (orgId: string, dedupeKey: string) => `alerts:dedupe:${orgId}:${dedupeKey}`,
  rateLimit: (key: string) => `ratelimit:${key}`,
  activeIncidents: (pageId: string) => `cache:incidents:page:${pageId}`,
  pageDraft: (pageId: string, session: string) => `page_drafts:${pageId}:${session}`,
};
