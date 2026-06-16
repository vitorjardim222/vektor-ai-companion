#!/usr/bin/env bash
# =============================================================
# VEKTOR A.I — First-time / full deploy on the VPS (vps8817)
# Usage:  sudo bash deploy/scripts/deploy.sh
# =============================================================
set -euo pipefail

APP_DIR="/opt/vektor-ai"
NETWORK="icontainer-network"
COMPOSE="docker compose -f docker-compose.prod.yml"

cd "$APP_DIR"

# 1) .env present?
if [ ! -f .env ]; then
  echo "[deploy] ERROR: .env missing. Run: cp .env.production.example .env  (and edit it)"
  exit 1
fi

# 2) External docker network must exist (shared with existing infra)
if ! docker network inspect "$NETWORK" >/dev/null 2>&1; then
  echo "[deploy] ERROR: docker network '$NETWORK' not found on this VPS."
  echo "        Create it (only if truly missing): docker network create $NETWORK"
  exit 1
fi

# 3) Ports 3011 / 3012 must be free on the host
for PORT in 3011 3012; do
  if ss -ltn "( sport = :$PORT )" | grep -q LISTEN; then
    echo "[deploy] ERROR: port $PORT already in use on the host."
    ss -ltnp "( sport = :$PORT )" || true
    exit 1
  fi
done

# 4) Reachability check from a temp container on the shared network
echo "[deploy] Checking Postgres / Redis / Evolution reachability on $NETWORK..."
docker run --rm --network "$NETWORK" busybox sh -c '
  nc -zv ic-postgresql-aIFq 5432 &&
  nc -zv ic-redis-zf84 6379 &&
  nc -zv ic-evolutionapi-8nZx 8080
' || { echo "[deploy] ERROR: cannot reach shared infra on $NETWORK"; exit 1; }

# 5) Build + start
$COMPOSE pull || true
$COMPOSE up -d --build

# 6) Wait for backend, then migrate
echo "[deploy] Waiting for backend to be ready..."
for i in $(seq 1 30); do
  if docker exec vektor-backend wget -qO- http://localhost:3012/api/health >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

docker exec vektor-backend npx prisma migrate deploy

$COMPOSE ps
echo ""
echo "[deploy] Done."
echo "  Frontend : http://127.0.0.1:3011"
echo "  Backend  : http://127.0.0.1:3012/api/health"
echo ""
echo "Health checks:"
echo "  curl -s http://127.0.0.1:3011/ | head"
echo "  curl -s http://127.0.0.1:3012/api/health"
echo "  curl -s http://vektor.vps8817.panel.icontainer.net/api/health   # via OpenResty"
