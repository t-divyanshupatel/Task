#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Seed data lives in db/init/02-seed.sql"
echo "==> Postgres runs these scripts automatically on first startup (empty volume)."
echo
echo "Seeded jobs:"
echo "  1. uppercase  — \"hello from seed\"  (pending → worker completes)"
echo "  2. reverse    — \"docker stack\"       (pending → worker completes)"
echo "  3. uppercase  — \"already done\"       (pre-completed fixture)"
echo
echo "To re-seed from zero:"
echo "  ./scripts/teardown.sh --volumes && docker compose up -d --build"
