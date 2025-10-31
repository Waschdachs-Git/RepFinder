#!/usr/bin/env bash
# Robust, idempotent deploy script with cooldown, lock & strict error handling
set -Eeuo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COOLDOWN_SECONDS=${COOLDOWN_SECONDS:-300}   # 5 min default
LOCK_DIR="/tmp/repfinder-deploy.lock"
LAST_RUN_FILE="/tmp/repfinder-deploy.last"
NAME=${PM2_NAME:-repfinder}

log() { echo "[deploy] $(date +'%F %T') $*"; }

# On error: print helpful diagnostics
on_err() {
  code=$?
  echo
  echo "[deploy] ERROR: Deploy abgebrochen (exit $code)." >&2
  echo "[deploy] Letzte npm-Logs:" >&2
  tail -n 120 /root/.npm/_logs/*-debug-*.log 2>/dev/null || true
  echo "[deploy] PM2 Prozessinfo:" >&2
  pm2 info "${NAME:-repfinder}" 2>/dev/null | sed -n '1,120p' || true
  echo "[deploy] PM2 Logs (tail):" >&2
  pm2 logs --lines 120 "${NAME:-repfinder}" 2>/dev/null || true
}
trap on_err ERR

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
 git fetch --all --prune --quiet
 git reset --hard origin/"${BRANCH:-main}" --quiet
 # ensure we are on configured branch (default: main)
 current_branch=$(git rev-parse --abbrev-ref HEAD)
 if [[ "$current_branch" != "${BRANCH:-main}" ]]; then
   git checkout -q "${BRANCH:-main}"
 fi
 git pull --rebase --autostash

# Install deps
log "npm ci"
 npm ci --no-audit --no-fund

# Build once (do NOT run as a daemon)
log "npm run build"
 npm run -s build

# Verify Next build completed
if [[ ! -f .next/BUILD_ID ]]; then
  log "Build fehlgeschlagen: .next/BUILD_ID fehlt"; exit 1
fi
log "BUILD_ID: $(cat .next/BUILD_ID)"

# Start/Restart pm2 service
# Kill stray Next.js servers started manually (prevents double-serve and high CPU)
log "Ensuring no stray 'next start' processes are running"
pkill -f 'next start' 2>/dev/null || true
pkill -f 'node .*next start' 2>/dev/null || true
pkill -f 'npm run start' 2>/dev/null || true

if pm2 describe "$NAME" >/dev/null 2>&1; then
  log "pm2 restart $NAME"
  pm2 restart "$NAME" --update-env --time
else
  log "pm2 start server.js as $NAME"
  pm2 start server.js --name "$NAME" --update-env --time
fi

pm2 save || true

# Wait for server and validate health + data source
HEALTH_URL=${HEALTH_URL:-http://localhost:3000/api/sheets/health}
PRODUCTS_HEAD=${PRODUCTS_HEAD:-http://localhost:3000/api/products}

log "Health check: $HEALTH_URL"
for i in {1..40}; do
  code=$(curl -s -o /tmp/health.json -w '%{http_code}' "$HEALTH_URL") || code=000
  if [[ "$code" == "200" ]]; then
    # Basic validations without jq
    payload=$(cat /tmp/health.json)
    # Must include mode:"sheets"
    if ! grep -q '"mode"\s*:\s*"sheets"' <<<"$payload"; then
      log "Health check fehlgeschlagen: mode != sheets"; echo "$payload" | head -c 800; echo; exit 2
    fi
    # Must include sampleRange with A1:ZZ
    if ! grep -q 'A1:ZZ' <<<"$payload"; then
      log "Health check fehlgeschlagen: sampleRange ist zu schmal (erwartet A1:ZZ*)"; echo "$payload" | head -c 800; echo; exit 2
    fi
    # BuildId must exist
    if ! grep -q '"buildId"' <<<"$payload"; then
      log "Health check fehlgeschlagen: buildId fehlt"; echo "$payload" | head -c 800; echo; exit 2
    fi
    # rowCount > 0
    rowCount=$(grep -o '"rowCount"\s*:\s*[0-9]\+' <<<"$payload" | awk -F: '{print $2}' | tr -d ' ')
    if [[ -z "$rowCount" || "$rowCount" -le 0 ]]; then
      log "Health check fehlgeschlagen: rowCount <= 0"; echo "$payload" | head -c 800; echo; exit 2
    fi
    log "Health OK (rowCount=$rowCount)"
    break
  fi
  sleep 2
  if [[ $i -eq 40 ]]; then
    log "Health timeout ($code)"; exit 1
  fi
done

log "Products source header check: $PRODUCTS_HEAD"
source_header=$(curl -sI "$PRODUCTS_HEAD" | tr -d '\r' | grep -i '^x-products-source:' | awk '{print tolower($0)}' || true)
if ! grep -q 'x-products-source: sheets' <<<"$source_header"; then
  log "Products Quelle nicht 'sheets' (Header war: ${source_header:-<leer>})"; exit 3
fi

log "Done"
