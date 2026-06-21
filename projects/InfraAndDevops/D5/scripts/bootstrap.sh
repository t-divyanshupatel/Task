#!/usr/bin/env bash
# D5 one-command bootstrap: install pinned Python (via mise), venv, deps, run tests.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

PYTHON_MIN=3.9
VENV="${ROOT}/.venv"
MODE="${1:-bootstrap}"

log() {
  echo ">>> $*"
}

resolve_python() {
  if command -v mise >/dev/null 2>&1 && [[ -f "${ROOT}/mise.toml" ]]; then
    log "Installing toolchain via mise (see mise.toml)"
    mise install
    echo ">>> Using Python from mise"
    mise exec -- python --version
    return 0
  fi

  if command -v python3 >/dev/null 2>&1; then
    log "mise not found — using system python3"
    python3 --version
    return 0
  fi

  echo "error: no Python found. Install mise (https://mise.jdx.dev) or Python ${PYTHON_MIN}+"
  exit 1
}

run_python() {
  if command -v mise >/dev/null 2>&1 && [[ -f "${ROOT}/mise.toml" ]]; then
    mise exec -- "$@"
  else
    "$@"
  fi
}

python_version_ok() {
  run_python python3 - <<'PY'
import sys
print(f"Python {sys.version.split()[0]}")
sys.exit(0 if sys.version_info >= (3, 9) else 1)
PY
}

do_setup() {
  resolve_python
  python_version_ok

  log "Creating virtualenv at .venv"
  run_python python3 -m venv "${VENV}"

  log "Installing dependencies"
  "${VENV}/bin/pip" install -q --upgrade pip
  "${VENV}/bin/pip" install -q -r requirements-dev.txt

  log "Setup complete"
}

do_test() {
  if [[ ! -x "${VENV}/bin/pytest" ]]; then
    echo "error: .venv missing — run setup first"
    exit 1
  fi

  log "Running tests"
  "${VENV}/bin/pytest" -v tests/
}

case "${MODE}" in
  setup)
    do_setup
    ;;
  test)
    do_test
    ;;
  bootstrap)
    do_setup
    do_test
    echo ""
    echo "=== Bootstrap complete: all tests passed ==="
    ;;
  *)
    echo "Usage: $0 [bootstrap|setup|test]"
    exit 2
    ;;
esac
