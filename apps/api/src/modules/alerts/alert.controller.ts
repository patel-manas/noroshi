import { FastifyRequest, FastifyReply } from "fastify";
import { AlertService } from "./alert.service.js";
import { IngestAlertSchema } from "./alert.types.js";
import { AuthService } from "../auth/auth.service.js";
import { can } from "../../shared/auth/rbac.js";

export class AlertController {
  constructor(
    private service: AlertService,
    private authService: AuthService
  ) {}

  ingestWebhook = async (
    req: FastifyRequest<{
      Params?: { orgId?: string };
      Querystring?: { orgId?: string };
    }>,
    reply: FastifyReply
  ) => {
    const orgId =
      req.params?.orgId ||
      req.query?.orgId ||
      (req.headers["x-org-id"] as string);

    if (!orgId) {
      return reply.status(400).send({
        error: "Missing orgId. Provide via /orgs/:orgId/webhooks/alerts, ?orgId=, or x-org-id header",
      });
    }

    const parseResult = IngestAlertSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors });
    }

    try {
      const result = await this.service.ingestAlert(orgId, parseResult.data);
      const status = result.deduplicated ? 200 : 201;
      return reply.status(status).send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  };

  getAlerts = async (
    req: FastifyRequest<{ Params: { orgId: string } }>,
    reply: FastifyReply
  ) => {
    const userId = req.headers["x-user-id"] as string;
    const { orgId } = req.params;
    if (!userId) {
      return reply.status(401).send({ error: "Missing x-user-id header" });
    }

    try {
      const userContext = await this.authService.getUserContext(userId);
      if (!can(userContext, "alert:view", { orgId })) {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const list = await this.service.getAlerts(orgId);
      return reply.send(list);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  };
}
