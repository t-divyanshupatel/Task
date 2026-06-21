#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Teardown from zero (containers + volumes)..."
docker compose down -v --remove-orphans

echo "==> Building and starting fresh stack..."
docker compose up -d --build

echo "==> Waiting for API health..."
deadline=$((SECONDS + 90))
until curl -sf http://127.0.0.1:8000/health >/dev/null; do
  if (( SECONDS > deadline )); then
    echo "API did not become healthy in time." >&2
    docker compose logs
    exit 1
  fi
  sleep 2
done

echo "==> Fresh stack is up."
curl -s http://127.0.0.1:8000/health | python3 -m json.tool
