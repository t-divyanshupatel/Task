#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS_DIR="${ROOT}/.tools/bin"
mkdir -p "${TOOLS_DIR}"

ARCH="$(uname -m)"
case "${ARCH}" in
  arm64|aarch64) K8S_ARCH="arm64" ;;
  x86_64|amd64) K8S_ARCH="amd64" ;;
  *)
    echo "Unsupported architecture: ${ARCH}"
    exit 1
    ;;
esac

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
KUBECTL_VERSION="${KUBECTL_VERSION:-v1.32.2}"
KIND_VERSION="${KIND_VERSION:-v0.27.0}"
KUBECONFORM_VERSION="${KUBECONFORM_VERSION:-v0.6.7}"

download() {
  local url="$1"
  local dest="$2"
  echo "==> Downloading $(basename "${dest}")"
  curl -fsSL "${url}" -o "${dest}"
  chmod +x "${dest}"
}

if [[ ! -x "${TOOLS_DIR}/kubectl" ]]; then
  download \
    "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/${OS}/${K8S_ARCH}/kubectl" \
    "${TOOLS_DIR}/kubectl"
fi

if [[ ! -x "${TOOLS_DIR}/kind" ]]; then
  download \
    "https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-${OS}-${K8S_ARCH}" \
    "${TOOLS_DIR}/kind"
fi

if [[ ! -x "${TOOLS_DIR}/kubeconform" ]]; then
  download \
    "https://github.com/yannh/kubeconform/releases/download/${KUBECONFORM_VERSION}/kubeconform-${OS}-${K8S_ARCH}.tar.gz" \
    "${TOOLS_DIR}/kubeconform.tar.gz"
  tar -xzf "${TOOLS_DIR}/kubeconform.tar.gz" -C "${TOOLS_DIR}" kubeconform
  rm -f "${TOOLS_DIR}/kubeconform.tar.gz"
fi

echo "Tools installed in ${TOOLS_DIR}:"
ls -1 "${TOOLS_DIR}"
