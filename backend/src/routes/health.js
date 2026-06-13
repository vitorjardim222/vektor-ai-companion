import { prisma } from "../prisma.js";

export default async function healthRoutes(fastify) {
  fastify.get("/health", async () => ({
    status: "ok",
    service: "vektor-backend",
    time: new Date().toISOString(),
  }));

  fastify.get("/health/db", async (_req, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "ok", db: "up" };
    } catch (err) {
      reply.code(503);
      return { status: "error", db: "down", message: String(err?.message ?? err) };
    }
  });
}
