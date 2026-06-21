#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

source .venv/bin/activate 2>/dev/null || {
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -q -r requirements-dev.txt
}

echo "=== D3 CI failure demo ==="
echo ""
echo ">>> Demo 1: Lint failure (demo/broken_lint.py)"
set +e
ruff check demo/broken_lint.py
LINT_EXIT=$?
set -e
echo "Lint exit code: ${LINT_EXIT}"

echo ""
echo ">>> Demo 2: Test failure (demo/test_broken.py)"
set +e
pytest -v demo/test_broken.py
TEST_EXIT=$?
set -e
echo "Test exit code: ${TEST_EXIT}"

if [[ "${LINT_EXIT}" -ne 0 && "${TEST_EXIT}" -ne 0 ]]; then
  echo ""
  echo "=== Failure demo complete (lint and tests failed as expected) ==="
  exit 0
fi

echo "Expected both lint and test to fail"
exit 1
