#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${1:-/app/ai-code/brainstorm}"
SERVICE_NAME="${2:-brainstorm.service}"
ARCHIVE_PATH="${3:-}"

if [ -z "${ARCHIVE_PATH}" ]; then
  echo "Usage: $0 <app_dir> <service_name> <archive_path>" >&2
  exit 1
fi

if [ ! -f "${ARCHIVE_PATH}" ]; then
  echo "Release archive not found: ${ARCHIVE_PATH}" >&2
  exit 1
fi

RELEASE_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "${RELEASE_DIR}"
  rm -f "${ARCHIVE_PATH}"
}

trap cleanup EXIT

mkdir -p "${APP_DIR}"
mkdir -p "${APP_DIR}/prisma"

tar -xzf "${ARCHIVE_PATH}" -C "${RELEASE_DIR}"

# Keep the server-side .env and SQLite files while removing stale code files.
find "${APP_DIR}" -mindepth 1 -maxdepth 1 \
  ! -name '.env' \
  ! -name 'prisma' \
  -exec rm -rf {} +

find "${APP_DIR}/prisma" -mindepth 1 -maxdepth 1 \
  ! -name 'dev.db' \
  ! -name '*.db-journal' \
  -exec rm -rf {} +

tar -C "${RELEASE_DIR}" -cf - . | tar -C "${APP_DIR}" -xf -

cd "${APP_DIR}"

npm ci
npx prisma db push --skip-generate
npx prisma generate
npm run build
systemctl restart "${SERVICE_NAME}"
systemctl is-active --quiet "${SERVICE_NAME}"

echo "Deployment completed for ${SERVICE_NAME}"
