#!/usr/bin/env bash
# Quick diagnostics for high CPU / disk usage on a VPS
set -euo pipefail

log() { echo "[diag] $(date +'%F %T') $*"; }

log "Top CPU processes (non-root)"
ps -eo pid,ppid,pcpu,pmem,etime,user,args --sort=-pcpu | head -n 30

echo
log "PM2 processes"
if command -v pm2 >/dev/null 2>&1; then
  pm2 list || true
  pm2 describe repfinder || true
else
  echo "pm2 not installed"
fi

echo
log "Node processes"
pgrep -af node || true

echo
log "Disk usage"
df -h

echo
log "Repo size by folder (top level)"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
du -xh --max-depth=1 "$APP_DIR" | sort -h

echo
log "Node_modules largest 20 entries"
if command -v du >/dev/null 2>&1; then
  du -xh "$APP_DIR/node_modules" | sort -h | tail -n 20 || true
fi

echo
log "Log files in /var/log and app logs"
ls -lh /var/log | tail -n 50 || true
if command -v pm2 >/dev/null 2>&1; then
  pm2 logs --lines 200 --nostream || true
fi
