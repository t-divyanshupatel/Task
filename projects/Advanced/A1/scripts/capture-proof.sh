#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROOF_DIR="${ROOT}/proof"
mkdir -p "${PROOF_DIR}"

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Command: A1 plan validation"
  echo ""
  echo "=== Proof files present ==="
  for f in enrollment-contract.md parallel-work-plan.md orchestration-runbook.md; do
    if [[ -f "${PROOF_DIR}/${f}" ]]; then
      echo "OK: proof/${f} ($(wc -l < "${PROOF_DIR}/${f}") lines)"
    else
      echo "MISSING: proof/${f}"
      exit 1
    fi
  done
  echo ""
  echo "=== A1 section checklist (parallel-work-plan.md) ==="
  grep -E "^## [0-9]" "${PROOF_DIR}/parallel-work-plan.md" || true
  echo ""
  echo "=== Contract endpoints ==="
  grep -E "^\| (POST|GET)" "${PROOF_DIR}/enrollment-contract.md" | head -10
  echo ""
  echo "A1 planning proof complete — execute lanes per orchestration-runbook.md"
} 2>&1 | tee "${PROOF_DIR}/plan-execution-log.txt"

echo "Proof written to ${PROOF_DIR}/"
