// VEKTOR A.I — WhatsApp sessions (per-tenant)
import { z } from "zod";
import { prisma } from "../prisma.js";
import { whatsappService } from "../services/whatsapp.js";
import { evolution } from "../services/evolution.js";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  phoneNumber: z.string().max(32).nullable().optional(),
  autoReconnect: z.boolean().optional(),
  assignedPoolId: z.string().max(120).nullable().optional(),
  assignedHumanId: z.string().max(120).nullable().optional(),
});

const updateSchema = createSchema.partial();

async function assertMembership(request, reply, organizationId) {
  const userId = request.user.sub;
  const m = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });
  if (!m) { reply.code(403).send({ error: "forbidden" }); return null; }
  return m;
}

async function loadSession(orgId, id) {
  return prisma.whatsAppSession.findFirst({ where: { id, organizationId: orgId, active: true } });
}

export default async function whatsappRoutes(fastify) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/organizations/:orgId/whatsapp/sessions", async (request, reply) => {
    const { orgId } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const sessions = await whatsappService.list(orgId);
    return { sessions, evolutionConfigured: evolution.configured() };
  });

  fastify.post("/organizations/:orgId/whatsapp/sessions", async (request, reply) => {
    const { orgId } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input", details: parsed.error.flatten() });
    const session = await whatsappService.create(orgId, parsed.data);
    return reply.code(201).send({ session });
  });

  fastify.patch("/organizations/:orgId/whatsapp/sessions/:id", async (request, reply) => {
    const { orgId, id } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input" });
    const existing = await loadSession(orgId, id);
    if (!existing) return reply.code(404).send({ error: "not_found" });
    const session = await prisma.whatsAppSession.update({ where: { id }, data: parsed.data });
    return { session };
  });

  fastify.get("/organizations/:orgId/whatsapp/sessions/:id/qrcode", async (request, reply) => {
    const { orgId, id } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const session = await loadSession(orgId, id);
    if (!session) return reply.code(404).send({ error: "not_found" });
    return whatsappService.qrCode(session);
  });

  fastify.get("/organizations/:orgId/whatsapp/sessions/:id/status", async (request, reply) => {
    const { orgId, id } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const session = await loadSession(orgId, id);
    if (!session) return reply.code(404).send({ error: "not_found" });
    const refreshed = await whatsappService.refreshStatus(session);
    return { session: refreshed };
  });

  fastify.post("/organizations/:orgId/whatsapp/sessions/:id/connect", async (request, reply) => {
    const { orgId, id } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const session = await loadSession(orgId, id);
    if (!session) return reply.code(404).send({ error: "not_found" });
    const result = await whatsappService.reconnect(session);
    return result;
  });

  fastify.post("/organizations/:orgId/whatsapp/sessions/:id/disconnect", async (request, reply) => {
    const { orgId, id } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const session = await loadSession(orgId, id);
    if (!session) return reply.code(404).send({ error: "not_found" });
    const updated = await whatsappService.disconnect(session);
    return { session: updated };
  });

  fastify.delete("/organizations/:orgId/whatsapp/sessions/:id", async (request, reply) => {
    const { orgId, id } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const session = await loadSession(orgId, id);
    if (!session) return reply.code(404).send({ error: "not_found" });
    return whatsappService.remove(session);
  });
}
