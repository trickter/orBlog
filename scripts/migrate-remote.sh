#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${1:-/app/ai-code/brainstorm}"
ARCHIVE_PATH="${2:-}"

if [ -z "${ARCHIVE_PATH}" ]; then
  echo "Usage: $0 <app_dir> <archive_path>" >&2
  exit 1
fi

if [ ! -f "${ARCHIVE_PATH}" ]; then
  echo "Migration archive not found: ${ARCHIVE_PATH}" >&2
  exit 1
fi

SHARED_DIR="${APP_DIR}/shared"
WORK_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "${WORK_DIR}"
  rm -f "${ARCHIVE_PATH}"
}

trap cleanup EXIT

if [ ! -f "${SHARED_DIR}/.env" ]; then
  echo "Shared environment file is missing: ${SHARED_DIR}/.env" >&2
  exit 1
fi

if [ ! -f "${SHARED_DIR}/prisma/dev.db" ]; then
  echo "Shared SQLite database is missing: ${SHARED_DIR}/prisma/dev.db" >&2
  echo "Initialize or restore the database before applying migrations." >&2
  exit 1
fi

tar -xzf "${ARCHIVE_PATH}" -C "${WORK_DIR}"
cd "${WORK_DIR}"

export DATABASE_URL="file:${SHARED_DIR}/prisma/dev.db"
export PRISMA_SKIP_POSTINSTALL_GENERATE=true

npm ci
npx prisma migrate deploy
node scripts/backfill-post-content-html.mjs

echo "Prisma migrations applied against ${SHARED_DIR}/prisma/dev.db"
