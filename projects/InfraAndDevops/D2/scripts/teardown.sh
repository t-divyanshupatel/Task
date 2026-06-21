#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

REMOVE_VOLUMES=false
if [[ "${1:-}" == "--volumes" ]]; then
  REMOVE_VOLUMES=true
fi

echo "==> Stopping D2 stack..."
if [[ "$REMOVE_VOLUMES" == true ]]; then
  docker compose down -v --remove-orphans
  echo "==> Removed containers, networks, and volumes."
else
  docker compose down --remove-orphans
  echo "==> Removed containers and networks (volumes kept)."
fi
