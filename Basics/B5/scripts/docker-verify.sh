#!/usr/bin/env bash
set -euo pipefail

IMAGE="${IMAGE:-transaction-ledger-api}"
CONTAINER="${CONTAINER:-ledger-api-verify}"
PORT="${PORT:-3000}"

cd "$(dirname "$0")/.."

echo "==> Building image: $IMAGE"
docker build -t "$IMAGE" .

echo "==> Starting container on port $PORT"
docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER" -p "${PORT}:3000" "$IMAGE"

cleanup() {
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "==> Waiting for health"
for _ in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${PORT}/health" >/dev/null; then
    break
  fi
  sleep 1
done

echo "==> GET /health"
curl -s "http://127.0.0.1:${PORT}/health"
echo ""

echo "==> GET /balance"
curl -s "http://127.0.0.1:${PORT}/balance"
echo ""

echo "==> Docker HEALTHCHECK status"
docker inspect --format='{{.State.Health.Status}}' "$CONTAINER"

echo "==> Done"
