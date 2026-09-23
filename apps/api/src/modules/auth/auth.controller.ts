import { FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "./auth.service.js";
import { RegisterUserSchema, LoginUserSchema, CreateOrgSchema, CreatePageSchema } from "./auth.types.js";

export class AuthController {
  constructor(private service: AuthService) {}

  register = async (req: FastifyRequest, reply: FastifyReply) => {
    const parseResult = RegisterUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors });
    }

    try {
      const result = await this.service.registerUser(parseResult.data);
      return reply.status(201).send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  };

  login = async (req: FastifyRequest, reply: FastifyReply) => {
    const parseResult = LoginUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors });
    }

    try {
      const result = await this.service.loginUser(parseResult.data);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(401).send({ error: err.message });
    }
  };

  createOrg = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return reply.status(401).send({ error: "Missing x-user-id header" });
    }

    const parseResult = CreateOrgSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors });
    }

    try {
      const userContext = await this.service.getUserContext(userId);
      const org = await this.service.createOrganization(userContext, parseResult.data);
      return reply.status(201).send(org);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  };

  createPage = async (req: FastifyRequest<{ Params: { orgId: string } }>, reply: FastifyReply) => {
    const userId = req.headers["x-user-id"] as string;
    const { orgId } = req.params;
    if (!userId) {
      return reply.status(401).send({ error: "Missing x-user-id header" });
    }

    const parseResult = CreatePageSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors });
    }

    try {
      const userContext = await this.service.getUserContext(userId);
      const page = await this.service.createPage(userContext, orgId, parseResult.data);
      return reply.status(201).send(page);
    } catch (err: any) {
      const status = err.message.includes("Forbidden") ? 403 : 400;
      return reply.status(status).send({ error: err.message });
    }
  };

  getPages = async (req: FastifyRequest<{ Params: { orgId: string } }>, reply: FastifyReply) => {
    const userId = req.headers["x-user-id"] as string;
    const { orgId } = req.params;
    if (!userId) {
      return reply.status(401).send({ error: "Missing x-user-id header" });
    }

    try {
      const userContext = await this.service.getUserContext(userId);
      const pages = await this.service.getPages(userContext, orgId);
      return reply.send(pages);
    } catch (err: any) {
      const status = err.message.includes("Forbidden") ? 403 : 400;
      return reply.status(status).send({ error: err.message });
    }
  };
}
