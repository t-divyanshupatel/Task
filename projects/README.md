# Task Projects — Sandbox Library

Runnable **project sandboxes** for learning, proof-of-concept delivery, and agent evaluation. Each folder is a self-contained mini application or infrastructure stack with its own README, tests, and (where applicable) proof artifacts.

These projects are **separate from** [`Task/agents/`](../agents/README.md) — agents analyze external repos; projects are the code those exercises are built on or around.

---

## Folder structure

```
Task/projects/
├── README.md              ← You are here
├── Basics/                ← Greenfield single-language apps (B4–B6)
│   ├── B4/  Transaction Ledger API (FastAPI)
│   ├── B5/  Transaction Ledger API (Node.js / Express)
│   └── B6/  Log Counter CLI (Rust)
├── Intermediate/          ← Multi-component and container work (I4–I5)
│   ├── I4/  Currency Converter (FastAPI + Node CLI)
│   └── I5/  Currency Converter Docker image
├── Advanced/              ← Parallel git worktrees + polyglot pipelines (A1–A3)
│   ├── A1/  Multi-worktree parallel plan (enrollment API)
│   ├── A2/  Two-lane worktree execution (enrollment API)
│   └── A3/  Fraud scoring pipeline (Python + Node + Rust)
└── InfraAndDevops/        ← Terraform, Compose, CI, K8s, bootstrap, observability (D1–D6)
    ├── D1/  Terraform AWS stack (S3 + Lambda + API Gateway)
    ├── D2/  Multi-service Docker Compose (Postgres + API + worker)
    ├── D3/  GitHub Actions CI pipeline
    ├── D4/  Kubernetes manifests (kind / minikube)
    ├── D5/  One-command repo bootstrap (Makefile + mise)
    └── D6/  Observability bolt-on (Prometheus + Grafana)
```

Every project follows a similar layout:

```
{Tier}/{ID}/
├── README.md           ← Install, run, test, and proof instructions
├── {app,api,service}/  ← Source code (varies by project)
├── tests/              ← Automated tests (where applicable)
├── proof/              ← Screenshots, logs, captured command output
└── scripts/            ← Proof regeneration, E2E, bootstrap helpers
```

---

## Project catalog

### Basics — greenfield single-language apps

| ID | Name | Stack | What it does | Tests | Docs |
|----|------|-------|--------------|-------|------|
| **B4** | Transaction Ledger API | Python, FastAPI, Pydantic, pytest | In-memory ledger for deposits and withdrawals. Endpoints: `POST/GET /transactions`, `GET /balance`. Validates input and rejects overdrafts. | 17 pytest | [B4/README.md](./Basics/B4/README.md) |
| **B5** | Transaction Ledger API | Node.js, Express, Zod, Vitest | Same domain as B4 — Node.js counterpart with identical API shape and business rules. | 16 Vitest | [B5/README.md](./Basics/B5/README.md) |
| **B6** | Log Counter CLI | Rust, Cargo | CLI that counts `INFO`, `WARN`, and `ERROR` lines in a log file. Handles missing files gracefully. | 11 Cargo (8 unit + 3 integration) | [B6/README.md](./Basics/B6/README.md) |

#### B4 — Transaction Ledger API (FastAPI)

- **Purpose:** Demonstrate a greenfield REST API with validation, business rules, and a full test suite.
- **Key endpoints:** `POST /transactions`, `GET /transactions`, `GET /balance`
- **Business rules:** Amount must be > 0; withdrawal rejected if balance insufficient.
- **Storage:** In-memory (no database).
- **Quick start:**

