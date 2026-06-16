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

---

## Como testar integração real — Fase 1

A Fase 1 ativa autenticação real, organização, **contatos** e **planos IPTV** persistidos no Postgres. WhatsApp, IA, CRM e Automations seguem mockados.

1. Suba a stack completa (Postgres + backend Fastify + frontend):

```bash
docker compose up -d --build
```

2. Aplique o schema Prisma:

```bash
cd backend
npx prisma migrate dev
```

3. No frontend (`/register`), crie sua conta e workspace. Você será redirecionado para `/dashboard` com JWT armazenado e organização ativa no topbar.

4. Faça logout pelo botão no topbar e teste novamente em `/login`.

5. Vá em **Financeiro → Planos IPTV** e crie/edite/desative um plano. O dado persiste no Postgres (`IptvPlan`).

6. Vá em **Contatos** e crie um contato com plano IPTV vinculado. Edição, exclusão e busca usam o backend real (`Contact`).

Se o backend estiver fora do ar, a UI mostra **"Backend indisponível. Verifique a API."** — não há fallback silencioso para mock em create/update/delete.

Variável de ambiente do frontend (opcional): `VITE_API_BASE_URL` (padrão `/api`).

## Backend no preview da Lovable

O preview da Lovable (`*.lovable.app`) **não executa** o backend Fastify — ele só serve o frontend estático. Por isso, chamadas a `/api/*` retornam 404 e o login/registro mostra o banner amarelo "Backend não configurado".

### Testar localmente (Docker)

```bash
docker compose up -d --build
cd backend && npx prisma migrate dev
```

Acesse o frontend em `http://localhost:5173` — o proxy Vite encaminha `/api` para o Fastify em `:3000`.

### Testar no preview da Lovable (backend público)

Publique o backend Fastify em um host público (VPS, Railway, Fly.io, etc.) e configure a variável de ambiente do frontend:

```
VITE_API_BASE_URL=https://api.seu-dominio.com/api
```

Reabra o preview — o banner desaparece quando `GET ${VITE_API_BASE_URL}/health` responde 200.

---

## Deploy em VPS (produção) — reaproveitando infraestrutura existente

VEKTOR roda em containers próprios (`vektor-frontend` em `3011`, `vektor-backend` em `3012`), mas **reusa** o Postgres (`ic-postgresql-aIFq`), Redis (`ic-redis-zf84`) e Evolution API (`ic-evolutionapi-8nZx`) que já estão no VPS. Nada é exposto publicamente — o OpenResty publica tudo via HTTPS.

Arquivos relevantes:

- `docker-compose.prod.yml` — stack de produção (apenas frontend + backend)
- `.env.production.example` — variáveis com hosts/portas da infra existente
- `deploy/openresty/vektor.conf` — exemplo de reverse proxy + SSL + WebSocket
- `deploy/scripts/deploy.sh` — primeiro deploy
- `deploy/scripts/update.sh` — `git pull` + rebuild + migrate
- `deploy/scripts/backup.sh` — dump diário do Postgres

### Primeiro deploy

```bash
ssh root@vps
git clone https://github.com/SUA-ORG/vektor-ai.git /opt/vektor-ai
cd /opt/vektor-ai
cp .env.production.example .env
# editar .env com senhas reais (POSTGRES_PASSWORD, JWT_SECRET, EVOLUTION_API_KEY, ...)

# rede compartilhada com a infra existente
docker network create shared 2>/dev/null || true
docker network connect shared ic-postgresql-aIFq   2>/dev/null || true
docker network connect shared ic-redis-zf84        2>/dev/null || true
docker network connect shared ic-evolutionapi-8nZx 2>/dev/null || true

bash deploy/scripts/deploy.sh
```

OpenResty:

```bash
cp deploy/openresty/vektor.conf /etc/openresty/conf.d/vektor.conf
# ajustar server_name e caminhos do certbot
openresty -t && systemctl reload openresty
```

