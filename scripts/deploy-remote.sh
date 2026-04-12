#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${1:-/app/ai-code/brainstorm}"
SERVICE_NAME="${2:-brainstorm.service}"
ARCHIVE_PATH="${3:-}"
RELEASE_ID="${4:-$(date -u +%Y%m%d%H%M%S)}"

if [ -z "${ARCHIVE_PATH}" ]; then
  echo "Usage: $0 <app_dir> <service_name> <archive_path> [release_id]" >&2
  exit 1
fi

if [ ! -f "${ARCHIVE_PATH}" ]; then
  echo "Release archive not found: ${ARCHIVE_PATH}" >&2
  exit 1
fi

SHARED_DIR="${APP_DIR}/shared"
RELEASES_DIR="${APP_DIR}/releases"
CURRENT_LINK="${APP_DIR}/current"
STAGING_DIR="$(mktemp -d)"
NEW_RELEASE_DIR="${RELEASES_DIR}/${RELEASE_ID}"
TMP_CURRENT_LINK="${APP_DIR}/.current.tmp"

cleanup() {
  rm -rf "${STAGING_DIR}"
  rm -f "${ARCHIVE_PATH}"
}

trap cleanup EXIT

mkdir -p "${APP_DIR}"
mkdir -p "${SHARED_DIR}/prisma"
mkdir -p "${RELEASES_DIR}"

if [ ! -f "${SHARED_DIR}/.env" ]; then
  echo "Shared environment file is missing: ${SHARED_DIR}/.env" >&2
  echo "Create it before deploying the release bundle." >&2
  exit 1
fi

if [ ! -f "${SHARED_DIR}/prisma/dev.db" ]; then
  echo "Shared SQLite database is missing: ${SHARED_DIR}/prisma/dev.db" >&2
  echo "Initialize or restore the database before deploying." >&2
  exit 1
fi

rm -rf "${NEW_RELEASE_DIR}"
mkdir -p "${NEW_RELEASE_DIR}"

tar -xzf "${ARCHIVE_PATH}" -C "${STAGING_DIR}"

if [ ! -f "${STAGING_DIR}/server.js" ]; then
  echo "Release bundle is missing server.js" >&2
  exit 1
fi

if [ ! -d "${STAGING_DIR}/.next/static" ]; then
  echo "Release bundle is missing .next/static" >&2
  exit 1
fi

tar -C "${STAGING_DIR}" -cf - . | tar -C "${NEW_RELEASE_DIR}" -xf -

mkdir -p "${NEW_RELEASE_DIR}/prisma"
ln -sfn "${SHARED_DIR}/.env" "${NEW_RELEASE_DIR}/.env"
ln -sfn "${SHARED_DIR}/prisma/dev.db" "${NEW_RELEASE_DIR}/prisma/dev.db"

ln -sfn "${NEW_RELEASE_DIR}" "${TMP_CURRENT_LINK}"
mv -Tf "${TMP_CURRENT_LINK}" "${CURRENT_LINK}"

systemctl restart "${SERVICE_NAME}"
systemctl is-active --quiet "${SERVICE_NAME}"

echo "Deployment completed for ${SERVICE_NAME} using release ${RELEASE_ID}"
