import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { StatusPageService } from "./status.service.js";

export async function statusRoutes(fastify: FastifyInstance) {
  const service = new StatusPageService();

  // SSR HTML endpoint
  fastify.get(
    "/status/:slug",
    async (req: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) => {
      const { slug } = req.params;
      const data = await service.getStatusPageData(slug);

      if (!data) {
        return reply.status(404).send("Status page not found");
      }

      return reply.view("status-page.ejs", data);
    }
  );

  // JSON API endpoint
  fastify.get(
    "/api/v1/status/:slug",
    async (req: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) => {
      const { slug } = req.params;
      const data = await service.getStatusPageData(slug);

      if (!data) {
        return reply.status(404).send({ error: "Status page not found" });
      }

      return reply.send(data);
    }
  );
}
