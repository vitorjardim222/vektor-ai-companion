import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
  organizationName: z.string().min(1).max(120),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60) || "org";
}

export default async function authRoutes(fastify) {
  fastify.post("/auth/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input", details: parsed.error.flatten() });
    const { name, email, password, organizationName } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return reply.code(409).send({ error: "email_taken" });

    const passwordHash = await bcrypt.hash(password, 10);
    const baseSlug = slugify(organizationName);
    let slug = baseSlug;
    let i = 1;
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        memberships: {
          create: {
            role: "OWNER",
            organization: {
              create: {
                name: organizationName,
                slug,
                workspaces: { create: { name: "Default", slug: "default" } },
              },
            },
          },
        },
      },
      include: { memberships: { include: { organization: true } } },
    });

    const token = fastify.jwt.sign({ sub: user.id, email: user.email });
    return reply.code(201).send({
      token,
      user: { id: user.id, email: user.email, name: user.name },
      organizations: user.memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        role: m.role,
      })),
    });
  });

  fastify.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input" });
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return reply.code(401).send({ error: "invalid_credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return reply.code(401).send({ error: "invalid_credentials" });

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const token = fastify.jwt.sign({ sub: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  });

  fastify.get("/auth/me", { preHandler: [fastify.authenticate] }, async (request) => {
    const userId = request.user.sub;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { memberships: { include: { organization: true } } },
    });
    if (!user) return { user: null };
    return {
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
      organizations: user.memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        role: m.role,
      })),
    };
  });
}
