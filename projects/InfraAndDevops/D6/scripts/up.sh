#!/usr/bin/env bash
# D6 — start API + Prometheus + Grafana stack.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=scripts/_lib.sh
source "${ROOT}/scripts/_lib.sh"

API_PORT="${D6_API_PORT:-8080}"
PROM_PORT="${D6_PROMETHEUS_PORT:-9090}"
GRAFANA_PORT="${D6_GRAFANA_PORT:-3000}"
API_URL="http://127.0.0.1:${API_PORT}"
PROM_URL="http://127.0.0.1:${PROM_PORT}"

log() { echo "[d6-up] $*"; }

require_docker
cd "${ROOT}"

log "Building and starting observability stack"
"${COMPOSE[@]}" up -d --build

log "Waiting for API at ${API_URL}"
for _ in $(seq 1 60); do
  if curl -sf "${API_URL}/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
curl -sf "${API_URL}/health" >/dev/null

log "Waiting for Prometheus at ${PROM_URL}"
for _ in $(seq 1 30); do
  if curl -sf "${PROM_URL}/-/ready" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
curl -sf "${PROM_URL}/-/ready" >/dev/null

log "Services:"
"${COMPOSE[@]}" ps
log "SUCCESS"
log "  API:        ${API_URL}"
log "  Metrics:    ${API_URL}/metrics"
log "  Prometheus: ${PROM_URL}"
log "  Grafana:    http://127.0.0.1:${GRAFANA_PORT}/d/d6-order-api/d6-order-api (admin/admin)"
