#!/usr/bin/env bash
# D2 — one-command E2E: teardown → up → health → pytest → log capture → fresh re-up proof.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROOF="${ROOT}/proof"
API_URL="${API_BASE_URL:-http://127.0.0.1:8000}"

mkdir -p "${PROOF}"

log() {
  echo "[d2-e2e] $*"
}

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "ERROR: docker CLI not found. Install Docker Desktop and re-run." >&2
    exit 1
  fi
  if ! docker info >/dev/null 2>&1; then
    echo "ERROR: docker daemon is not running. Start Docker Desktop and re-run." >&2
    exit 1
  fi
  if docker compose version >/dev/null 2>&1; then
    COMPOSE=(docker compose)
  elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE=(docker-compose)
  else
    echo "ERROR: docker compose or docker-compose not found." >&2
    exit 1
  fi
}

wait_for_api() {
  for _ in $(seq 1 60); do
    if curl -sf "${API_URL}/health" | grep -q '"database":"connected"'; then
      log "API healthy at ${API_URL} (database connected)"
      return 0
    fi
    sleep 1
  done
  echo "ERROR: API did not become healthy at ${API_URL}" >&2
  "${COMPOSE[@]}" -f "${ROOT}/docker-compose.yml" logs >&2 || true
  exit 1
}

require_docker

log "=== D2 docker-compose E2E ==="
log "Step 1/7 — teardown from zero (containers + volumes)"
bash "${ROOT}/scripts/teardown.sh" --volumes

log "Step 2/7 — build and start stack"
cd "${ROOT}"
"${COMPOSE[@]}" up --build -d

log "Step 3/7 — wait for API health (includes DB connectivity)"
wait_for_api

log "Step 4/7 — install e2e deps and run pytest"
E2E_VENV="${ROOT}/.venv-e2e"
if [[ ! -d "${E2E_VENV}" ]]; then
  python3 -m venv "${E2E_VENV}"
fi
"${E2E_VENV}/bin/pip" install -q -r "${ROOT}/api/requirements.txt"
API_BASE_URL="${API_URL}" "${E2E_VENV}/bin/pytest" "${ROOT}/api/tests/test_e2e.py" -v --tb=short

log "Step 5/7 — capture cross-service logs"
{
  echo "# D2 service logs — inter-service communication proof"
  echo "# Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "# Look for: event=db_ready (api/worker), event=job_created (api),"
  echo "#           event=job_picked / event=job_completed (worker), INSERT (db seed)"
  echo
  "${COMPOSE[@]}" logs --no-color api worker db
} > "${PROOF}/service-interaction-logs.txt"

log "Step 6/7 — teardown and clean re-up from zero"
{
  echo "# D2 teardown and fresh re-up proof"
  echo "# Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo
  echo "==> Teardown (containers + volumes)"
  bash "${ROOT}/scripts/teardown.sh" --volumes
  echo
  echo "==> Fresh build and start"
  "${COMPOSE[@]}" up --build -d
  echo
  echo "==> Wait for health"
  wait_for_api
  curl -s "${API_URL}/health" | python3 -m json.tool
  echo
  echo "==> Seed jobs visible via API"
  curl -s "${API_URL}/jobs" | python3 -m json.tool | head -n 40
  echo
  echo "Fresh re-up from zero succeeded."
} | tee "${PROOF}/teardown-and-fresh-reup.txt"

log "Step 7/7 — proof artifacts written"
log "  ${PROOF}/e2e-tests-all-green.txt (run with: tee ${PROOF}/e2e-tests-all-green.txt)"
log "  ${PROOF}/service-interaction-logs.txt"
log "  ${PROOF}/teardown-and-fresh-reup.txt"
log "SUCCESS — all E2E tests passed"
