#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="${ROOT}/api"
WORKER_DIR="${ROOT}/worker"
SCORER_DIR="${ROOT}/scorer"
DB_PATH="${ROOT}/data/integration-fraud.db"
PID_FILE="${ROOT}/.integration-api.pid"

find_free_port() {
  python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1]); s.close()'
}

wait_for_api() {
  local url="$1"
  local i
  for i in $(seq 1 30); do
    if curl -sf "${url}/health" | grep -q "a3-fraud-api"; then
      return 0
    fi
    sleep 0.5
  done
  echo "ERROR: API did not become ready at ${url}" >&2
  return 1
}

cleanup() {
  if [[ -f "${PID_FILE}" ]]; then
    kill "$(cat "${PID_FILE}")" 2>/dev/null || true
    rm -f "${PID_FILE}"
  fi
}
trap cleanup EXIT

API_PORT="$(find_free_port)"
API_URL="http://127.0.0.1:${API_PORT}"
SCORER_BIN="${SCORER_DIR}/target/release/fraud-scorer"

echo "==> Build Rust scorer"
cd "${SCORER_DIR}"
cargo build --release

echo "==> Install Python deps"
cd "${API_DIR}"
python3 -m venv .venv
source .venv/bin/activate
pip install -q -r requirements-dev.txt

echo "==> Install Node deps"
cd "${WORKER_DIR}"
npm install --silent

echo "==> Start FastAPI on port ${API_PORT} (isolated DB)"
export FRAUD_DB_PATH="${DB_PATH}"
rm -f "${DB_PATH}"
cd "${API_DIR}"
source .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port "${API_PORT}" &
echo $! > "${PID_FILE}"
wait_for_api "${API_URL}"

echo "==> Submit test transaction"
CREATE_JSON=$(curl -sf -X POST "${API_URL}/transactions" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "demo-user",
    "amount": 15000,
    "currency": "USD",
    "merchant_category": "crypto",
    "country_code": "NG",
    "device_id": "demo-device",
    "timestamp": "2026-06-21T15:00:00Z"
  }')
echo "${CREATE_JSON}" | python3 -m json.tool
TX_ID=$(echo "${CREATE_JSON}" | python3 -c "import json,sys; print(json.load(sys.stdin)['transaction_id'])")

echo "==> Run worker once"
cd "${WORKER_DIR}"
FRAUD_API_URL="${API_URL}" FRAUD_SCORER_BIN="${SCORER_BIN}" node src/worker.js --once

echo "==> Verify scored transaction"
curl -sf "${API_URL}/transactions/${TX_ID}" | python3 -c "
import json, sys
body = json.load(sys.stdin)
assert body['status'] == 'scored', body
assert body['risk_level'] == 'high', body
assert body['risk_score'] == 90.0, body
print(json.dumps({
    'transaction_id': body['transaction_id'],
    'status': body['status'],
    'risk_score': body['risk_score'],
    'risk_level': body['risk_level'],
    'reasons': body['reasons'],
}, indent=2))
"

PENDING_COUNT=$(curl -sf "${API_URL}/transactions/pending" | python3 -c "import json,sys; print(len(json.load(sys.stdin)))")
if [[ "${PENDING_COUNT}" != "0" ]]; then
  echo "ERROR: expected empty pending queue, got ${PENDING_COUNT}" >&2
  exit 1
fi
echo "pending queue empty — worker processed transaction"

echo "==> Run unit tests"
cd "${SCORER_DIR}" && cargo test
cd "${API_DIR}" && source .venv/bin/activate && pytest -q
cd "${WORKER_DIR}" && npm test

echo "==> Integration complete (API port ${API_PORT})"
