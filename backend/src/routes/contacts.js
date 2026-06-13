// VEKTOR A.I — Contacts CRUD (per-tenant)
import { z } from "zod";
import { prisma } from "../prisma.js";

const contactSchema = z.object({
  name: z.string().min(1).max(160),
  phone: z.string().min(1).max(32),
  email: z.string().email().max(255).nullable().optional(),
  avatar: z.string().url().max(500).nullable().optional(),
  source: z.string().max(60).nullable().optional(),
  status: z.enum(["ativo", "inativo", "bloqueado", "lead"]).default("ativo"),
  tags: z.array(z.string().min(1).max(40)).max(30).default([]),
  notes: z.string().max(4000).nullable().optional(),
  leadStage: z.string().max(60).nullable().optional(),
  assignedUserId: z.string().max(120).nullable().optional(),
  assignedAiPoolId: z.string().max(120).nullable().optional(),
  iptvPlanId: z.string().max(120).nullable().optional(),
  iptvExpiresAt: z.string().datetime().nullable().optional(),
});

async function assertMembership(request, reply, organizationId) {
  const userId = request.user.sub;
  const m = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });
  if (!m) {
    reply.code(403).send({ error: "forbidden" });
    return null;
  }
  return m;
}

export default async function contactRoutes(fastify) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/organizations/:orgId/contacts", async (request, reply) => {
    const { orgId } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const { q, tag, status } = request.query ?? {};
    const where = { organizationId: orgId };
    if (status) where.status = status;
    if (tag) where.tags = { has: tag };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }
    const contacts = await prisma.contact.findMany({
      where,
      orderBy: [{ lastInteractionAt: "desc" }, { createdAt: "desc" }],
      take: 500,
    });
    return { contacts };
  });

  fastify.post("/organizations/:orgId/contacts", async (request, reply) => {
    const { orgId } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const parsed = contactSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input", details: parsed.error.flatten() });
    const data = { ...parsed.data, organizationId: orgId };
    if (data.iptvExpiresAt) data.iptvExpiresAt = new Date(data.iptvExpiresAt);
    const contact = await prisma.contact.create({ data });
    return reply.code(201).send({ contact });
  });

  fastify.patch("/organizations/:orgId/contacts/:id", async (request, reply) => {
    const { orgId, id } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const parsed = contactSchema.partial().safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input" });
    const existing = await prisma.contact.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) return reply.code(404).send({ error: "not_found" });
    const data = { ...parsed.data };
    if (data.iptvExpiresAt) data.iptvExpiresAt = new Date(data.iptvExpiresAt);
    const contact = await prisma.contact.update({ where: { id }, data });
    return { contact };
  });

  fastify.delete("/organizations/:orgId/contacts/:id", async (request, reply) => {
    const { orgId, id } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const existing = await prisma.contact.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) return reply.code(404).send({ error: "not_found" });
    await prisma.contact.delete({ where: { id } });
    return { deleted: true };
  });
}
