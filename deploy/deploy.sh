#!/usr/bin/env bash
set -Eeuo pipefail

# Net Khata one-command deploy script (monorepo)
# Run on VPS: bash deploy/deploy.sh

APP_NAME="netkhata"
BASE_DIR="/var/www/${APP_NAME}"
REPO_DIR="${BASE_DIR}/repo"
RELEASES_DIR="${BASE_DIR}/releases"
SHARED_DIR="${BASE_DIR}/shared"
CURRENT_LINK="${BASE_DIR}/current"
VENV_DIR="${BASE_DIR}/venv"
FRONTEND_BUILD_DIR="/var/www/html/ISP-MANAGEMENT-SYSTEM/build"

# Keep latest N releases on disk
KEEP_RELEASES="${KEEP_RELEASES:-5}"
# Set RUN_MIGRATIONS=1 to run database migrations every deploy
RUN_MIGRATIONS="${RUN_MIGRATIONS:-0}"

log() {
  printf "[%s] %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

require_cmd git
require_cmd rsync
require_cmd npm
require_cmd python3
require_cmd systemctl

mkdir -p "${RELEASES_DIR}" "${SHARED_DIR}" "${FRONTEND_BUILD_DIR}" "${SHARED_DIR}/uploads"

if [ ! -d "${REPO_DIR}/.git" ]; then
  echo "Repository not found at ${REPO_DIR}. Clone your repo there first." >&2
  exit 1
fi

TIMESTAMP="$(date +%Y%m%d%H%M%S)"
RELEASE_DIR="${RELEASES_DIR}/${TIMESTAMP}"

log "Fetching latest code"
cd "${REPO_DIR}"
git fetch --all --prune
git reset --hard origin/main

log "Creating release directory: ${RELEASE_DIR}"
mkdir -p "${RELEASE_DIR}"

log "Syncing source to release"
rsync -a --delete \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude "build" \
  --exclude ".expo" \
  --exclude "api/__pycache__" \
  "${REPO_DIR}/" "${RELEASE_DIR}/"

log "Linking persistent uploads"
rm -rf "${RELEASE_DIR}/api/uploads"
ln -sfn "${SHARED_DIR}/uploads" "${RELEASE_DIR}/api/uploads"

if [ -f "${SHARED_DIR}/api.env" ]; then
  log "Linking backend environment file"
  ln -sfn "${SHARED_DIR}/api.env" "${RELEASE_DIR}/api/.env"
fi

log "Creating/Updating Python virtual environment"
if [ ! -x "${VENV_DIR}/bin/python" ]; then
  python3 -m venv "${VENV_DIR}"
fi

log "Installing backend dependencies"
"${VENV_DIR}/bin/pip" install --upgrade pip >/dev/null
"${VENV_DIR}/bin/pip" install -r "${RELEASE_DIR}/api/requirements.txt"

if [ "${RUN_MIGRATIONS}" = "1" ]; then
  log "Running backend migrations"
  cd "${RELEASE_DIR}/api"
  FLASK_APP=run.py "${VENV_DIR}/bin/flask" db upgrade
fi

log "Installing frontend dependencies and building"
cd "${RELEASE_DIR}"
npm ci --legacy-peer-deps
npm run build

log "Publishing frontend build"
rsync -a --delete "${RELEASE_DIR}/build/" "${FRONTEND_BUILD_DIR}/"

log "Switching current release"
ln -sfn "${RELEASE_DIR}" "${CURRENT_LINK}"

log "Restarting backend service"
systemctl daemon-reload
systemctl restart netkhata-api

if systemctl is-active --quiet nginx; then
  log "Reloading nginx"
  systemctl reload nginx
fi

log "Cleaning old releases (keeping ${KEEP_RELEASES})"
ls -1dt "${RELEASES_DIR}"/* 2>/dev/null | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf

log "Deploy completed successfully"
