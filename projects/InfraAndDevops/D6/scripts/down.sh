#!/usr/bin/env bash
# D6 — stop observability stack.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=scripts/_lib.sh
source "${ROOT}/scripts/_lib.sh"

log() { echo "[d6-down] $*"; }

require_docker
cd "${ROOT}"

log "Stopping stack"
"${COMPOSE[@]}" down --remove-orphans
log "SUCCESS — stack stopped"
