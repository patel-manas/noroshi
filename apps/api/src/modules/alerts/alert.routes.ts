import { FastifyInstance } from "fastify";
import { AlertRepository } from "./alert.repository.js";
import { AlertDeduplicator } from "./alert.dedupe.js";
import { AlertService } from "./alert.service.js";
import { AlertController } from "./alert.controller.js";
import { AuthRepository } from "../auth/auth.repository.js";
import { AuthService } from "../auth/auth.service.js";

export async function alertRoutes(fastify: FastifyInstance) {
  const repo = new AlertRepository();
  const dedupe = new AlertDeduplicator();
  const service = new AlertService(repo, dedupe);
  const authRepo = new AuthRepository();
  const authService = new AuthService(authRepo);
  const controller = new AlertController(service, authService);

  // Rate-limited webhook endpoints (e.g. 100 requests per minute)
  const webhookConfig = {
    config: {
      rateLimit: {
        max: 100,
        timeWindow: "1 minute",
      },
    },
  };

  fastify.post("/webhooks/alerts", webhookConfig, controller.ingestWebhook);
  fastify.post("/orgs/:orgId/webhooks/alerts", webhookConfig, controller.ingestWebhook);
  fastify.get("/orgs/:orgId/alerts", controller.getAlerts);
}
