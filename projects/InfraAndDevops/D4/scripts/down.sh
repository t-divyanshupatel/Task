#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS_DIR="${ROOT}/.tools/bin"
CLUSTER_NAME="${CLUSTER_NAME:-d4-notify}"
K8S_DIR="${ROOT}/k8s"

export PATH="${TOOLS_DIR}:${PATH}"

if [[ -x "${TOOLS_DIR}/kubectl" ]]; then
  echo "==> Delete Kubernetes resources"
  kubectl delete -f "${K8S_DIR}/service-nodeport.yaml" --ignore-not-found
  kubectl delete -f "${K8S_DIR}/service.yaml" --ignore-not-found
  kubectl delete -f "${K8S_DIR}/ingress.yaml" --ignore-not-found
  kubectl delete -f "${K8S_DIR}/deployment.yaml" --ignore-not-found
  kubectl delete -f "${K8S_DIR}/configmap.yaml" --ignore-not-found
  kubectl delete -f "${K8S_DIR}/namespace.yaml" --ignore-not-found
fi

if command -v kind >/dev/null 2>&1; then
  if kind get clusters 2>/dev/null | grep -qx "${CLUSTER_NAME}"; then
    echo "==> Delete kind cluster '${CLUSTER_NAME}'"
    kind delete cluster --name "${CLUSTER_NAME}"
  fi
fi

echo "Teardown complete."
