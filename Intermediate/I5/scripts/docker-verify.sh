#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Building and starting with docker compose"
docker compose up --build -d

cleanup() {
  docker compose down
}
trap cleanup EXIT

echo "==> Waiting for health"
for _ in $(seq 1 30); do
  if curl -sf http://127.0.0.1:8000/health >/dev/null; then
    break
  fi
  sleep 1
done

echo "==> GET /health"
curl -s http://127.0.0.1:8000/health
echo ""

echo "==> POST /convert"
curl -s -X POST http://127.0.0.1:8000/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from": "USD", "to": "EUR"}'
echo ""

echo "==> Compose health status"
docker compose ps

echo "==> Done"