### Atualizações via GitHub

```bash
cd /opt/vektor-ai
bash deploy/scripts/update.sh
```

### Backup

```bash
bash deploy/scripts/backup.sh
# agendar no cron diário:
# 0 3 * * * /opt/vektor-ai/deploy/scripts/backup.sh
```

### Portas

| Serviço          | Porta interna | Exposição                   |
| ---------------- | ------------- | --------------------------- |
| vektor-frontend  | 3011          | `127.0.0.1` (OpenResty `/`) |
| vektor-backend   | 3012          | `127.0.0.1` (OpenResty `/api`) |
| Postgres / Redis | 5432 / 6379   | nunca expostos              |

---

## Deploy real na VPS vps8817

Procedimento exato para subir VEKTOR na VPS `vps8817.panel.icontainer.net`,
reaproveitando a infra já existente (Postgres `ic-postgresql-aIFq`,
Redis `ic-redis-zf84`, Evolution `ic-evolutionapi-8nZx`) sobre a rede
Docker **`icontainer-network`**.

### 1. Clonar o repositório

```bash
ssh root@vps8817
git clone https://github.com/SUA-ORG/vektor-ai.git /opt/vektor-ai
cd /opt/vektor-ai
```

### 2. Configurar `.env`

```bash
cp .env.production.example .env
nano .env
```

Preencher obrigatoriamente:

- `POSTGRES_PASSWORD` (senha do usuário `vektor` que será criado)
- `DATABASE_URL` (usar a mesma senha)
- `JWT_SECRET` e `SESSION_SECRET` (32+ chars aleatórios — `openssl rand -hex 32`)
- `EVOLUTION_API_KEY` (chave real da Evolution já em uso)

### 3. Criar database e usuário no Postgres existente

Não criamos novo container — usamos o `ic-postgresql-aIFq` já rodando.
Login admin atual: `user_mrWMXr`.

```bash
docker exec -it ic-postgresql-aIFq psql -U user_mrWMXr -d postgres -c \
  "CREATE USER vektor WITH PASSWORD 'A_MESMA_SENHA_DO_ENV';"

docker exec -it ic-postgresql-aIFq psql -U user_mrWMXr -d postgres -c \
  "CREATE DATABASE vektor OWNER vektor;"
```

### 4. Validar a rede Docker compartilhada

```bash
docker network inspect icontainer-network >/dev/null && echo OK
docker network inspect icontainer-network \
  | grep -E 'ic-postgresql-aIFq|ic-redis-zf84|ic-evolutionapi-8nZx'
```

Todos os três precisam aparecer. Se algum faltar:

```bash
docker network connect icontainer-network ic-postgresql-aIFq
docker network connect icontainer-network ic-redis-zf84
docker network connect icontainer-network ic-evolutionapi-8nZx
```

### 5. Subir o VEKTOR

```bash
bash deploy/scripts/deploy.sh
```

O script valida portas `3011/3012`, rede, conectividade com Postgres/Redis/Evolution,
faz build, sobe containers e roda `prisma migrate deploy`.

### 6. Configurar OpenResty

```bash
cp deploy/openresty/vektor.conf \
   /etc/icontainer/apps/openresty/openresty/conf/conf.d/vektor.conf

# testar e recarregar (dentro do container OpenResty do icontainer)
openresty -t && openresty -s reload
```

### 7. Validar `/api/health`

```bash
# direto no host
curl -s http://127.0.0.1:3012/api/health

# via OpenResty (subdomínio público da VPS)
curl -s http://vektor.vps8817.panel.icontainer.net/api/health
```

Resposta esperada: `{"status":"ok",...}`.

### 8. Atualizações futuras

```bash
cd /opt/vektor-ai && bash deploy/scripts/update.sh
```

Apenas os containers `vektor-frontend` e `vektor-backend` são reconstruídos —
Postgres, Redis e Evolution **não são tocados**.