```bash
cd Task/projects/Basics/B4
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest -v
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- **OpenAPI docs:** http://127.0.0.1:8000/docs

#### B5 — Transaction Ledger API (Node.js)

- **Purpose:** Same ledger domain as B4, implemented in Node.js for cross-language comparison.
- **Key endpoints:** Identical to B4 (`/transactions`, `/balance`).
- **Validation:** Zod schemas; `422` on invalid input.
- **Quick start:**

```bash
cd Task/projects/Basics/B5
npm install
npm test
npm start   # http://127.0.0.1:3000
```

#### B6 — Log Counter CLI (Rust)

- **Purpose:** Demonstrate a Cargo CLI with file I/O, parsing logic, and integration tests.
- **Usage:** `log-counter <log-file>` — prints counts for INFO, WARN, ERROR.
- **Severity rule:** If a line mentions multiple levels, ERROR > WARN > INFO.
- **Quick start:**

```bash
cd Task/projects/Basics/B6
cargo test
cargo run -- examples/sample.log
```

---

### Intermediate — multi-component and container work

| ID | Name | Stack | What it does | Tests | Docs |
|----|------|-------|--------------|-------|------|
| **I4** | Currency Converter | FastAPI + Node.js CLI | Two-component system: FastAPI service with hardcoded FX rates; Node CLI calls it over HTTP. | 16 pytest (service) + 9 Vitest (client) | [I4/README.md](./Intermediate/I4/README.md) |
| **I5** | Currency Converter Docker | Docker, Python 3.11-slim | Docker image packaging the I4 FastAPI service. Health check + curl verification. | Container smoke tests | [I5/README.md](./Intermediate/I5/README.md) |

#### I4 — Currency Converter (FastAPI + Node CLI)

- **Purpose:** Two-terminal multi-service setup with validation on both sides.
- **Service endpoints:** `GET /health`, `GET /rates`, `POST /convert`
- **Supported currencies:** USD, EUR, GBP, INR, JPY (hardcoded USD-base rates).
- **CLI commands:** `health`, `rates`, `convert <amount> <from> <to>`
- **Quick start (two terminals):**

```bash
# Terminal 1 — service
cd Task/projects/Intermediate/I4/service
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 — client
cd Task/projects/Intermediate/I4/client
npm install
node src/cli.js convert 100 USD EUR
```

#### I5 — Currency Converter Docker

- **Purpose:** Containerize the I4 FastAPI service with production deps only.
- **Build context:** Must run from `Task/projects/Intermediate/` (parent of I4 and I5).
- **Image:** `currency-converter-api:i5` on `python:3.11-slim`.
- **Quick start:**

```bash
cd Task/projects/Intermediate
docker build -f I5/Dockerfile -t currency-converter-api:i5 .
docker run --rm -p 8000:8000 currency-converter-api:i5
curl -s http://127.0.0.1:8000/health
```

---

### Advanced — parallel git worktrees and polyglot pipelines

| ID | Name | Stack | What it does | Proof | Docs |
|----|------|-------|--------------|-------|------|
| **A1** | Multi-Worktree Parallel Plan | FastAPI (planned), git worktrees | Planning deliverable: decompose a Student Enrollment API into 3 parallel lanes with merge order and agent prompts. | Plan docs + runbook | [A1/README.md](./Advanced/A1/README.md) |
| **A2** | Two-Lane Worktree Execution | FastAPI, SQLAlchemy, SQLite, pytest | Executes a 2-lane worktree merge (persistence + HTTP), ships merged app in `sandbox/enrollment-api/`. | 7 pytest + curl logs | [A2/README.md](./Advanced/A2/README.md) |
| **A3** | Fraud Scoring Pipeline | FastAPI + Node.js worker + Rust CLI | Ingest transactions, poll pending queue, score via Rust CLI, store results. Full polyglot integration. | 4 Rust + 11 pytest + 10 Jest | [A3/README.md](./Advanced/A3/README.md) |

#### A1 — Multi-Worktree Parallel Plan

- **Purpose:** Document how to supervise parallel agent work using git worktrees — **planning only**, no runnable app.
- **Domain:** Student Enrollment REST API (students, enrollments, registry summary).
- **Three lanes:** persistence (`feat/student-models`), HTTP (`feat/enrollment-routes`), QA (`feat/enrollment-tests`).
- **Key deliverables:**
  - `proof/enrollment-contract.md` — frozen API contract
  - `proof/parallel-work-plan.md` — decomposition, prompts, merge order
  - `proof/orchestration-runbook.md` — 45-minute supervisor checklist
- **Regenerate proof:**

```bash
cd Task/projects/Advanced/A1
./scripts/capture-proof.sh
```

#### A2 — Two-Lane Worktree Execution

- **Purpose:** Execute A1's domain with a simplified 2-lane split and prove clean merge.
- **Lanes:** Alpha (persistence: models, DB, config) + Beta (HTTP: routes, schemas).
- **Merged app:** `sandbox/enrollment-api/` — runnable FastAPI + SQLite service.
- **Endpoints:** `POST/GET /students`, `POST/GET /enrollments`, `GET /registry/summary`
- **Quick start (merged app):**

```bash
cd Task/projects/Advanced/A2/sandbox/enrollment-api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest tests/ -v
uvicorn app.main:app --host 127.0.0.1 --port 8010
```

- **Regenerate worktree demo + proof:**

```bash
cd Task/projects/Advanced/A2
./scripts/run-two-lane-demo.sh
./scripts/capture-proof.sh
```

#### A3 — Mini Fraud Score System

- **Purpose:** Three-language pipeline — FastAPI ingestion, Node.js polling worker, Rust scoring CLI.
- **Flow:** `POST /transactions` → pending queue → worker polls → Rust CLI scores → `POST /transactions/{id}/score`
- **Scoring rules:** High amount, risky merchant category, risky country → `risk_score`, `risk_level`, `reasons`.
- **Data contract:** JSON Schema in `contracts/`
- **Quick start (one command):**

```bash
cd Task/projects/Advanced/A3
./scripts/run-integration.sh
```

- **Manual three-terminal run:** Build Rust scorer → start FastAPI on :8000 → start Node worker.
- **All unit tests:**

```bash
cd Task/projects/Advanced/A3
./scripts/run-all-tests.sh
```

---

### Infra & DevOps — infrastructure and platform engineering

| ID | Name | Stack | What it does | Proof | Docs |
|----|------|-------|--------------|-------|------|
| **D1** | Terraform AWS Stack | Terraform, LocalStack, Lambda, S3, API Gateway | Provisions S3 + Lambda + REST API (`GET /`, `GET /health`). LocalStack for local apply. | `terraform validate` + plan | [D1/README.md](./InfraAndDevops/D1/README.md) |
| **D2** | Multi-Service Compose | Docker Compose, Postgres, FastAPI, Python worker | Job processing stack: API creates jobs, worker processes them (uppercase/reverse). | E2E pytest via `run-e2e.sh` | [D2/README.md](./InfraAndDevops/D2/README.md) |
| **D3** | CI Pipeline | GitHub Actions, Ruff, pytest matrix, Docker | Lint + test (Python 3.9/3.11 matrix) + Docker build on every push/PR. | Local CI mirror + failure demo | [D3/README.md](./InfraAndDevops/D3/README.md) |
| **D4** | Kubernetes Manifests | kind/minikube, kubectl, FastAPI | Deploy notify service with Deployment, Service, ConfigMap, optional Ingress. | dry-run + curl via NodePort | [D4/README.md](./InfraAndDevops/D4/README.md) |
| **D5** | One-Command Bootstrap | Makefile, mise, Dev Container | `make bootstrap` from fresh clone: Python pin, venv, deps, tests. | Bootstrap + test output | [D5/README.md](./InfraAndDevops/D5/README.md) |
| **D6** | Observability Bolt-on | Prometheus, Grafana, FastAPI | JSON structured logging + `/metrics` on order API; provisioned Grafana dashboard. | Metrics, logs, dashboard JSON | [D6/README.md](./InfraAndDevops/D6/README.md) |

#### D1 — Terraform AWS Stack

- **Purpose:** Infrastructure-as-code with variables, local backend, and LocalStack testing.
- **Resources:** S3 bucket (versioned), Lambda (Python 3.11), IAM role, API Gateway REST API.
- **Quick start:**

```bash
cd Task/projects/InfraAndDevops/D1
docker compose up -d          # LocalStack
cd terraform
terraform init
terraform validate
terraform plan
terraform apply               # local apply against LocalStack
```

#### D2 — Multi-Service Docker Compose

- **Purpose:** Three-service orchestration with seed data and one-command E2E verification.
- **Services:** `db` (Postgres), `api` (FastAPI on :8000), `worker` (polls and processes jobs).
- **Job types:** `uppercase`, `reverse` text transformations.
- **Quick start:**

```bash
cd Task/projects/InfraAndDevops/D2
./scripts/run-e2e.sh          # build, up, test, capture logs
```

#### D3 — CI Pipeline (GitHub Actions)

- **Purpose:** Full CI/CD workflow — lint (Ruff), test matrix (Python 3.9 + 3.11), Docker image build.
- **Target app:** D3 Notify Service (`GET /health`, `GET /version`, `POST /notify`).
- **Failure demo:** Intentional broken files in `demo/` for pipeline failure proof.
- **Quick start (local CI mirror):**

```bash
cd Task/projects/InfraAndDevops/D3
./scripts/run-ci-local.sh
```

#### D4 — Kubernetes Manifests

- **Purpose:** Deploy a FastAPI notify service to a local kind/minikube cluster.
- **Manifests:** Namespace, ConfigMap, Deployment (2 replicas), ClusterIP + NodePort Service, optional Ingress.
- **Validation:** `kubectl apply --dry-run=client`, kubeconform/kubeval.
- **Quick start:**

```bash
cd Task/projects/InfraAndDevops/D4
./scripts/up.sh               # create cluster, build image, apply manifests
curl -s http://127.0.0.1:30080/health
./scripts/down.sh             # teardown
```

#### D5 — One-Command Repo Bootstrap

- **Purpose:** Eliminate implicit setup — single command installs Python, deps, and runs tests.
- **Entry point:** `make bootstrap` (uses `scripts/bootstrap.sh`).
- **Tooling:** `mise.toml` (Python 3.11.9), `.devcontainer/` for Cursor/VS Code.
- **Quick start:**

```bash
cd Task/projects/InfraAndDevops/D5
make bootstrap
```

#### D6 — Observability Bolt-on

- **Purpose:** Add structured JSON logging and Prometheus metrics to a FastAPI order service; visualize in Grafana.
- **Stack:** FastAPI API + Prometheus (:9090) + Grafana (:3000) via Docker Compose.
- **Metrics:** `http_requests_total`, request duration histograms via middleware.
- **Quick start:**

```bash
cd Task/projects/InfraAndDevops/D6
./scripts/up.sh
./scripts/load.sh             # generate traffic
./scripts/verify.sh           # full proof pipeline
open http://127.0.0.1:3000    # Grafana (admin/admin)
```

---

## Project relationships

Some projects build on or extend others:

```
B4 (FastAPI ledger)  ←── same domain ──→  B5 (Node ledger)

