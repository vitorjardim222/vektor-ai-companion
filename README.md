# VEKTOR A.I

> Automate. Engage. Scale.
>
> Enterprise WhatsApp automation platform with AI agents, CRM, intelligent
> automations and white-label. Built multi-tenant, Docker-ready, and prepared
> to run on your own VPS.

---

## Repository layout

```
.
├── src/                    # Frontend — TanStack Start (React + TS + Tailwind)
│   ├── routes/             # File-based routing (landing, auth, dashboard, modules)
│   ├── components/         # UI + shadcn primitives
│   ├── lib/                # Client + server function helpers
│   └── styles.css          # Design system (dark premium, electric blue, neon cyan)
├── backend/                # Backend — Fastify + Prisma + BullMQ (phase 2)
│   ├── src/
│   ├── Dockerfile
│   └── README.md
├── Dockerfile              # Frontend image
├── docker-compose.yml      # Full stack: frontend + backend + postgres + redis
├── .env.example            # All environment variables, documented
├── .dockerignore
└── README.md
```

The frontend and backend are **fully decoupled** so they can be deployed,
scaled and updated independently. No vendor lock-in.

---

## Tech stack

**Frontend**
- React 19 + TypeScript + Vite 7
- TanStack Start (SSR + file-based routing)
- TailwindCSS v4 + shadcn/ui
- Design system: dark premium / electric blue / neon cyan

**Backend (phase 2)**
- Node.js + Fastify
- PostgreSQL + Prisma ORM
- Redis + BullMQ (queues, workers)
- Evolution API (WhatsApp)
- AI: OpenRouter, Gemini, Groq

**Infrastructure**
- Docker + Docker Compose
- Nginx / OpenResty (recommended reverse proxy)
- Designed for any VPS (Hetzner, DigitalOcean, AWS, etc.)

---

## Quick start — local development

```bash
# 1. Install deps
bun install

# 2. Run frontend dev server
bun run dev
```

Open http://localhost:3000.

---

## Production — Docker

```bash
# 1. Configure environment
cp .env.example .env
# edit .env with your real secrets

# 2. Build and start the full stack
docker compose up -d --build

# 3. Check status
docker compose ps
docker compose logs -f frontend
```

Services:

| Service   | Port | Description                     |
| --------- | ---- | ------------------------------- |
| frontend  | 3000 | TanStack Start SSR              |
| backend   | 4000 | Fastify API (phase 2 scaffold)  |
| postgres  | 5432 | PostgreSQL 16                   |
| redis     | 6379 | Redis 7 (queues, cache)         |

Put Nginx (or Cloudflare) in front to terminate TLS and route
`yourdomain.com → frontend:3000` and `api.yourdomain.com → backend:4000`.

---

## Updating in production (GitHub-based deployment)

The repository is structured for zero-friction Git-based deploys:

```bash
# On your VPS
git pull
docker compose up -d --build
```

That's it. Containers are rebuilt with the new code and rolled.

For zero-downtime, run behind Nginx with two instances and switch upstream.

---

## Environment variables

All configuration is centralized in `.env`. See `.env.example` for the full
list, grouped by concern:

- **App** — URL, name, environment
- **Frontend / Backend** — ports, JWT/session secrets
- **PostgreSQL** — credentials and connection string
- **Redis** — connection
- **AI providers** — OpenRouter, Gemini, Groq keys
- **WhatsApp** — Evolution API URL and key
- **SMTP** — outgoing email

Never commit `.env` — only `.env.example` is tracked.

---

## Roadmap

- [x] **Phase 1** — Premium landing, auth pages, dashboard shell, all module
      routes, design system, Docker scaffolding
- [ ] **Phase 2** — Fastify backend, Prisma schema (multi-tenant), auth, RBAC
- [ ] **Phase 3** — WhatsApp via Evolution API, multi-session inbox
- [ ] **Phase 4** — AI agents (OpenRouter / Gemini / Groq), audio transcription
- [ ] **Phase 5** — CRM pipeline, automations engine, scheduled campaigns
- [ ] **Phase 6** — Billing (Stripe), plans, usage metering
- [ ] **Phase 7** — White-label (custom domains, branding), Super Admin

---

## License

Proprietary © VEKTOR A.I
