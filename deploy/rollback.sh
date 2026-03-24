#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="netkhata"
BASE_DIR="/var/www/${APP_NAME}"
RELEASES_DIR="${BASE_DIR}/releases"
CURRENT_LINK="${BASE_DIR}/current"

log() {
  printf "[%s] %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

mapfile -t RELEASES < <(ls -1dt "${RELEASES_DIR}"/* 2>/dev/null)

if [ "${#RELEASES[@]}" -lt 2 ]; then
  echo "Not enough releases to rollback." >&2
  exit 1
fi

TARGET="${RELEASES[1]}"

log "Rolling back to ${TARGET}"
ln -sfn "${TARGET}" "${CURRENT_LINK}"

log "Restarting backend service"
systemctl restart netkhata-api

if systemctl is-active --quiet nginx; then
  log "Reloading nginx"
  systemctl reload nginx
fi

log "Rollback completed"
