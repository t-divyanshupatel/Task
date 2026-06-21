#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

if [[ -z "${DOCKER_HOST:-}" && -S "${HOME}/.colima/default/docker.sock" ]]; then
  export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"
fi

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "ERROR: docker CLI not found — build-image job cannot run."
    echo "Install Docker Desktop or Colima, then rerun."
    exit 1
  fi
  if ! docker info >/dev/null 2>&1; then
    echo "ERROR: Docker daemon is not running — build-image job cannot run."
    echo "Start Docker Desktop / colima start, then rerun."
    exit 1
  fi
}

run_pytest_for_version() {
  local version="$1"
  local venv="${ROOT}/.venv-py${version//./}"

  echo ""
  echo ">>> Job: test — pytest (Python ${version})"

  if command -v "python${version}" >/dev/null 2>&1; then
    "python${version}" -m venv "${venv}"
  elif command -v mise >/dev/null 2>&1; then
    mise use "python@${version}" >/dev/null 2>&1 || mise install "python@${version}"
    mise exec "python@${version}" -- python -m venv "${venv}"
  else
    local current
    current="$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
    if [[ "${current}" != "${version}" ]]; then
      echo "SKIP Python ${version} — interpreter not available (have ${current})"
      return 0
    fi
    python3 -m venv "${venv}"
  fi

  # shellcheck disable=SC1091
  source "${venv}/bin/activate"
  pip install -q --upgrade pip
  pip install -q -r requirements-dev.txt
  pytest -v tests/
  deactivate
}

echo "=== D3 local CI (mirrors .github/workflows/ci.yml) ==="
echo "Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

python3 -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements-dev.txt

echo ""
echo ">>> Job: lint — ruff check"
ruff check app tests

echo ""
echo ">>> Job: lint — ruff format --check"
ruff format --check app tests

deactivate

MATRIX_VERSIONS=("3.9" "3.11")
RAN_MATRIX=0
for version in "${MATRIX_VERSIONS[@]}"; do
  if run_pytest_for_version "${version}"; then
    RAN_MATRIX=$((RAN_MATRIX + 1))
  fi
done

if [[ "${RAN_MATRIX}" -eq 0 ]]; then
  echo "ERROR: no Python matrix versions could run tests."
  exit 1
fi

echo ""
echo ">>> Job: build-image — docker build"
require_docker

SHA="$(git -C "${ROOT}" rev-parse --short HEAD 2>/dev/null || echo "local")"
docker build \
  -t "d3-notify-service:${SHA}" \
  -t "d3-notify-service:latest" \
  -t "d3-notify-service:local" \
  .

echo ""
echo ">>> Job: build-image — verify tags"
docker image inspect "d3-notify-service:${SHA}" --format 'Image ID: {{.Id}}' 
docker image ls --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}' \
  | grep d3-notify-service || true

echo ""
echo "=== Local CI passed ==="
echo "Finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
