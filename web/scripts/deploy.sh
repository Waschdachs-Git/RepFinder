#!/usr/bin/env bash
# Safe, idempotent deploy script with cooldown & lock
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COOLDOWN_SECONDS=${COOLDOWN_SECONDS:-300}   # 5 min default
LOCK_DIR="/tmp/repfinder-deploy.lock"
LAST_RUN_FILE="/tmp/repfinder-deploy.last"
NAME=${PM2_NAME:-repfinder}

log() { echo "[deploy] $(date +'%F %T') $*"; }

# Cooldown
if [[ -f "$LAST_RUN_FILE" ]]; then
  last=$(cat "$LAST_RUN_FILE" || echo 0)
  now=$(date +%s)
  if (( now - last < COOLDOWN_SECONDS )); then
    log "Cooldown active ($((now-last))s < ${COOLDOWN_SECONDS}s). Abort."; exit 0
  fi
fi

# Lock (portable, flock-less)
if mkdir "$LOCK_DIR" 2>/dev/null; then
  trap 'rm -rf "$LOCK_DIR"' EXIT INT TERM
else
  log "Another deploy is in progress. Abort."; exit 0
fi

echo "$(date +%s)" > "$LAST_RUN_FILE"

log "Starting deploy in $APP_DIR"
cd "$APP_DIR"

# Ensure git available and repo clean
log "Git fetch & pull"
 git fetch --all --quiet || true
 git reset --hard HEAD --quiet || true
 git pull --rebase --autostash

# Install deps
log "npm ci"
 npm ci --no-audit --no-fund

# Build once (do NOT run as a daemon)
log "npm run build"
 npm run -s build

# Start/Restart pm2 service
if pm2 describe "$NAME" >/dev/null 2>&1; then
  log "pm2 restart $NAME"
  pm2 restart "$NAME" --update-env --time
else
  log "pm2 start server.js as $NAME"
  pm2 start server.js --name "$NAME" --update-env --time
fi

pm2 save || true

# Optional smoke test
HEALTH_URL=${HEALTH_URL:-http://localhost:3000/api/sheets/health}
log "Health check: $HEALTH_URL"
set +e
for i in {1..30}; do
  code=$(curl -s -o /tmp/health.json -w '%{http_code}' "$HEALTH_URL")
  if [[ "$code" == "200" ]]; then
    log "Health OK"
    head -c 800 /tmp/health.json 2>/dev/null || true
    echo
    break
  fi
  sleep 2
  [[ $i -eq 30 ]] && { log "Health timeout"; exit 1; }
done
set -e

log "Done"
