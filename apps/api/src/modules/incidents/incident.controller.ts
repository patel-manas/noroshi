import { FastifyRequest, FastifyReply } from "fastify";
import { IncidentService } from "./incident.service.js";
import { AuthService } from "../auth/auth.service.js";
import {
  CreateIncidentSchema,
  UpdateIncidentStatusSchema,
  AddIncidentUpdateSchema,
} from "./incident.types.js";
import { IncidentStatus } from "./incident-state-machine.js";

export class IncidentController {
  constructor(
    private service: IncidentService,
    private authService: AuthService
  ) {}

  createIncident = async (
    req: FastifyRequest<{ Params: { orgId: string } }>,
    reply: FastifyReply
  ) => {
    const userId = req.headers["x-user-id"] as string;
    const { orgId } = req.params;
    if (!userId) {
      return reply.status(401).send({ error: "Missing x-user-id header" });
    }

    const parseResult = CreateIncidentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors });
    }

    try {
      const userContext = await this.authService.getUserContext(userId);
      const incident = await this.service.createIncident(userContext, orgId, parseResult.data);
      return reply.status(201).send(incident);
    } catch (err: any) {
      const status = err.message.includes("Forbidden") ? 403 : 400;
      return reply.status(status).send({ error: err.message });
    }
  };

  getIncidents = async (
    req: FastifyRequest<{
      Params: { orgId: string };
      Querystring: { status?: IncidentStatus };
    }>,
    reply: FastifyReply
  ) => {
    const userId = req.headers["x-user-id"] as string;
    const { orgId } = req.params;
    if (!userId) {
      return reply.status(401).send({ error: "Missing x-user-id header" });
    }

    try {
      const userContext = await this.authService.getUserContext(userId);
      const list = await this.service.getIncidents(userContext, orgId, req.query.status);
      return reply.send(list);
    } catch (err: any) {
      const status = err.message.includes("Forbidden") ? 403 : 400;
      return reply.status(status).send({ error: err.message });
    }
  };

  getIncidentDetails = async (
    req: FastifyRequest<{ Params: { orgId: string; incidentId: string } }>,
    reply: FastifyReply
  ) => {
    const userId = req.headers["x-user-id"] as string;
    const { orgId, incidentId } = req.params;
    if (!userId) {
      return reply.status(401).send({ error: "Missing x-user-id header" });
    }

    try {
      const userContext = await this.authService.getUserContext(userId);
      const details = await this.service.getIncidentDetails(userContext, orgId, incidentId);
      return reply.send(details);
    } catch (err: any) {
      const status = err.message.includes("Forbidden")
        ? 403
        : err.message.includes("not found")
        ? 404
        : 400;
      return reply.status(status).send({ error: err.message });
    }
  };

  updateStatus = async (
    req: FastifyRequest<{ Params: { orgId: string; incidentId: string } }>,
    reply: FastifyReply
  ) => {
    const userId = req.headers["x-user-id"] as string;
    const { orgId, incidentId } = req.params;
    if (!userId) {
      return reply.status(401).send({ error: "Missing x-user-id header" });
    }

    const parseResult = UpdateIncidentStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors });
    }

    try {
      const userContext = await this.authService.getUserContext(userId);
      const updated = await this.service.updateStatus(
        userContext,
        orgId,
        incidentId,
        parseResult.data
      );
      return reply.send(updated);
    } catch (err: any) {
      const status = err.message.includes("Forbidden")
        ? 403
        : err.message.includes("not found")
        ? 404
        : 400;
      return reply.status(status).send({ error: err.message });
    }
  };

  addUpdate = async (
    req: FastifyRequest<{ Params: { orgId: string; incidentId: string } }>,
    reply: FastifyReply
  ) => {
    const userId = req.headers["x-user-id"] as string;
    const { orgId, incidentId } = req.params;
    if (!userId) {
      return reply.status(401).send({ error: "Missing x-user-id header" });
    }

    const parseResult = AddIncidentUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors });
    }

    try {
      const userContext = await this.authService.getUserContext(userId);
      const details = await this.service.addUpdate(
        userContext,
        orgId,
        incidentId,
        parseResult.data
      );
      return reply.send(details);
    } catch (err: any) {
      const status = err.message.includes("Forbidden")
        ? 403
        : err.message.includes("not found")
        ? 404
        : 400;
      return reply.status(status).send({ error: err.message });
    }
  };
}
