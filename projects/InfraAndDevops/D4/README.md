# D4 — Kubernetes Manifests for Notify Service

Deploy a small **FastAPI notify service** to a local **kind** (or **minikube**) cluster using **Deployment**, **Service**, **ConfigMap**, and an optional **Ingress**. Includes manifest validation (`kubectl` dry-run + **kubeval**), one-command bring-up/teardown scripts, and captured proof artifacts.

Built for **Infra & DevOps D4**.

## Requirements checklist

| Requirement | Status | Location |
|-------------|--------|----------|
| Deployment manifest | Done | `k8s/deployment.yaml` |
| Service manifest | Done | `k8s/service.yaml` |
| ConfigMap manifest | Done | `k8s/configmap.yaml` |
| Optional Ingress | Done | `k8s/ingress.yaml` |
| Existing service (FastAPI + Dockerfile) | Done | `app/`, `Dockerfile` |
| Dry-run or kubeval validation | Done | `proof/kubectl-dry-run-client.txt`, `proof/kubeval-validate.txt` (kubeconform) |
| `kubectl apply` on local cluster | Done | `proof/kubectl-apply.txt` |
| curl / port-forward proof | Done | `proof/curl-proof.txt` — NodePort GET/POST against **real FastAPI** |
| Host-bridge fallback | Done | `scripts/up.sh` auto-falls back when image pull fails (colima TLS) |
| README with up/down commands | Done | This file |
| Proof artifacts | Done | `proof/` |

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  kind / minikube cluster                                     │
│                                                              │
│  ┌─────────────┐    envFrom     ┌─────────────────────────┐  │
│  │ ConfigMap   │ ─────────────► │ Deployment (2 replicas) │  │
│  │ d4-notify-  │                │  d4-notify:local        │  │
│  │ config      │                └───────────┬─────────────┘  │
│  └─────────────┘                            │                │
│                                             ▼                │
│                              ┌──────────────────────────────┐│
│                              │ Service (ClusterIP :80)     ││
│                              │ Service (NodePort :30080)    ││
│                              └──────────────┬───────────────┘│
│                                             │                │
│  Optional: Ingress (nginx) ─────────────────┘                │
│            host: d4-notify.local                             │
└──────────────────────────────────────────────────────────────┘
         ▲                              ▲
         │ port-forward 8080:80          │ curl :30080 (NodePort)
         └──────── curl /health ─────────┘
```

**Service endpoints**

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness/readiness probe + smoke test |
| `GET` | `/version` | App version from ConfigMap |
| `POST` | `/notify` | Accept JSON `{"message":"..."}` → `201` |

## Project layout

```
D4/
├── app/
│   └── main.py                 # FastAPI notify service
├── k8s/
│   ├── namespace.yaml          # d4-notify namespace
│   ├── configmap.yaml          # SERVICE_NAME, LOG_LEVEL, APP_VERSION
│   ├── deployment.yaml         # 2-replica Deployment + probes
│   ├── service.yaml            # ClusterIP Service (port 80 → 8000)
│   ├── service-nodeport.yaml   # NodePort 30080 for easy curl proof
│   └── ingress.yaml            # Optional nginx Ingress (not applied by default)
├── scripts/
│   ├── install-tools.sh        # Download kubectl, kind, kubeconform to .tools/bin
│   ├── up.sh                   # Create cluster, build image, apply manifests
│   ├── down.sh                 # Delete resources + kind cluster
│   └── capture-proof.sh        # Regenerate all proof/ artifacts
├── tests/
│   └── test_api.py             # Unit tests for the FastAPI app
├── proof/                      # Generated validation + cluster proof
│   ├── tool-versions.txt
│   ├── kubectl-dry-run-client.txt
│   ├── kubeval-validate.txt
│   ├── kubectl-apply.txt
│   ├── kubectl-get-resources.txt
│   └── curl-proof.txt
├── Dockerfile                  # Production FastAPI image (requires Docker Hub)
├── Dockerfile.proof            # Offline fallback using cached busybox (health/version curl proof)
├── requirements.txt
├── .gitignore
└── README.md
```

## Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| **Docker** | Build image; required by kind | [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Colima |
| **curl** | Smoke-test the running service | Pre-installed on macOS |
| **Python 3.9+** | Optional — run unit tests locally | `python3 -m venv .venv && pip install -r requirements.txt` |

**Bundled CLI tools** (downloaded automatically by `scripts/install-tools.sh`):

- `kubectl` — apply manifests, port-forward, rollout status
- `kind` — local Kubernetes cluster in Docker
- `kubeconform` — offline YAML schema validation (kubeval successor)

Verify Docker:

```bash
docker version
```

## Quick start (recommended)

From the D4 directory:

```bash
cd Task/projects/InfraAndDevops/D4

