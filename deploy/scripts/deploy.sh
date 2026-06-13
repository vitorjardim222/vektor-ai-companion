#!/usr/bin/env bash
# =============================================================
# VEKTOR A.I — First-time / full deploy on the VPS
# Usage:  sudo bash deploy/scripts/deploy.sh
# =============================================================
set -euo pipefail

APP_DIR="/opt/vektor-ai"
COMPOSE="docker compose -f docker-compose.prod.yml"

cd "$APP_DIR"

# Make sure the shared network exists (joins existing infra).
docker network inspect shared >/dev/null 2>&1 || docker network create shared

# Attach existing infra to the shared network (idempotent).
for c in ic-postgresql-aIFq ic-redis-zf84 ic-evolutionapi-8nZx; do
  docker network connect shared "$c" 2>/dev/null || true
done

if [ ! -f .env ]; then
  echo "[deploy] .env missing — copy .env.production.example to .env and fill values."
  exit 1
fi

$COMPOSE pull || true
$COMPOSE up -d --build

# Run Prisma migrations against the existing postgres.
docker exec vektor-backend npx prisma migrate deploy

$COMPOSE ps
echo "[deploy] Done. Frontend: 127.0.0.1:3011  Backend: 127.0.0.1:3012"
