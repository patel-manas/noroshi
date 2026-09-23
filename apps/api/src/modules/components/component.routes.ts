import { FastifyInstance } from "fastify";
import { ComponentRepository } from "./component.repository.js";
import { ComponentService } from "./component.service.js";
import { ComponentController } from "./component.controller.js";
import { AuthRepository } from "../auth/auth.repository.js";
import { AuthService } from "../auth/auth.service.js";

export async function componentRoutes(fastify: FastifyInstance) {
  const repo = new ComponentRepository();
  const service = new ComponentService(repo);
  const authRepo = new AuthRepository();
  const authService = new AuthService(authRepo);
  const controller = new ComponentController(service, authService);

  // Component groups
  fastify.post("/orgs/:orgId/pages/:pageId/groups", controller.createGroup);
  fastify.get("/orgs/:orgId/pages/:pageId/groups", controller.getGroups);

  // Components
  fastify.post("/orgs/:orgId/pages/:pageId/components", controller.createComponent);
  fastify.get("/orgs/:orgId/pages/:pageId/components", controller.getComponents);
  fastify.patch("/orgs/:orgId/components/:componentId/status", controller.updateStatus);
}
