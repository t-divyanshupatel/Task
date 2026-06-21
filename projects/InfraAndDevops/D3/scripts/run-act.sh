#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

if command -v act >/dev/null 2>&1; then
  act push -W .github/workflows/ci.yml --container-architecture linux/amd64
  exit 0
fi

echo "act is not installed."
echo "Install: https://github.com/nektos/act#installation"
echo "Or run: ./scripts/run-ci-local.sh"
exit 1
