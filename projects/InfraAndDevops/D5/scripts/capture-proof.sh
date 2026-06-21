#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROOF_DIR="${ROOT}/proof"
mkdir -p "${PROOF_DIR}"

cd "${ROOT}"

echo "=== Simulating fresh clone (removing .venv and pytest cache) ==="
rm -rf .venv .pytest_cache

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Command: make bootstrap"
  echo "Working directory: ${ROOT}"
  echo ""
  echo "=== Toolchain detection ==="
  if command -v mise >/dev/null 2>&1; then
    echo "mise: $(mise --version)"
    echo "mise.toml pin: $(grep -E '^python' mise.toml || true)"
  else
    echo "mise: not installed (bootstrap will use system python3)"
  fi
  echo "system python3: $(python3 --version 2>&1)"
  echo ""
  make bootstrap
  echo ""
  echo "=== Post-bootstrap verification ==="
  echo "venv python: $(.venv/bin/python3 --version)"
  echo "venv pytest: $(.venv/bin/pytest --version)"
} 2>&1 | tee "${PROOF_DIR}/bootstrap-full-output.txt"

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Command: make test"
  echo ""
  make test
} 2>&1 | tee "${PROOF_DIR}/tests-passing.txt"

echo "Proof written to ${PROOF_DIR}/"
