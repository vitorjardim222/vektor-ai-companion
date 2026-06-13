import { z } from "zod";
import { prisma } from "../prisma.js";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
});

export default async function organizationRoutes(fastify) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/organizations", async (request) => {
    const userId = request.user.sub;
    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: { organization: true },
    });
    return {
      organizations: memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        role: m.role,
        blocked: m.organization.blocked,
      })),
    };
  });

  fastify.post("/organizations", async (request, reply) => {
    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input" });
    const { name, slug } = parsed.data;
    const userId = request.user.sub;

    const exists = await prisma.organization.findUnique({ where: { slug } });
    if (exists) return reply.code(409).send({ error: "slug_taken" });

    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        memberships: { create: { userId, role: "OWNER" } },
        workspaces: { create: { name: "Default", slug: "default" } },
      },
    });
    return reply.code(201).send({ organization: org });
  });

  fastify.get("/organizations/:id", async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.sub;
    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: id } },
      include: { organization: { include: { workspaces: true } } },
    });
    if (!membership) return reply.code(404).send({ error: "not_found" });
    return { organization: membership.organization, role: membership.role };
  });
}