I4 (Currency Converter service + CLI)
 └── I5 (Docker image of I4 service)

A1 (3-lane parallel plan — enrollment API)
 └── A2 (2-lane execution — merged sandbox app)

A3 (standalone polyglot fraud pipeline)

D3, D4, D5 (each has its own minimal FastAPI notify/echo app)
D6 (order API with observability bolt-on)
```

| From | To | Relationship |
|------|----|--------------|
| B4 | B5 | Same Transaction Ledger API, different language |
| I4 | I5 | I5 Docker image packages I4 FastAPI service |
| A1 | A2 | A1 plans 3-lane work; A2 executes simplified 2-lane merge |
| D3 | D4 | Similar notify-service pattern; D3 = CI, D4 = K8s deploy |

---

## Tech stack summary

| Project | Languages | Frameworks / Tools | Database | Container |
|---------|-----------|-------------------|----------|-----------|
| B4 | Python | FastAPI, pytest | In-memory | — |
| B5 | JavaScript | Express, Vitest, Zod | In-memory | — |
| B6 | Rust | Cargo | File I/O | — |
| I4 | Python + JS | FastAPI + Node CLI | — | — |
| I5 | Python | FastAPI (in Docker) | — | Docker |
| A1 | — (docs only) | git worktrees | — | — |
| A2 | Python | FastAPI, SQLAlchemy, SQLite | SQLite | — |
| A3 | Python + JS + Rust | FastAPI, Node worker, Rust CLI | SQLite | — |
| D1 | Python + HCL | Terraform, Lambda, LocalStack | S3 | Docker (LocalStack) |
| D2 | Python + SQL | FastAPI, Docker Compose | PostgreSQL | Docker Compose |
| D3 | Python | FastAPI, GitHub Actions, Ruff | — | Docker |
| D4 | Python + YAML | FastAPI, kubectl, kind | — | Docker + K8s |
| D5 | Python + Make | FastAPI, mise, Dev Container | — | Dev Container |
| D6 | Python + YAML | FastAPI, Prometheus, Grafana | — | Docker Compose |

---

## Prerequisites by tier

| Tier | Typical tools |
|------|---------------|
| **Basics** | Python 3.9+ (B4), Node.js 18+ (B5), Rust 1.70+ (B6) |
| **Intermediate** | Python 3.9+ and Node.js 18+ (I4); Docker 20+ (I5) |
| **Advanced** | Python 3.9+, Node.js 18+, Rust 1.70+, git (A2/A3) |
| **Infra & DevOps** | Docker 20+ (all); Terraform ≥ 1.5 (D1); kubectl + kind (D4); mise optional (D5) |

---

## Proof artifacts

Most projects include a `proof/` directory with evidence that install, run, and test steps work:

| Artifact type | Examples |
|---------------|----------|
| Screenshots | `proof/pytest-all-tests-passed.png`, `proof/server-running-smoke-test.png` |
| Command logs | `proof/merged-verification-log.txt`, `proof/terraform-plan.txt` |
| Captured output | `proof/run-all-tests-output.txt`, `proof/bootstrap-full-output.txt` |
| Reports | `proof/reconciliation-report.md`, `proof/parallel-work-plan.md` |

Regenerate proof for any project that ships a capture script:

```bash
cd Task/projects/{Tier}/{ID}
./scripts/capture-proof.sh    # or tier-specific script (see project README)
```

---

## How projects relate to agents

| Path | Role |
|------|------|
| [`Task/projects/`](../projects/) | Runnable sandboxes — APIs, CLIs, infra stacks |
| [`Task/agents/`](../agents/README.md) | Cursor agent definitions — analyze repos, produce reports |
| [`Task/extra/medusa/`](../extra/medusa/) | Sample commerce monorepo used as agent analysis target |

Agents (B1–B3, I1–I3, A4–A6) operate on **external repos** like Medusa. Projects here are **targets for building and verifying** greenfield skills — not agent instruction folders.

---

## Quick navigation

| Tier | Projects |
|------|----------|
| Basics | [B4](./Basics/B4/README.md) · [B5](./Basics/B5/README.md) · [B6](./Basics/B6/README.md) |
| Intermediate | [I4](./Intermediate/I4/README.md) · [I5](./Intermediate/I5/README.md) |
| Advanced | [A1](./Advanced/A1/README.md) · [A2](./Advanced/A2/README.md) · [A3](./Advanced/A3/README.md) |
| Infra & DevOps | [D1](./InfraAndDevops/D1/README.md) · [D2](./InfraAndDevops/D2/README.md) · [D3](./InfraAndDevops/D3/README.md) · [D4](./InfraAndDevops/D4/README.md) · [D5](./InfraAndDevops/D5/README.md) · [D6](./InfraAndDevops/D6/README.md) |
