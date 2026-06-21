#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROOF_DIR="${ROOT}/proof"
mkdir -p "${PROOF_DIR}"

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Command: ./scripts/run-all-tests.sh"
  echo ""
  "${ROOT}/scripts/run-all-tests.sh"
} 2>&1 | tee "${PROOF_DIR}/run-all-tests-output.txt"

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Command: ./scripts/run-integration.sh"
  echo ""
  "${ROOT}/scripts/run-integration.sh"
} 2>&1 | tee "${PROOF_DIR}/run-integration-output.txt"

echo "Proof written to ${PROOF_DIR}/"
