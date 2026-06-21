#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROOF_DIR="${ROOT}/proof"
mkdir -p "${PROOF_DIR}"

if [[ -z "${DOCKER_HOST:-}" && -S "${HOME}/.colima/default/docker.sock" ]]; then
  export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"
fi

run_lint_and_tests() {
  python3 -m venv "${ROOT}/.venv"
  # shellcheck disable=SC1091
  source "${ROOT}/.venv/bin/activate"
  pip install -q --upgrade pip
  pip install -q -r requirements-dev.txt

  echo ">>> Job: lint — ruff check"
  ruff check app tests
  echo ""
  echo ">>> Job: lint — ruff format --check"
  ruff format --check app tests
  deactivate

  local ran=0
  for version in 3.9 3.11; do
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
        continue
      fi
      python3 -m venv "${venv}"
    fi
    # shellcheck disable=SC1091
    source "${venv}/bin/activate"
    pip install -q --upgrade pip
    pip install -q -r requirements-dev.txt
    pytest -v tests/
    deactivate
    ran=$((ran + 1))
  done

  if [[ "${ran}" -eq 0 ]]; then
    echo "ERROR: no matrix Python versions available for tests"
    return 1
  fi
}

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Command: lint + test matrix (CI jobs lint + test)"
  echo ""
  run_lint_and_tests
  echo ""
  echo "=== lint + test passed ==="
} 2>&1 | tee "${PROOF_DIR}/ci-lint-test.txt"

DOCKER_OK=false
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  DOCKER_OK=true
fi

if [[ "${DOCKER_OK}" == "true" ]]; then
  {
    echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "Command: ./scripts/run-ci-local.sh (full pipeline incl. docker build)"
    echo ""
    "${ROOT}/scripts/run-ci-local.sh"
  } 2>&1 | tee "${PROOF_DIR}/ci-passing-local.txt"
else
  {
    echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "SKIP full CI — Docker not available or daemon not running."
    echo ""
    echo "Lint + test proof is in proof/ci-lint-test.txt"
    echo "To complete proof, install/start Docker and rerun:"
    echo "  ./scripts/capture-proof.sh"
    echo ""
    echo "Or run only the build job:"
    echo "  docker build -t d3-notify-service:local ."
  } | tee "${PROOF_DIR}/ci-docker-build.txt" "${PROOF_DIR}/ci-passing-local.txt"
fi

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Command: ./scripts/demo-failure.sh"
  echo ""
  "${ROOT}/scripts/demo-failure.sh"
} 2>&1 | tee "${PROOF_DIR}/ci-failure-demo.txt"

cp "${ROOT}/.github/workflows/ci.yml" "${PROOF_DIR}/workflow-ci.yml"

echo "Proof written to ${PROOF_DIR}/"
