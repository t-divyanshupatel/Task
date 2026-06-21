#!/usr/bin/env bash
# Run the real D4 FastAPI service on the host (used when container image build is unavailable).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="${ROOT}/.host-service.pid"
VENV="${ROOT}/.venv-host"
PORT="${D4_HOST_PORT:-8000}"

stop_host_service() {
  if [[ -f "${PID_FILE}" ]]; then
    local pid
    pid="$(cat "${PID_FILE}")"
    if kill -0 "${pid}" 2>/dev/null; then
      kill "${pid}" 2>/dev/null || true
      wait "${pid}" 2>/dev/null || true
    fi
    rm -f "${PID_FILE}"
  fi
}

start_host_service() {
  stop_host_service

  cd "${ROOT}"

  if [[ ! -x "${VENV}/bin/uvicorn" ]]; then
    python3 -m venv "${VENV}"
    "${VENV}/bin/pip" install -q --upgrade pip
    "${VENV}/bin/pip" install -q -r "${ROOT}/requirements.txt"
  fi

  export SERVICE_NAME="${SERVICE_NAME:-d4-notify}"
  export LOG_LEVEL="${LOG_LEVEL:-info}"
  export APP_VERSION="${APP_VERSION:-1.0.0}"

  nohup "${VENV}/bin/uvicorn" app.main:app --host 0.0.0.0 --port "${PORT}" \
    --app-dir "${ROOT}" \
    >"${ROOT}/.host-service.log" 2>&1 &
  echo $! >"${PID_FILE}"

  for _ in $(seq 1 30); do
    if curl -sf "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
      echo "Host FastAPI service ready on port ${PORT} (pid $(cat "${PID_FILE}"))"
      return 0
    fi
    sleep 1
  done

  echo "Host FastAPI service failed to start. Log:"
  tail -20 "${ROOT}/.host-service.log" || true
  exit 1
}

case "${1:-start}" in
  start) start_host_service ;;
  stop) stop_host_service ;;
  restart) stop_host_service; start_host_service ;;
  *)
    echo "Usage: $0 [start|stop|restart]"
    exit 2
    ;;
esac
