#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS_DIR="${ROOT}/.tools/bin"
CLUSTER_NAME="${CLUSTER_NAME:-d4-notify}"
IMAGE_NAME="${IMAGE_NAME:-d4-notify:local}"
K8S_DIR="${ROOT}/k8s"
MODE="${D4_MODE:-auto}"

export PATH="${TOOLS_DIR}:${ROOT}/.tools/lima/bin:${PATH}"

if [[ -z "${DOCKER_HOST:-}" && -S "${HOME}/.colima/default/docker.sock" ]]; then
  export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"
fi

if [[ ! -x "${TOOLS_DIR}/kubectl" || ! -x "${TOOLS_DIR}/kind" ]]; then
  "${ROOT}/scripts/install-tools.sh"
fi

if ! command -v kubectl >/dev/null 2>&1; then
  echo "kubectl not found after install-tools.sh"
  exit 1
fi

KIND_READY=false
if kind get clusters 2>/dev/null | grep -qx "${CLUSTER_NAME}"; then
  KIND_READY=true
fi

if [[ "${KIND_READY}" == "true" ]]; then
  echo "==> Using existing kind cluster '${CLUSTER_NAME}'"
elif kubectl config get-contexts -o name 2>/dev/null | grep -qx 'colima'; then
  echo "==> Using colima Kubernetes context"
  kubectl config use-context colima
else
  if ! command -v docker >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
    echo "Docker is required to create a kind cluster."
    exit 1
  fi
  echo "==> Creating kind cluster '${CLUSTER_NAME}'"
  kind create cluster --name "${CLUSTER_NAME}" --wait 120s
  KIND_READY=true
fi

build_container_image() {
  if ! command -v docker >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
    return 1
  fi
  local build_log
  build_log="$(mktemp)"
  if docker build -t "${IMAGE_NAME}" "${ROOT}" 2>"${build_log}"; then
    rm -f "${build_log}"
    return 0
  fi
  echo "Container image build failed:"
  tail -20 "${build_log}"
  rm -f "${build_log}"
  return 1
}

load_image_to_cluster() {
  if [[ "${KIND_READY}" == "true" ]]; then
    echo "==> Load image into kind"
    kind load docker-image "${IMAGE_NAME}" --name "${CLUSTER_NAME}"
  else
    echo "==> Import image into colima k3s containerd"
    docker save "${IMAGE_NAME}" | colima ssh -- sudo ctr --address /run/containerd/containerd.sock -n k8s.io images import -
  fi
}

deploy_container() {
  echo "==> Deploy mode: container (Deployment + Service)"
  load_image_to_cluster
  kubectl apply -f "${K8S_DIR}/namespace.yaml"
  kubectl apply -f "${K8S_DIR}/configmap.yaml"
  kubectl apply -f "${K8S_DIR}/deployment.yaml"
  kubectl apply -f "${K8S_DIR}/service.yaml"
  kubectl apply -f "${K8S_DIR}/service-nodeport.yaml"
  kubectl -n d4-notify delete endpoints d4-notify --ignore-not-found
  kubectl -n d4-notify rollout restart deployment/d4-notify
  kubectl -n d4-notify rollout status deployment/d4-notify --timeout=180s
}

deploy_host_bridge() {
  echo "==> Deploy mode: host-bridge (real FastAPI on host + K8s Endpoints)"
  echo "    Use when container registry pulls fail (e.g. colima TLS)."
  kubectl -n d4-notify delete deployment d4-notify --ignore-not-found
  kubectl -n d4-notify delete svc d4-notify d4-notify-nodeport --ignore-not-found
  "${ROOT}/scripts/start-host-service.sh" start
  "${ROOT}/scripts/apply-host-bridge.sh"
}

USE_CONTAINER=false
if [[ "${MODE}" == "container" ]]; then
  echo "==> Build container image (production Dockerfile — FastAPI service)"
  build_container_image
  USE_CONTAINER=true
elif [[ "${MODE}" == "host-bridge" ]]; then
  USE_CONTAINER=false
else
  echo "==> Build container image (production Dockerfile — FastAPI service)"
  if build_container_image; then
    USE_CONTAINER=true
  else
    echo "==> Falling back to host-bridge (real FastAPI process on host)"
    USE_CONTAINER=false
  fi
fi

if [[ "${USE_CONTAINER}" == "true" ]]; then
  echo "Built production image from Dockerfile"
  deploy_container
else
  deploy_host_bridge
fi

echo ""
echo "==> Pod / endpoint status"
kubectl -n d4-notify get pods,svc,endpoints 2>/dev/null || kubectl -n d4-notify get svc,endpoints

echo ""
echo "Cluster is up. Try:"
echo "  curl -s http://127.0.0.1:30080/health"
echo "  curl -s -X POST http://127.0.0.1:30080/notify -H 'Content-Type: application/json' -d '{\"message\":\"hello\"}'"
