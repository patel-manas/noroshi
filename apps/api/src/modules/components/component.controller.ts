import { FastifyRequest, FastifyReply } from "fastify";
import { ComponentService } from "./component.service.js";
import {
  CreateComponentGroupSchema,
  CreateComponentSchema,
  UpdateComponentStatusSchema,
} from "./component.types.js";
import { AuthService } from "../auth/auth.service.js";

export class ComponentController {
  constructor(
    private service: ComponentService,
    private authService: AuthService
  ) {}

  createGroup = async (
    req: FastifyRequest<{ Params: { orgId: string; pageId: string } }>,
    reply: FastifyReply
  ) => {
    const userId = req.headers["x-user-id"] as string;
    const { orgId, pageId } = req.params;
    if (!userId) {
      return reply.status(401).send({ error: "Missing x-user-id header" });
    }

    const parseResult = CreateComponentGroupSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors });
    }

    try {
      const userContext = await this.authService.getUserContext(userId);
      const group = await this.service.createGroup(userContext, orgId, pageId, parseResult.data);
      return reply.status(201).send(group);
    } catch (err: any) {
      const status = err.message.includes("Forbidden") ? 403 : 400;
      return reply.status(status).send({ error: err.message });
    }
  };

  getGroups = async (
    req: FastifyRequest<{ Params: { orgId: string; pageId: string } }>,
    reply: FastifyReply
  ) => {
    const userId = req.headers["x-user-id"] as string;
    const { orgId, pageId } = req.params;
    if (!userId) {
      return reply.status(401).send({ error: "Missing x-user-id header" });
    }

    try {
      const userContext = await this.authService.getUserContext(userId);
      const groups = await this.service.getGroups(userContext, orgId, pageId);
      return reply.send(groups);
    } catch (err: any) {
      const status = err.message.includes("Forbidden") ? 403 : 400;
      return reply.status(status).send({ error: err.message });
    }
  };

  createComponent = async (
    req: FastifyRequest<{ Params: { orgId: string; pageId: string } }>,
    reply: FastifyReply
  ) => {
    const userId = req.headers["x-user-id"] as string;
    const { orgId, pageId } = req.params;
    if (!userId) {
      return reply.status(401).send({ error: "Missing x-user-id header" });
    }

    const parseResult = CreateComponentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors });
    }

    try {
      const userContext = await this.authService.getUserContext(userId);
      const comp = await this.service.createComponent(userContext, orgId, pageId, parseResult.data);
      return reply.status(201).send(comp);
    } catch (err: any) {
      const status = err.message.includes("Forbidden") ? 403 : 400;
      return reply.status(status).send({ error: err.message });
    }
  };

  getComponents = async (
    req: FastifyRequest<{ Params: { orgId: string; pageId: string } }>,
    reply: FastifyReply
  ) => {
    const userId = req.headers["x-user-id"] as string;
    const { orgId, pageId } = req.params;
    if (!userId) {
      return reply.status(401).send({ error: "Missing x-user-id header" });
    }

    try {
      const userContext = await this.authService.getUserContext(userId);
      const comps = await this.service.getComponents(userContext, orgId, pageId);
      return reply.send(comps);
    } catch (err: any) {
      const status = err.message.includes("Forbidden") ? 403 : 400;
      return reply.status(status).send({ error: err.message });
    }
  };

  updateStatus = async (
    req: FastifyRequest<{ Params: { orgId: string; componentId: string } }>,
    reply: FastifyReply
  ) => {
    const userId = req.headers["x-user-id"] as string;
    const { orgId, componentId } = req.params;
    if (!userId) {
      return reply.status(401).send({ error: "Missing x-user-id header" });
    }

    const parseResult = UpdateComponentStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors });
    }

    try {
      const userContext = await this.authService.getUserContext(userId);
      const updated = await this.service.updateStatus(
        userContext,
        orgId,
        componentId,
        parseResult.data.status
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
}
