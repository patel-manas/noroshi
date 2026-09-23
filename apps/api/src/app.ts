import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import view from "@fastify/view";
import ejs from "ejs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { redis } from "./shared/redis/client.js";
import { registerNotifyListeners } from "./modules/notify/notify.listener.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { componentRoutes } from "./modules/components/component.routes.js";
import { incidentRoutes } from "./modules/incidents/incident.routes.js";
import { alertRoutes } from "./modules/alerts/alert.routes.js";
import { statusRoutes } from "./modules/status/status.routes.js";

import { getActiveTraceContext } from "./shared/telemetry/tracer.js";
import { metricsRegistry, httpRequestDurationMicroseconds } from "./shared/telemetry/metrics.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      mixin() {
        const traceCtx = getActiveTraceContext();
        return {
          trace_id: traceCtx.trace_id,
          span_id: traceCtx.span_id,
        };
      },
    },
  });

  // Track HTTP duration for Prometheus
  app.addHook("onRequest", async (req) => {
    (req as any).startTime = process.hrtime();
  });

  app.addHook("onResponse", async (req, reply) => {
    const startTime = (req as any).startTime;
    if (startTime) {
      const diff = process.hrtime(startTime);
      const durationSeconds = diff[0] + diff[1] / 1e9;
      const route = req.routeOptions?.url || req.url;
      httpRequestDurationMicroseconds
        .labels(req.method, route, String(reply.statusCode))
        .observe(durationSeconds);
    }
  });

  // Prometheus Metrics endpoint
  app.get("/metrics", async (_req, reply) => {
    reply.header("Content-Type", metricsRegistry.contentType);
    return metricsRegistry.metrics();
  });

  // Enable CORS
  await app.register(cors, {
    origin: true,
  });

  // Enable Rate Limiting using shared Redis instance
  await app.register(rateLimit, {
    redis: redis,
    max: 1000,
    timeWindow: "1 minute",
  });

  // Enable SSR Template Rendering with EJS
  await app.register(view, {
    engine: {
      ejs,
    },
    root: path.join(__dirname, "views"),
  });

  // Healthcheck endpoint
  app.get("/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  });

  // Register domain event listeners
  registerNotifyListeners();

  // Register modular routes under /api/v1
  await app.register(authRoutes, { prefix: "/api/v1" });
  await app.register(componentRoutes, { prefix: "/api/v1" });
  await app.register(incidentRoutes, { prefix: "/api/v1" });
  await app.register(alertRoutes, { prefix: "/api/v1" });

  // Webhook direct route (e.g. POST /webhooks/alerts)
  await app.register(alertRoutes);

  // Status page SSR route (/status/:slug)
  await app.register(statusRoutes);

  // Global Error Handler
  app.setErrorHandler((error: any, request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      error: error.name || "InternalServerError",
      message: error.message || "An unexpected error occurred",
    });
  });

  return app;
}
