#!/usr/bin/env bash
set -Eeuo pipefail

# First-time server bootstrap for Net Khata deployment automation.

APP_NAME="netkhata"
BASE_DIR="/var/www/${APP_NAME}"
REPO_URL="${REPO_URL:-}"

if [ -z "${REPO_URL}" ]; then
  echo "Set REPO_URL before running. Example:" >&2
  echo "  REPO_URL='git@github.com:your-org/net-khata.git' bash deploy/bootstrap_server.sh" >&2
  exit 1
fi

mkdir -p "${BASE_DIR}/repo" "${BASE_DIR}/releases" "${BASE_DIR}/shared/uploads"

if [ ! -d "${BASE_DIR}/repo/.git" ]; then
  rm -rf "${BASE_DIR}/repo"
  git clone "${REPO_URL}" "${BASE_DIR}/repo"
fi

# Create env template if missing
if [ ! -f "${BASE_DIR}/shared/api.env" ]; then
  cat >"${BASE_DIR}/shared/api.env" <<'EOF'
FLASK_ENV=production
DATABASE_URL=postgresql://user:password@localhost/db_name
SECRET_KEY=change_me
JWT_SECRET_KEY=change_me_too
EOF
fi

# Install service
cp "${BASE_DIR}/repo/deploy/netkhata-api.service" /etc/systemd/system/netkhata-api.service
systemctl daemon-reload
systemctl enable netkhata-api

echo "Bootstrap complete. Next step:"
echo "  bash ${BASE_DIR}/repo/deploy/deploy.sh"
