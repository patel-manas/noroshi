import { FastifyInstance } from "fastify";
import { AuthRepository } from "./auth.repository.js";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";

export async function authRoutes(fastify: FastifyInstance) {
  const repo = new AuthRepository();
  const service = new AuthService(repo);
  const controller = new AuthController(service);

  fastify.post("/auth/register", controller.register);
  fastify.post("/auth/login", controller.login);
  fastify.post("/orgs", controller.createOrg);
  fastify.post("/orgs/:orgId/pages", controller.createPage);
  fastify.get("/orgs/:orgId/pages", controller.getPages);
}
