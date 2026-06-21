# D2 — Multi-Service Docker Compose Stack

A three-service **job processing stack** built for **Infra & DevOps D2**: PostgreSQL database, FastAPI REST API, and a background Python worker — orchestrated with Docker Compose, seeded on first boot, and verified by a one-command end-to-end test script.

## Requirements checklist

| Requirement | Status | Location |
|-------------|--------|----------|
| `docker-compose.yml` | Done | `docker-compose.yml` |
| Per-service Dockerfiles | Done | `api/Dockerfile`, `worker/Dockerfile` |
| Database + API + Worker | Done | `db/`, `api/`, `worker/` |
| Seed / fixture data | Done | `db/init/02-seed.sql` |
| One-command E2E test run | Done | `scripts/run-e2e.sh` |
| Cross-service log proof | Done | `proof/service-interaction-logs.txt` (generated) |
| Teardown + clean re-up | Done | `scripts/teardown.sh`, `scripts/fresh-start.sh` |
| Detailed README | Done | This file |

## Architecture

```
┌─────────────┐     HTTP (8000)      ┌─────────────┐
│   Client    │ ───────────────────► │  API        │
│  (pytest)   │   POST /jobs         │  FastAPI    │
└─────────────┘   GET  /jobs         └──────┬──────┘
                                            │ SQL
                                            ▼
                                     ┌─────────────┐
                                     │  PostgreSQL │
                                     │  (db)       │
                                     └──────┬──────┘
                                            │ poll + UPDATE
                                            ▼
                                     ┌─────────────┐
                                     │  Worker     │
                                     │  (Python)   │
                                     └─────────────┘
```

**Flow:**

1. Postgres starts and runs `db/init/01-schema.sql` then `db/init/02-seed.sql` on first boot.
2. API connects to Postgres, exposes `/health`, `/jobs` CRUD endpoints.
3. Worker polls Postgres for `pending` jobs, processes them (`uppercase` or `reverse` text tasks), marks them `completed`.
4. E2E tests hit the live API on port 8000 and assert the worker processed seed + newly created jobs.

## Project layout

```
D2/
├── docker-compose.yml          # db + api + worker orchestration
├── api/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py             # FastAPI routes
│   │   ├── models.py           # Pydantic schemas
│   │   └── db.py               # Postgres connection helper
│   └── tests/
│       └── test_e2e.py         # Live stack E2E tests (pytest)
├── worker/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── worker.py               # Poll loop + job processor
├── db/
│   └── init/
│       ├── 01-schema.sql       # jobs table + trigger
│       └── 02-seed.sql         # 3 seed jobs
├── scripts/
│   ├── run-e2e.sh              # One-command full E2E (recommended)
│   ├── teardown.sh             # Stop stack (optional --volumes)
│   ├── fresh-start.sh          # Teardown + rebuild + health check
│   └── seed.sh                 # Documents seed strategy
├── proof/                      # Generated proof artifacts
│   ├── e2e-tests-all-green.txt
│   ├── service-interaction-logs.txt
│   └── teardown-and-fresh-reup.txt
└── README.md
```

## Prerequisites

| Tool | Minimum version | Purpose |
|------|-----------------|---------|
| **Docker Desktop** (or Docker Engine + Compose) | 20+ | Build and run containers |
| **Python 3** | 3.9+ | E2E test runner venv (host-side) |
| **curl** | any | Health checks in scripts |

Verify Docker is installed and running:

```bash
docker --version
docker compose version
docker info
```