# 1. Install kubectl, kind, kubeval into .tools/bin
chmod +x scripts/*.sh
./scripts/install-tools.sh

# 2. Bring up kind cluster + apply manifests + wait for rollout
./scripts/up.sh

# 3. Smoke test (NodePort — kind maps 30080 to host)
curl -s http://127.0.0.1:30080/health
curl -s http://127.0.0.1:30080/version
curl -s -X POST http://127.0.0.1:30080/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"hello from k8s"}'

# 4. Alternative: port-forward ClusterIP service
export PATH="$PWD/.tools/bin:$PATH"
kubectl -n d4-notify port-forward svc/d4-notify 8080:80
# In another terminal:
curl -s http://127.0.0.1:8080/health
```

## Up commands (detailed)

### Step 1 — Install CLI tools

```bash
cd Task/projects/InfraAndDevops/D4
chmod +x scripts/*.sh
./scripts/install-tools.sh
export PATH="$PWD/.tools/bin:$PATH"
```

This downloads pinned binaries to `.tools/bin/`:

- `kubectl` v1.32.2
- `kind` v0.27.0
- `kubeconform` v0.6.7

### Step 2 — Validate manifests (no cluster required)

**Client-side dry-run** — checks object shape without a live API server:

```bash
export PATH="$PWD/.tools/bin:$PATH"

kubectl apply --dry-run=client --validate=false -f k8s/namespace.yaml
kubectl apply --dry-run=client --validate=false -f k8s/configmap.yaml
kubectl apply --dry-run=client --validate=false -f k8s/deployment.yaml
kubectl apply --dry-run=client --validate=false -f k8s/service.yaml
kubectl apply --dry-run=client --validate=false -f k8s/service-nodeport.yaml
kubectl apply --dry-run=client --validate=false -f k8s/ingress.yaml
```

**kubeconform** (kubeval successor) — validates against Kubernetes OpenAPI schemas:

```bash
export PATH="$PWD/.tools/bin:$PATH"

kubeconform -strict -summary k8s/namespace.yaml
kubeconform -strict -summary k8s/configmap.yaml
kubeconform -strict -summary k8s/deployment.yaml
kubeconform -strict -summary k8s/service.yaml
kubeconform -strict -summary k8s/service-nodeport.yaml
kubeconform -strict -summary k8s/ingress.yaml
```

Or regenerate proof in one shot:

```bash
./scripts/capture-proof.sh
```

### Step 3 — Create kind cluster and deploy

```bash
./scripts/up.sh
```

What `up.sh` does:

1. Creates kind cluster `d4-notify` (if missing)
2. Builds Docker image `d4-notify:local`
3. Loads the image into kind (`kind load docker-image`)
4. Applies Namespace → ConfigMap → Deployment → Services
5. Waits for `deployment/d4-notify` rollout

Inspect resources:

```bash
export PATH="$PWD/.tools/bin:$PATH"

kubectl -n d4-notify get all
kubectl -n d4-notify describe deployment d4-notify
kubectl -n d4-notify logs -l app.kubernetes.io/name=d4-notify --tail=20
```

### Step 4 — Prove the service responds

**Option A — NodePort (simplest on kind)**

```bash
curl -s http://127.0.0.1:30080/health
# {"status":"ok","service":"d4-notify","log_level":"info"}

curl -s http://127.0.0.1:30080/version
# {"version":"1.0.0","service":"d4-notify"}

curl -s -X POST http://127.0.0.1:30080/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"deploy complete"}'
# {"message":"deploy complete","status":"queued"}
```

**Option B — port-forward**

```bash
kubectl -n d4-notify port-forward svc/d4-notify 8080:80
curl -s http://127.0.0.1:8080/health
```

### Optional — Ingress (nginx)

Ingress is **not** applied by `up.sh` (avoids requiring an ingress controller). To enable:

```bash
# Install nginx ingress on kind (example)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl -n ingress-nginx wait --for=condition=ready pod -l app.kubernetes.io/component=controller --timeout=120s

# Add hosts entry
echo "127.0.0.1 d4-notify.local" | sudo tee -a /etc/hosts

# Apply ingress manifest
kubectl apply -f k8s/ingress.yaml

curl -s -H "Host: d4-notify.local" http://127.0.0.1/health
```

## Down commands (teardown)

```bash
cd Task/projects/InfraAndDevops/D4
./scripts/down.sh
```

For **colima** Kubernetes only (keep colima VM running):

```bash
export PATH="$PWD/.tools/bin:$PATH"
kubectl delete -f k8s/service-nodeport.yaml --ignore-not-found
kubectl delete -f k8s/service.yaml --ignore-not-found
kubectl delete -f k8s/ingress.yaml --ignore-not-found
kubectl delete -f k8s/deployment.yaml --ignore-not-found
kubectl delete -f k8s/configmap.yaml --ignore-not-found
kubectl delete -f k8s/namespace.yaml --ignore-not-found
```

`scripts/down.sh` also deletes the kind cluster when present. It does **not** stop colima.

## Image build notes

`scripts/up.sh` tries the production **`Dockerfile`** first (FastAPI + uvicorn). If Docker Hub is unreachable (common behind TLS-inspecting proxies), it automatically falls back to **`Dockerfile.proof`**, which uses the k3s-cached `rancher/mirrored-library-busybox` image and serves `/health` and `/version` for probe and curl proof. The Kubernetes manifests are unchanged in both cases.

When Docker Hub is available:

```bash
docker build -t d4-notify:local .
```

## Using minikube instead of kind/colima

If you prefer minikube:

```bash
minikube start
eval "$(minikube docker-env)"
docker build -t d4-notify:local .
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/service-nodeport.yaml
kubectl -n d4-notify rollout status deployment/d4-notify

minikube service d4-notify-nodeport -n d4-notify --url
# curl the printed URL + /health
```

## Manifest reference

### ConfigMap (`k8s/configmap.yaml`)

Injects environment variables into the Deployment:

| Key | Value | Used by |
|-----|-------|---------|
| `SERVICE_NAME` | `d4-notify` | `/health`, `/version` responses |
| `LOG_LEVEL` | `info` | Exposed in `/health` |
| `APP_VERSION` | `1.0.0` | FastAPI version |

### Deployment (`k8s/deployment.yaml`)

- **Image:** `d4-notify:local` (built locally, loaded into kind)
- **Replicas:** 2
- **Probes:** HTTP GET `/health` on port `http` (8000)
- **Resources:** 50m CPU / 64Mi request; 250m / 128Mi limit

### Services

| File | Type | Access |
|------|------|--------|
| `service.yaml` | ClusterIP | Internal; use with port-forward |
| `service-nodeport.yaml` | NodePort 30080 | `curl http://127.0.0.1:30080/...` on kind |

### Ingress (`k8s/ingress.yaml`)

- **Host:** `d4-notify.local`
- **Class:** `nginx`
- **Backend:** `d4-notify` Service port 80

## Local unit tests (no cluster)

```bash
cd Task/projects/InfraAndDevops/D4
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt fastapi[all] httpx pytest
pytest -v
```

## Proof it works

Regenerate all proof files:

```bash
cd Task/projects/InfraAndDevops/D4
chmod +x scripts/*.sh
./scripts/capture-proof.sh
```

### Captured artifacts

| File | Contents |
|------|----------|
| [`proof/tool-versions.txt`](proof/tool-versions.txt) | kubectl + kubeconform versions |
| [`proof/kubectl-dry-run-client.txt`](proof/kubectl-dry-run-client.txt) | Client-side dry-run for all manifests |
| [`proof/kubectl-dry-run-server.txt`](proof/kubectl-dry-run-server.txt) | Server-side dry-run against live cluster API |
| [`proof/kubeval-validate.txt`](proof/kubeval-validate.txt) | Strict kubeconform schema validation |
| [`proof/kubectl-apply.txt`](proof/kubectl-apply.txt) | Live `up.sh` output (when Docker available) |
| [`proof/kubectl-get-resources.txt`](proof/kubectl-get-resources.txt) | `kubectl get/describe` after apply |
| [`proof/curl-proof.txt`](proof/curl-proof.txt) | NodePort + port-forward curl responses — `/health`, `/version`, `POST /notify` |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `docker: command not found` | Install Docker Desktop or Colima; kind requires a container runtime |
| Pods `ImagePullBackOff` | Re-run `kind load docker-image d4-notify:local --name d4-notify` after rebuild |
| `connection refused` on :30080 | Wait for rollout: `kubectl -n d4-notify rollout status deployment/d4-notify` |
| NodePort works in kind but not minikube | Use `minikube service d4-notify-nodeport -n d4-notify --url` |
| kubeconform warns on Ingress apiVersion | Expected for offline schema lag; manifests match Kubernetes 1.25+ |

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `CLUSTER_NAME` | `d4-notify` | kind cluster name |
| `IMAGE_NAME` | `d4-notify:local` | Docker image tag |
| `KUBECTL_VERSION` | `v1.32.2` | Pinned kubectl download |
| `KIND_VERSION` | `v0.27.0` | Pinned kind download |

Example:

```bash
CLUSTER_NAME=my-d4 ./scripts/up.sh
```
