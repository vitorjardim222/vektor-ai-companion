#!/usr/bin/env bash
# =============================================================
# VEKTOR A.I — Pull latest from GitHub and redeploy
# Usage:  bash deploy/scripts/update.sh
# =============================================================
set -euo pipefail

APP_DIR="/opt/vektor-ai"
COMPOSE="docker compose -f docker-compose.prod.yml"

cd "$APP_DIR"
git pull --ff-only
$COMPOSE up -d --build
docker exec vektor-backend npx prisma migrate deploy
$COMPOSE ps
echo "[update] Done."
