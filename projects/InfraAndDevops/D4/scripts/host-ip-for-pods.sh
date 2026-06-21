#!/usr/bin/env bash
# Resolve an IP address reachable from k3s/colima pods to the host running uvicorn.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="${ROOT}/.tools/bin:${PATH}"

if [[ -z "${DOCKER_HOST:-}" && -S "${HOME}/.colima/default/docker.sock" ]]; then
  export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"
fi

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  ip="$(docker run --rm --entrypoint /bin/sh rancher/mirrored-library-busybox:1.37.0 \
    -c 'getent hosts host.lima.internal 2>/dev/null | awk "{print \$1}" | head -1' 2>/dev/null || true)"
  if [[ -n "${ip}" ]]; then
    echo "${ip}"
    exit 0
  fi
fi

# Colima default gateway from host into the VM network (reachable from pods).
echo "192.168.5.2"
