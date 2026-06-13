# VEKTOR A.I — Backend (Fastify + Prisma)

Real backend foundation for VEKTOR A.I. Multi-tenant SaaS with organizations,
memberships, workspaces, plans, subscriptions, usage and audit logs.

## Stack

- Node.js 20 + Fastify 4
- Prisma 5 + PostgreSQL 16
- Zod env validation
- JWT auth (`@fastify/jwt`) + bcrypt password hashing
- Docker-ready (see root `docker-compose.yml`)

## Layout

```
backend/
  prisma/schema.prisma     # User, Organization, Membership, Workspace,
                           # Plan, Subscription, UsageLog, AuditLog
  src/
    index.js               # Fastify bootstrap
    env.js                 # Zod-validated env
    prisma.js              # PrismaClient singleton
    plugins/auth.js        # JWT plugin + fastify.authenticate
    routes/
      health.js            # GET /api/health, /api/health/db
      auth.js              # POST /api/auth/register|login, GET /api/auth/me
      organizations.js     # CRUD on tenants (protected)
  Dockerfile
  package.json
```

## Local dev

```bash
cd backend
cp ../.env.example ../.env       # then edit DATABASE_URL + JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run dev
```

Server boots on `:4000`. Health: `curl localhost:4000/api/health`.

## Docker

From the repo root:

```bash
docker compose up -d --build
```

This boots `frontend + backend + postgres + redis`. On first boot the backend
runs `prisma migrate deploy` automatically (see Dockerfile `CMD`).

## Frontend integration

The frontend ships a typed API client at `src/lib/api/client.ts`. The UI
remains mock-driven; swap individual hooks to use `authApi`, `orgApi`, etc.
as endpoints come online. No existing screen is broken by this scaffold.

## Roadmap (next phases)

- BullMQ workers (Redis) for WhatsApp / AI / billing jobs
- Evolution API integration
- AI gateway adapters (OpenRouter, Gemini, Groq)
- Stripe / Mercado Pago / Asaas billing
- Role-based authorization helpers on protected routes
