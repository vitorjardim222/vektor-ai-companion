// VEKTOR A.I — Backend entrypoint (Fastify)
import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";

import { env } from "./env.js";
import authPlugin from "./plugins/auth.js";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import organizationRoutes from "./routes/organizations.js";
import iptvPlanRoutes from "./routes/iptv-plans.js";
import contactRoutes from "./routes/contacts.js";
import analyticsRoutes from "./routes/analytics.js";
import whatsappRoutes from "./routes/whatsapp.js";
import evolutionWebhookRoutes from "./routes/webhooks-evolution.js";

const app = Fastify({
  logger: { level: env.NODE_ENV === "production" ? "info" : "debug" },
});

await app.register(cors, { origin: true, credentials: true });
await app.register(sensible);
await app.register(authPlugin, { secret: env.JWT_SECRET });

await app.register(healthRoutes, { prefix: "/api" });
await app.register(authRoutes, { prefix: "/api" });
await app.register(organizationRoutes, { prefix: "/api" });
await app.register(iptvPlanRoutes, { prefix: "/api" });
await app.register(contactRoutes, { prefix: "/api" });
await app.register(analyticsRoutes, { prefix: "/api" });
await app.register(whatsappRoutes, { prefix: "/api" });
await app.register(evolutionWebhookRoutes, { prefix: "/api" });

app.get("/", async () => ({ service: "vektor-backend", status: "ok" }));

try {
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  app.log.info(`[vektor-backend] listening on :${env.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
