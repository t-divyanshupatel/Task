#!/usr/bin/env bash
# Regenerate all D2 proof artifacts (E2E output, service logs, teardown/re-up).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROOF_DIR="${ROOT}/proof"

mkdir -p "${PROOF_DIR}"

echo "==> Running full D2 E2E pipeline (teardown → up → pytest → logs → fresh re-up)"
bash "${ROOT}/scripts/run-e2e.sh" | tee "${PROOF_DIR}/e2e-tests-all-green.txt"

echo "Proof files written to ${PROOF_DIR}/"
echo "  e2e-tests-all-green.txt"
echo "  service-interaction-logs.txt"
echo "  teardown-and-fresh-reup.txt"
