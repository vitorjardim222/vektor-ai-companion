#!/usr/bin/env bash
# =============================================================
# VEKTOR A.I — Pull latest from GitHub and redeploy ONLY VEKTOR
# Usage:  bash deploy/scripts/update.sh
# Does NOT touch ic-postgresql-aIFq / ic-redis-zf84 / ic-evolutionapi-8nZx
# =============================================================
set -euo pipefail

APP_DIR="/opt/vektor-ai"
COMPOSE="docker compose -f docker-compose.prod.yml"

cd "$APP_DIR"

git pull --ff-only

# Rebuild + restart only VEKTOR containers (vektor-frontend, vektor-backend)
$COMPOSE up -d --build vektor-backend vektor-frontend

# Apply any new Prisma migrations
docker exec vektor-backend npx prisma migrate deploy

$COMPOSE ps
echo "[update] Done."
