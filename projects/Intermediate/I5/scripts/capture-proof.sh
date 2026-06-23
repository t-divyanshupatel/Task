#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INTERMEDIATE="$(cd "$ROOT/.." && pwd)"
PROOF="$ROOT/proof"
IMAGE="${IMAGE:-currency-converter-api:i5}"
BASE_URL="${BASE_URL:-http://127.0.0.1:8000}"

mkdir -p "$PROOF"

{
  echo "================================================================================"
  echo "I5 Currency Converter Docker — Verification Log"
  echo "Generated: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo "Project:   Task/projects/Intermediate/I5"
  echo "Image:     $IMAGE"
  echo "================================================================================"
  echo ""
  echo "=== STEP 1: Dockerfile inspection ==="
  grep -E '^(FROM|COPY|EXPOSE|HEALTHCHECK|CMD)' "$ROOT/Dockerfile"
  echo ""
  echo "=== STEP 2: Docker build ==="
  echo "Command: cd Task/projects/Intermediate && docker build -f I5/Dockerfile -t $IMAGE ."
  (cd "$INTERMEDIATE" && docker build -f I5/Dockerfile -t "$IMAGE" .)
  echo ""
  echo "=== STEP 3: Docker run + verify-container.sh ==="
  echo "Command: docker run -d --rm -p 8000:8000 --name i5-proof $IMAGE"
  docker rm -f i5-proof >/dev/null 2>&1 || true
  docker run -d --rm -p 8000:8000 --name i5-proof "$IMAGE"
  sleep 3
  BASE_URL="$BASE_URL" bash "$ROOT/scripts/verify-container.sh"
  docker rm -f i5-proof >/dev/null
  echo ""
  echo "================================================================================"
  echo "VERIFICATION SUMMARY"
  echo "================================================================================"
  echo "Docker build:   SUCCESS"
  echo "API smoke:      verify-container.sh passed"
  echo "Status:         PASS"
  echo "================================================================================"
} > "$PROOF/verification-log.txt" 2>&1

echo "Wrote $PROOF/verification-log.txt"
