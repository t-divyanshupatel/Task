#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Rust scorer tests"
cd "${ROOT}/scorer"
cargo test

echo "==> FastAPI tests"
cd "${ROOT}/api"
if [[ ! -d .venv ]]; then
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -q -r requirements-dev.txt
else
  source .venv/bin/activate
fi
pytest -v

echo "==> Node worker tests"
cd "${ROOT}/worker"
npm install --silent
npm test

echo "==> All unit tests passed"
