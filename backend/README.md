# VEKTOR A.I — Backend (Phase 2)

This folder is reserved for the production backend service.

## Planned stack

- Node.js + Fastify
- Prisma ORM (PostgreSQL)
- Redis + BullMQ (queues, workers)
- Evolution API integration (WhatsApp)
- AI gateway adapters (OpenRouter, Gemini, Groq)
- Multi-tenant: organizations, workspaces, users, roles, plans, usage

## Layout (target)

```
backend/
  src/
    index.js              # Fastify bootstrap
    config/               # env, logger, providers
    modules/
      auth/
      organizations/
      whatsapp/
      agents/
      crm/
      automations/
      billing/
    workers/              # BullMQ consumers
    prisma/
      schema.prisma
      migrations/
  Dockerfile
  package.json
```

The Dockerfile in this folder is wired into `docker-compose.yml` so the full
stack (frontend + backend + postgres + redis) boots with a single command
once the backend code lands.
