#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS_DIR="${ROOT}/.tools/bin"
PROOF_DIR="${ROOT}/proof"
K8S_DIR="${ROOT}/k8s"
CLUSTER_NAME="${CLUSTER_NAME:-d4-notify}"
IMAGE_NAME="${IMAGE_NAME:-d4-notify:local}"

export PATH="${TOOLS_DIR}:${ROOT}/.tools/lima/bin:${PATH}"

if [[ -z "${DOCKER_HOST:-}" && -S "${HOME}/.colima/default/docker.sock" ]]; then
  export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"
fi

mkdir -p "${PROOF_DIR}"

"${ROOT}/scripts/install-tools.sh"

KUBECTL="${TOOLS_DIR}/kubectl"
KUBECONFORM="${TOOLS_DIR}/kubeconform"

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo ""
  echo "=== kubectl client version ==="
  "${KUBECTL}" version --client=true 2>/dev/null || true
  echo ""
  echo "=== kubeconform version ==="
  "${KUBECONFORM}" -v 2>/dev/null || true
} | tee "${PROOF_DIR}/tool-versions.txt"

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo ""
  echo "=== kubectl apply --dry-run=client (offline object build) ==="
  for manifest in namespace configmap deployment service service-nodeport ingress; do
    echo "--- k8s/${manifest}.yaml ---"
    "${KUBECTL}" apply --dry-run=client --validate=false -o name -f "${K8S_DIR}/${manifest}.yaml"
    echo ""
  done
} | tee "${PROOF_DIR}/kubectl-dry-run-client.txt"

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo ""
  echo "=== kubeconform schema validation (kubeval successor) ==="
  "${KUBECONFORM}" -strict -summary "${K8S_DIR}/namespace.yaml"
  "${KUBECONFORM}" -strict -summary "${K8S_DIR}/configmap.yaml"
  "${KUBECONFORM}" -strict -summary "${K8S_DIR}/deployment.yaml"
  "${KUBECONFORM}" -strict -summary "${K8S_DIR}/service.yaml"
  "${KUBECONFORM}" -strict -summary "${K8S_DIR}/service-nodeport.yaml"
  "${KUBECONFORM}" -strict -summary "${K8S_DIR}/ingress.yaml"
} | tee "${PROOF_DIR}/kubeval-validate.txt"

if ! command -v docker >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
  if ! kubectl config get-contexts -o name 2>/dev/null | grep -qx 'colima' \
    && ! kind get clusters 2>/dev/null | grep -qx "${CLUSTER_NAME}"; then
    {
      echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
      echo "SKIP live cluster proof — Docker/Kubernetes not available."
      echo "Client-side validation completed (dry-run + kubeconform)."
    } | tee "${PROOF_DIR}/kubectl-apply.txt" "${PROOF_DIR}/curl-proof.txt"
    echo "Proof files written to ${PROOF_DIR}/ (offline only)"
    exit 0
  fi
fi

if kubectl config get-contexts -o name 2>/dev/null | grep -qx 'colima'; then
  kubectl config use-context colima >/dev/null 2>&1 || true
fi

# Reset namespace for reproducible server dry-run + deploy (proof capture only).
"${ROOT}/scripts/start-host-service.sh" stop 2>/dev/null || true
"${KUBECTL}" delete namespace d4-notify --ignore-not-found --wait=true 2>/dev/null || true

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo ""
  echo "=== kubectl apply --dry-run=server (live API validation) ==="
  "${KUBECTL}" apply -f "${K8S_DIR}/namespace.yaml"
  for manifest in configmap deployment service service-nodeport ingress; do
    echo "--- k8s/${manifest}.yaml ---"
    "${KUBECTL}" apply --dry-run=server -f "${K8S_DIR}/${manifest}.yaml"
    echo ""
  done
  echo "--- k8s/overlays/host-bridge/service.yaml ---"
  "${KUBECTL}" apply --dry-run=server -f "${K8S_DIR}/overlays/host-bridge/service.yaml"
  echo ""
  "${KUBECTL}" delete namespace d4-notify --ignore-not-found --wait=true
} | tee "${PROOF_DIR}/kubectl-dry-run-server.txt"

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Command: CLUSTER_NAME=${CLUSTER_NAME} IMAGE_NAME=${IMAGE_NAME} ./scripts/up.sh"
  echo ""
  CLUSTER_NAME="${CLUSTER_NAME}" IMAGE_NAME="${IMAGE_NAME}" "${ROOT}/scripts/up.sh"
} | tee "${PROOF_DIR}/kubectl-apply.txt"

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo ""
  echo "=== kubectl get all -n d4-notify ==="
  "${KUBECTL}" -n d4-notify get all 2>/dev/null || true
  echo ""
  echo "=== kubectl get svc,endpoints -n d4-notify ==="
  "${KUBECTL}" -n d4-notify get svc,endpoints
  echo ""
  if "${KUBECTL}" -n d4-notify get deployment d4-notify >/dev/null 2>&1; then
    echo "=== kubectl describe deployment/d4-notify ==="
    "${KUBECTL}" -n d4-notify describe deployment/d4-notify
  else
    echo "=== host-bridge mode (no Deployment — Endpoints route to host uvicorn) ==="
    "${KUBECTL}" -n d4-notify describe endpoints d4-notify
  fi
} | tee "${PROOF_DIR}/kubectl-get-resources.txt"

sleep 5

curl_endpoint() {
  local label="$1"
  local method="$2"
  local url="$3"
  local data="${4:-}"

  echo "=== ${label} ==="
  if [[ "${method}" == "POST" ]]; then
    curl -sS -w "\nHTTP_STATUS:%{http_code}\n" \
      -X POST \
      -H "Content-Type: application/json" \
      -d "${data}" \
      "${url}" || echo "HTTP_STATUS:000"
  else
    curl -sS -w "\nHTTP_STATUS:%{http_code}\n" "${url}" || echo "HTTP_STATUS:000"
  fi
  echo ""
}

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo ""

  curl_endpoint "curl via NodePort GET /health" GET "http://127.0.0.1:30080/health"
  curl_endpoint "curl via NodePort GET /version" GET "http://127.0.0.1:30080/version"
  curl_endpoint "curl via NodePort POST /notify" POST "http://127.0.0.1:30080/notify" \
    '{"message":"proof from capture-proof.sh"}'

  echo "=== curl via port-forward (ClusterIP service) ==="
  "${KUBECTL}" -n d4-notify port-forward "svc/d4-notify" 18080:80 >/tmp/d4-pf.log 2>&1 &
  PF_PID=$!
  for _ in $(seq 1 15); do
    if curl -sf "http://127.0.0.1:18080/health" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  curl_endpoint "port-forward GET /health" GET "http://127.0.0.1:18080/health"
  curl_endpoint "port-forward POST /notify" POST "http://127.0.0.1:18080/notify" \
    '{"message":"proof via port-forward"}'

  kill "${PF_PID}" 2>/dev/null || true
  wait "${PF_PID}" 2>/dev/null || true

  echo "=== proof summary ==="
  echo "All endpoints should return HTTP_STATUS:200 or HTTP_STATUS:201"
} | tee "${PROOF_DIR}/curl-proof.txt"

"${ROOT}/scripts/start-host-service.sh" stop 2>/dev/null || true

echo "Proof files written to ${PROOF_DIR}/"
