import { FastifyInstance } from "fastify";
import { IncidentRepository } from "./incident.repository.js";
import { IncidentService } from "./incident.service.js";
import { IncidentController } from "./incident.controller.js";
import { AuthRepository } from "../auth/auth.repository.js";
import { AuthService } from "../auth/auth.service.js";

export async function incidentRoutes(fastify: FastifyInstance) {
  const repo = new IncidentRepository();
  const service = new IncidentService(repo);
  const authRepo = new AuthRepository();
  const authService = new AuthService(authRepo);
  const controller = new IncidentController(service, authService);

  fastify.post("/orgs/:orgId/incidents", controller.createIncident);
  fastify.get("/orgs/:orgId/incidents", controller.getIncidents);
  fastify.get("/orgs/:orgId/incidents/:incidentId", controller.getIncidentDetails);
  fastify.patch("/orgs/:orgId/incidents/:incidentId/status", controller.updateStatus);
  fastify.post("/orgs/:orgId/incidents/:incidentId/updates", controller.addUpdate);
}
