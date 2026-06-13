#!/usr/bin/env bash
# =============================================================
# VEKTOR A.I — Backup the shared Postgres database
# Usage:  bash deploy/scripts/backup.sh
# Output: /opt/vektor-ai/backups/vektor-YYYYMMDD-HHMM.sql.gz
# =============================================================
set -euo pipefail

APP_DIR="/opt/vektor-ai"
OUT_DIR="$APP_DIR/backups"
STAMP="$(date +%Y%m%d-%H%M)"

mkdir -p "$OUT_DIR"

# Load DB creds from .env
set -a; . "$APP_DIR/.env"; set +a

docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" ic-postgresql-aIFq \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  | gzip > "$OUT_DIR/vektor-$STAMP.sql.gz"

# Keep only the 14 most recent backups
ls -1t "$OUT_DIR"/vektor-*.sql.gz | tail -n +15 | xargs -r rm --

echo "[backup] Saved: $OUT_DIR/vektor-$STAMP.sql.gz"
