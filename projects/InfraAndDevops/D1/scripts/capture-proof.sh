#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TF_DIR="${ROOT}/terraform"
PROOF_DIR="${ROOT}/proof"
TF_BIN="${ROOT}/.tools/terraform"

if [[ -z "${DOCKER_HOST:-}" && -S "${HOME}/.colima/default/docker.sock" ]]; then
  export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"
fi

install_terraform() {
  mkdir -p "${ROOT}/.tools"
  local os arch url
  os="$(uname -s | tr '[:upper:]' '[:lower:]')"
  arch="$(uname -m)"
  case "${arch}" in
    arm64|aarch64) arch="arm64" ;;
    x86_64|amd64) arch="amd64" ;;
    *) echo "Unsupported arch: ${arch}"; exit 1 ;;
  esac
  url="https://releases.hashicorp.com/terraform/1.9.8/terraform_1.9.8_${os}_${arch}.zip"
  echo "==> Downloading terraform from ${url}"
  curl -fsSL "${url}" -o "${ROOT}/.tools/terraform.zip"
  unzip -qo "${ROOT}/.tools/terraform.zip" -d "${ROOT}/.tools"
  chmod +x "${TF_BIN}"
  rm -f "${ROOT}/.tools/terraform.zip"
}

if [[ -x "${TF_BIN}" ]]; then
  TERRAFORM="${TF_BIN}"
elif command -v terraform >/dev/null 2>&1; then
  TERRAFORM="terraform"
else
  install_terraform
  TERRAFORM="${TF_BIN}"
fi

mkdir -p "${PROOF_DIR}" "${TF_DIR}/build"

cd "${TF_DIR}"

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Command: terraform init && terraform validate"
  echo ""
  echo "==> terraform init"
  "${TERRAFORM}" init -input=false
  echo ""
  echo "==> terraform validate"
  "${TERRAFORM}" validate -no-color
} 2>&1 | tee "${PROOF_DIR}/terraform-validate.txt"

{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Command: terraform plan"
  echo ""
  echo "==> terraform plan"
  "${TERRAFORM}" plan -input=false -no-color
} 2>&1 | tee "${PROOF_DIR}/terraform-plan.txt"

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  {
    echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "Command: docker compose up -d && terraform apply && curl smoke test"
    echo ""
    cd "${ROOT}"
    echo "==> Start LocalStack"
    docker compose up -d
    echo "==> Wait for LocalStack (4566)"
    for _ in $(seq 1 60); do
      if curl -sf "http://127.0.0.1:4566/_localstack/health" >/dev/null 2>&1; then
        echo "LocalStack ready"
        break
      fi
      sleep 2
    done
    cd "${TF_DIR}"
    echo ""
    echo "==> terraform apply -auto-approve"
    "${TERRAFORM}" apply -input=false -auto-approve -no-color
    echo ""
    echo "==> terraform output"
    "${TERRAFORM}" output -no-color
    HEALTH_URL="$("${TERRAFORM}" output -raw api_gateway_localstack_url)health"
    echo ""
    echo "==> curl smoke test: ${HEALTH_URL}"
    curl -sS -w "\nHTTP_STATUS:%{http_code}\n" "${HEALTH_URL}"
    echo ""
    echo "==> terraform destroy -auto-approve"
    "${TERRAFORM}" destroy -input=false -auto-approve -no-color
    cd "${ROOT}"
    echo "==> Stop LocalStack"
    docker compose down -v
  } 2>&1 | tee "${PROOF_DIR}/terraform-apply-smoke.txt"
else
  {
    echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "SKIP apply/smoke — Docker not available."
    echo "Run with Docker to generate proof/terraform-apply-smoke.txt:"
    echo "  cd D1 && ./scripts/capture-proof.sh"
  } > "${PROOF_DIR}/terraform-apply-smoke.txt"
fi

echo "Proof files written to ${PROOF_DIR}/"