If `docker: command not found`, install [Docker Desktop for Mac](https://docs.docker.com/desktop/setup/install/mac-install/) and start the daemon before continuing.

## Quick start — one command (recommended)

From the repository root:

```bash
cd Task/projects/InfraAndDevops/D2
chmod +x scripts/*.sh
./scripts/run-e2e.sh | tee proof/e2e-tests-all-green.txt
```

This single command performs:

1. **Teardown from zero** — removes containers, networks, and the `d2-pgdata` volume
2. **Build + start** — `docker compose up --build -d`
3. **Health wait** — polls `GET /health` until database is connected
4. **E2E tests** — runs 6 pytest cases against the live API
5. **Log capture** — writes `proof/service-interaction-logs.txt`
6. **Fresh re-up proof** — tears down again, rebuilds, verifies seed data → `proof/teardown-and-fresh-reup.txt`

Expected final lines:

```
[d2-e2e] SUCCESS — all E2E tests passed
======================== 6 passed in X.XXs ========================
```

## Manual step-by-step

### 1. Start the stack

```bash
cd Task/projects/InfraAndDevops/D2
docker compose up --build -d
docker compose ps
```

All three services should show `healthy` or `running`:

| Service | Image | Host port | Role |
|---------|-------|-----------|------|
| `db` | `postgres:16-alpine` | 5432 | Persistent job store + seed init |
| `api` | `d2-job-api:latest` | 8000 | REST API |
| `worker` | `d2-job-worker:latest` | — | Background job processor |

### 2. Verify health

```bash
curl -s http://127.0.0.1:8000/health | python3 -m json.tool
```

Expected:

```json
{
    "status": "ok",
    "database": "connected"
}
```

### 3. Inspect seed data

```bash
curl -s http://127.0.0.1:8000/jobs | python3 -m json.tool
```

You should see 3 seeded jobs including `"hello from seed"` and `"docker stack"`.

### 4. Create a job and watch the worker process it

```bash
curl -s -X POST http://127.0.0.1:8000/jobs \
  -H "Content-Type: application/json" \
  -d '{"task":"reverse","text":"hello"}' | python3 -m json.tool
```

Poll until status is `completed`:

```bash
curl -s http://127.0.0.1:8000/jobs/4 | python3 -m json.tool
```

Expected result: `"output": "olleh"`

### 5. Run E2E tests only (stack already up)

```bash
python3 -m venv .venv-e2e
source .venv-e2e/bin/activate
pip install -r api/requirements.txt
API_BASE_URL=http://127.0.0.1:8000 pytest api/tests/test_e2e.py -v
```

## Seed data

Seed fixtures live in `db/init/02-seed.sql` and run automatically when Postgres initializes an **empty** volume:

| # | Task | Text | Initial status |
|---|------|------|----------------|
| 1 | `uppercase` | `hello from seed` | `pending` |
| 2 | `reverse` | `docker stack` | `pending` |
| 3 | `uppercase` | `already done` | `completed` (with result) |

To re-seed from scratch:

```bash
./scripts/teardown.sh --volumes
docker compose up -d --build
```

Or use the helper:

```bash
./scripts/seed.sh
```

## Teardown

### Stop containers (keep data volume)

```bash
./scripts/teardown.sh
# equivalent: docker compose down --remove-orphans
```

### Stop containers and wipe database (clean slate)

```bash
./scripts/teardown.sh --volumes
# equivalent: docker compose down -v --remove-orphans
```

### Fresh start from zero

```bash
./scripts/fresh-start.sh
```

## Proof it works

Regenerate proof (recommended one command):

```bash
cd Task/projects/InfraAndDevops/D2
chmod +x scripts/*.sh
./scripts/run-e2e.sh | tee proof/e2e-tests-all-green.txt
```

The E2E script also writes `proof/service-interaction-logs.txt` and `proof/teardown-and-fresh-reup.txt`.

### Captured artifacts

| File | Contents |
|------|----------|
| [`proof/e2e-tests-all-green.txt`](proof/e2e-tests-all-green.txt) | Full terminal output — pytest **6 passed** |
| [`proof/service-interaction-logs.txt`](proof/service-interaction-logs.txt) | Combined `docker compose logs` from api, worker, db |
| [`proof/teardown-and-fresh-reup.txt`](proof/teardown-and-fresh-reup.txt) | Teardown → rebuild → health → seed jobs visible |

### What to look for in service logs

Cross-service communication proof — grep for these events:

```
# Database initialized with schema + seed
db-1  | running /docker-entrypoint-initdb.d/01-schema.sql
db-1  | running /docker-entrypoint-initdb.d/02-seed.sql
db-1  | INSERT 0 3

# API connected to database
api-1 | event=db_ready attempt=1

# Worker connected and processed seed jobs
worker-1 | event=db_ready attempt=1
worker-1 | event=job_picked job_id=1 task=uppercase status=processing
worker-1 | event=job_completed job_id=1 task=uppercase status=completed output=HELLO FROM SEED

# API created job during E2E test, worker picked it up
api-1    | event=job_created job_id=5 task=reverse status=pending
worker-1 | event=job_picked job_id=5 task=reverse status=processing
worker-1 | event=job_completed job_id=5 task=reverse status=completed output=rekrow
```

## API reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness + DB connectivity |
| `GET` | `/jobs` | List all jobs (seed + created) |
| `GET` | `/jobs/{id}` | Get single job by ID |
| `POST` | `/jobs` | Create job — body: `{"task":"uppercase\|reverse","text":"..."}` |

### Job statuses

| Status | Meaning |
|--------|---------|
| `pending` | Waiting for worker |
| `processing` | Worker claimed job |
| `completed` | Worker finished — `result.output` set |
| `failed` | Worker error — `result.error` set |

## E2E test matrix

| Test | Asserts |
|------|---------|
| `test_health_reports_database_connected` | API ↔ DB |
| `test_list_jobs_includes_seed_data` | Seed loaded via DB init |
| `test_create_job_returns_pending` | API writes to DB |
| `test_worker_processes_created_job` | Worker picks up new job, API reads result |
| `test_worker_processes_seed_jobs` | Worker processes seed fixture |
| `test_get_job_not_found` | 404 for missing ID |

## Docker Compose services detail

### `db` — PostgreSQL 16

- User: `d2user` / Password: `d2pass` / Database: `d2jobs`
- Init scripts mounted read-only from `./db/init`
- Named volume `d2-pgdata` for persistence
- Health: `pg_isready`

### `api` — FastAPI

- Built from `./api/Dockerfile`
- Env: `DATABASE_URL=postgresql://d2user:d2pass@db:5432/d2jobs`
- Port `8000:8000`
- Depends on `db` healthy
- Health: HTTP GET `/health`

### `worker` — Python poll loop

- Built from `./worker/Dockerfile`
- Same `DATABASE_URL` as API
- Polls every 2s for `pending` jobs
- Uses `FOR UPDATE SKIP LOCKED` for safe concurrent claiming
- Depends on `db` + `api` healthy

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `docker: command not found` | Install and start Docker Desktop |
| `port is already allocated` (8000 or 5432) | Stop conflicting services or change port mapping in `docker-compose.yml` |
| `connection refused` on health check | Wait 20–30s; run `docker compose logs api` |
| Seed jobs missing | Volume was not wiped — run `./scripts/teardown.sh --volumes` then re-up |
| E2E timeout on worker test | Check worker logs: `docker compose logs worker` |
| Tests pass but worker idle | Verify `DATABASE_URL` in worker env matches db service |

## Useful commands

```bash
# Follow live logs
docker compose logs -f api worker db

# Rebuild a single service
docker compose up --build -d api

# Shell into database
docker compose exec db psql -U d2user -d d2jobs -c "SELECT id, status, payload FROM jobs;"

# Check container health
docker compose ps
```

## Related

This project demonstrates the Infra & DevOps **D2** pattern: compose a real multi-service stack, seed it, prove inter-service communication with logs, and verify everything with automated E2E tests against the running containers.
