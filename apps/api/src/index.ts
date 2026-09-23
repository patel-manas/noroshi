import { startTelemetry } from "./shared/telemetry/tracer.js";
startTelemetry();

import { buildApp } from "./app.js";
import { queryClient } from "./shared/db/client.js";
import { redis } from "./shared/redis/client.js";

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";

async function main() {
  const app = await buildApp();

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}. Shutting down gracefully...`);
    try {
      await app.close();
      await redis.quit();
      await queryClient.end();
      app.log.info("Server closed successfully.");
      process.exit(0);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  try {
    await app.listen({ port, host });
    console.log(`Noroshi API running at http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();