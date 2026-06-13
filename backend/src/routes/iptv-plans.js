// VEKTOR A.I — IPTV plans CRUD (per-tenant)
import { z } from "zod";
import { prisma } from "../prisma.js";

const planSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  durationDays: z.number().int().min(1).max(3650),
  price: z.number().min(0),
  currency: z.string().length(3).default("BRL"),
  connectionsLimit: z.number().int().min(1).max(100).default(1),
  trialEnabled: z.boolean().default(false),
  trialDurationHours: z.number().int().min(0).max(720).default(0),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string().min(1), sortOrder: z.number().int() })).min(1).max(200),
});

const renewalRuleSchema = z.object({
  planId: z.string().min(1).nullable().optional(),
  reminderDaysBefore: z.array(z.number().int().min(0).max(60)).max(20).default([7, 3, 1, 0]),
  overdueDaysAfter: z.array(z.number().int().min(0).max(120)).max(20).default([1, 3, 7]),
  assignedAiPoolId: z.string().max(120).nullable().optional(),
  messageTemplate: z.string().max(2000).nullable().optional(),
  active: z.boolean().default(true),
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

export default async function iptvPlanRoutes(fastify) {
  fastify.addHook("preHandler", fastify.authenticate);

  // List
  fastify.get("/organizations/:orgId/iptv-plans", async (request, reply) => {
    const { orgId } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const plans = await prisma.iptvPlan.findMany({
      where: { organizationId: orgId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return { plans };
  });

  // Create
  fastify.post("/organizations/:orgId/iptv-plans", async (request, reply) => {
    const { orgId } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const parsed = planSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input", details: parsed.error.flatten() });
    const plan = await prisma.iptvPlan.create({
      data: { ...parsed.data, organizationId: orgId },
    });
    return reply.code(201).send({ plan });
  });

  // Update
  fastify.patch("/organizations/:orgId/iptv-plans/:id", async (request, reply) => {
    const { orgId, id } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const parsed = planSchema.partial().safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input" });
    const existing = await prisma.iptvPlan.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) return reply.code(404).send({ error: "not_found" });
    const plan = await prisma.iptvPlan.update({ where: { id }, data: parsed.data });
    return { plan };
  });

  // Soft-disable (toggle active off). Real delete only when no customer plans.
  fastify.delete("/organizations/:orgId/iptv-plans/:id", async (request, reply) => {
    const { orgId, id } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const existing = await prisma.iptvPlan.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) return reply.code(404).send({ error: "not_found" });
    const inUse = await prisma.iptvCustomerPlan.count({ where: { planId: id } });
    if (inUse > 0) {
      const plan = await prisma.iptvPlan.update({ where: { id }, data: { active: false } });
      return { plan, disabled: true };
    }
    await prisma.iptvPlan.delete({ where: { id } });
    return { deleted: true };
  });

  // Reorder
  fastify.post("/organizations/:orgId/iptv-plans/reorder", async (request, reply) => {
    const { orgId } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const parsed = reorderSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input" });
    await prisma.$transaction(
      parsed.data.items.map((it) =>
        prisma.iptvPlan.updateMany({
          where: { id: it.id, organizationId: orgId },
          data: { sortOrder: it.sortOrder },
        }),
      ),
    );
    return { ok: true };
  });

  // Renewal rules: list/upsert
  fastify.get("/organizations/:orgId/iptv-renewal-rules", async (request, reply) => {
    const { orgId } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const rules = await prisma.iptvRenewalRule.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "asc" },
    });
    return { rules };
  });

  fastify.post("/organizations/:orgId/iptv-renewal-rules", async (request, reply) => {
    const { orgId } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const parsed = renewalRuleSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input" });
    const rule = await prisma.iptvRenewalRule.create({
      data: { ...parsed.data, organizationId: orgId },
    });
    return reply.code(201).send({ rule });
  });

  fastify.patch("/organizations/:orgId/iptv-renewal-rules/:id", async (request, reply) => {
    const { orgId, id } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const parsed = renewalRuleSchema.partial().safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input" });
    const existing = await prisma.iptvRenewalRule.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) return reply.code(404).send({ error: "not_found" });
    const rule = await prisma.iptvRenewalRule.update({ where: { id }, data: parsed.data });
    return { rule };
  });

  fastify.delete("/organizations/:orgId/iptv-renewal-rules/:id", async (request, reply) => {
    const { orgId, id } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const existing = await prisma.iptvRenewalRule.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) return reply.code(404).send({ error: "not_found" });
    await prisma.iptvRenewalRule.delete({ where: { id } });
    return { deleted: true };
  });
}
