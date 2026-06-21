#!/usr/bin/env bash
# Apply host-bridge Service + Endpoints so K8s routes to uvicorn on the host.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
K8S_DIR="${ROOT}/k8s"
HOST_IP="$("${ROOT}/scripts/host-ip-for-pods.sh")"
PORT="${D4_HOST_PORT:-8000}"

kubectl apply -f "${K8S_DIR}/namespace.yaml"
kubectl apply -f "${K8S_DIR}/configmap.yaml"
kubectl apply -f "${K8S_DIR}/overlays/host-bridge/service.yaml"

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Endpoints
metadata:
  name: d4-notify
  namespace: d4-notify
  labels:
    app.kubernetes.io/name: d4-notify
    d4-notify/mode: host-bridge
subsets:
  - addresses:
      - ip: ${HOST_IP}
    ports:
      - name: http
        port: ${PORT}
        protocol: TCP
EOF

echo "Host-bridge endpoints: ${HOST_IP}:${PORT} -> Service d4-notify:80 (NodePort 30080)"
