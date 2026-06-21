#!/usr/bin/env bash
# Regenerate all D6 proof artifacts.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Running D6 full verify pipeline"
bash "${ROOT}/scripts/verify.sh"

echo "Proof files written to ${ROOT}/proof/"
