#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="${ROOT}/sandbox/enrollment-api"
PROOF_DIR="${ROOT}/proof"
PORT="${ENROLLMENT_API_PORT:-8010}"
mkdir -p "${PROOF_DIR}"

cd "${APP_DIR}"

if [[ ! -d .venv ]]; then
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q -r requirements.txt

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "App: ${APP_DIR}"
  echo ""
  echo "=== pytest tests/ -v ==="
  pytest tests/ -v
  echo ""
  echo "=== conflict marker grep ==="
  if grep -r "<<<<<<" . --include="*.py" 2>/dev/null; then
    echo "CONFLICT MARKERS FOUND"
    exit 1
  else
    echo "Clean"
  fi
  echo ""
  echo "=== curl smoke tests (port ${PORT}) ==="
  uvicorn app.main:app --host 127.0.0.1 --port "${PORT}" &
  UV_PID=$!
  sleep 2
  trap 'kill "${UV_PID}" 2>/dev/null || true' EXIT
  echo "POST /students:"
  curl -sf --max-time 10 -X POST "http://127.0.0.1:${PORT}/students" \
    -H "Content-Type: application/json" \
    -d '{"full_name":"Ada Lovelace","email":"ada-demo@uni.edu","program":"CS"}'
  echo ""
  echo "GET /students:"
  curl -sf --max-time 10 "http://127.0.0.1:${PORT}/students"
  echo ""
  echo "POST /enrollments:"
  curl -sf --max-time 10 -X POST "http://127.0.0.1:${PORT}/enrollments" \
    -H "Content-Type: application/json" \
    -d '{"student_id":1,"course_code":"CS101","term":"2026-FALL"}'
  echo ""
  echo "GET /enrollments:"
  curl -sf --max-time 10 "http://127.0.0.1:${PORT}/enrollments"
  echo ""
  echo "GET /registry/summary:"
  curl -sf --max-time 10 "http://127.0.0.1:${PORT}/registry/summary"
  echo ""
  kill "${UV_PID}" 2>/dev/null || true
  wait "${UV_PID}" 2>/dev/null || true
  trap - EXIT
} 2>&1 | tee "${PROOF_DIR}/merged-verification-log.txt"

echo "Proof written to ${PROOF_DIR}/merged-verification-log.txt"
