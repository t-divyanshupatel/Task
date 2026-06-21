# D6 — Observability Bolt-on with Metrics and a Dashboard

Structured **JSON logging** and a Prometheus **`/metrics`** endpoint on a small FastAPI order service, plus a **Prometheus + Grafana** Docker Compose stack with a provisioned datasource and a live dashboard panel fed by real traffic.

Built for **Infra & DevOps D6**.

## Requirements checklist

| Requirement | Status | Location |
|-------------|--------|----------|
| Code diff adding logs and metrics | Done | `proof/instrumentation-diff.patch` |
| Instrumented service | Done | `service/app/main.py`, `service/app/observability.py` |
| docker-compose (Prometheus + Grafana) | Done | `docker-compose.yml` |
| Provisioned Prometheus datasource | Done | `grafana/provisioning/datasources/prometheus.yml` |
| Provisioned dashboard | Done | `grafana/dashboards/d6-order-api.json` |
| Load script | Done | `scripts/load.sh` |
| Dashboard panel live data (JSON) | Done | `proof/dashboard-panel.json` |
| Structured log sample | Done | `proof/structured-log-sample.txt` |
| `/metrics` sample | Done | `proof/metrics-sample.txt` |
| README with run order | Done | This file |

## Architecture

```
┌──────────────┐   scrape /metrics   ┌─────────────┐   query    ┌─────────────┐
│  Order API   │ ──────────────────► │ Prometheus  │ ─────────► │  Grafana    │
│  (FastAPI)   │                     │   :9090     │            │   :3000     │
└──────┬───────┘                     └─────────────┘            └─────────────┘
       │
       │ JSON logs (stdout)
       ▼
  docker compose logs api
```

**Flow:**

1. FastAPI service exposes `/health`, `/orders`, and `/metrics`.
2. `ObservabilityMiddleware` emits structured JSON logs and increments Prometheus counters/histograms on every request.
3. Prometheus scrapes `api:8080/metrics` every 5 seconds.
4. Grafana auto-provisions the Prometheus datasource and the **D6 Order API** dashboard.
5. `scripts/load.sh` generates traffic; the dashboard panel shows `sum(rate(http_requests_total{job="d6-order-api"}[1m]))`.

## Project layout

```
D6/
├── docker-compose.yml              # api + prometheus + grafana
├── service/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py                 # Instrumented FastAPI app
│       ├── main_base.py            # Uninstrumented baseline (for diff)
│       └── observability.py        # JSON logging + Prometheus middleware
├── prometheus/
│   └── prometheus.yml              # Scrape config for d6-order-api
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/prometheus.yml
│   │   └── dashboards/default.yml
│   └── dashboards/
│       └── d6-order-api.json       # HTTP request rate panel
├── scripts/
│   ├── up.sh                       # Start stack
│   ├── down.sh                     # Stop stack
│   ├── load.sh                     # Generate traffic
│   ├── verify.sh                   # Full proof pipeline
│   └── capture-proof.sh            # Regenerate proof/
├── proof/                          # Proof artifacts
│   ├── instrumentation-diff.patch
│   ├── load-output.txt
│   ├── metrics-sample.txt
│   ├── structured-log-sample.txt
│   └── dashboard-panel.json
└── README.md
```

## Prerequisites

| Tool | Purpose |
|------|---------|
| **Docker Desktop** (or Docker Engine + Compose) | Run the observability stack |
| **curl** | Health checks, load script, proof capture |
| **python3** | JSON formatting in verify script |

Verify Docker is running:

```bash
docker --version
docker compose version
docker info
```

Default ports — change with env vars if needed:

| Service | Port | Env override |
|---------|------|--------------|
| Order API | 8080 | `D6_API_PORT` |
| Prometheus | 9090 | `D6_PROMETHEUS_PORT` |
| Grafana | 3000 | `D6_GRAFANA_PORT` |

## Quick start — one command (recommended)

From the repository root:

```bash
cd Task/projects/InfraAndDevops/D6
chmod +x scripts/*.sh
./scripts/capture-proof.sh
```

This runs the full verify pipeline:

1. Saves instrumentation diff
2. Starts API + Prometheus + Grafana
3. Runs 60 load iterations (180 HTTP requests)
4. Captures `/metrics` sample
5. Captures structured JSON logs
6. Queries Prometheus for dashboard panel data
7. Validates non-zero request rate

Expected final line:

```
[d6-verify] SUCCESS — observability proof captured
```

## Run order (manual steps)

### 1. Start the observability stack

```bash
cd Task/projects/InfraAndDevops/D6
chmod +x scripts/*.sh
./scripts/up.sh
```

Wait until all three services are healthy:

```bash
docker compose ps
```

### 2. Verify the instrumented API

```bash
curl -s http://127.0.0.1:8080/health | python3 -m json.tool
curl -s http://127.0.0.1:8080/metrics | head -20
```

Expected health response:

```json
{
    "status": "ok",
    "service": "d6-order-api"
}
```

Expected metrics include:

```
http_requests_total{method="GET",path="/health",status="200"}
http_request_duration_seconds_bucket{...}
orders_created_total
```

### 3. Generate traffic

```bash
./scripts/load.sh
# or with more requests:
D6_LOAD_REQUESTS=120 ./scripts/load.sh
```

The load script hits three endpoints per iteration:

| Call | Endpoint | Purpose |
|------|----------|---------|
| `GET` | `/health` | Liveness traffic |
| `GET` | `/orders` | Read traffic |
| `POST` | `/orders` | Create orders (increments `orders_created_total`) |

### 4. View structured logs

```bash
docker compose logs api | grep '^{' | tail -10
```

Each log line is JSON with fields like `event`, `method`, `path`, `status_code`, `duration_ms`:

```json
{
  "timestamp": "2026-06-21T17:45:02",
  "level": "INFO",
  "service": "d6-order-api",
  "message": "request completed",
  "event": "request_completed",
  "request_id": "a1b2c3d4-...",
  "method": "GET",
  "path": "/health",
  "status_code": 200,
  "duration_ms": 1.24
}
```

### 5. Open Grafana dashboard

```bash
open http://127.0.0.1:3000/d/d6-order-api/d6-order-api
```

Login: `admin` / `admin` (anonymous viewing also enabled).

The dashboard has one panel:

- **HTTP request rate (req/s)** — `sum(rate(http_requests_total{job="d6-order-api"}[1m]))`

After running `load.sh`, the panel should show a non-zero line within ~15 seconds.

### 6. Query Prometheus directly (dashboard panel proof)

```bash
curl -s 'http://127.0.0.1:9090/api/v1/query?query=sum(rate(http_requests_total{job="d6-order-api"}[1m]))' \
  | python3 -m json.tool
```

A successful response with live data looks like:

```json
{
    "status": "success",
    "data": {
        "resultType": "vector",
        "result": [
            {
                "metric": {},
                "value": [1752102308.412, "4.283333333333334"]
            }
        ]
    }
}
```

The second element of `value` is the request rate in req/s.

### 7. Tear down

```bash
./scripts/down.sh
```

## Code changes (instrumentation)

See `proof/instrumentation-diff.patch` for the full diff. Summary:

| File | Change |
|------|--------|
| `service/app/observability.py` | **New** — JSON formatter, Prometheus counters/histograms, request middleware |
| `service/app/main.py` | Mount `/metrics`, wire middleware, structured `record_order_created` |
| `service/requirements.txt` | Add `prometheus-client==0.21.1` |
| `service/app/main_base.py` | Uninstrumented baseline (plain text logs, no metrics) |

### Metrics exposed

| Metric | Labels | Description |
|--------|--------|-------------|
| `http_requests_total` | `method`, `path`, `status` | Counter per HTTP request |
| `http_request_duration_seconds` | `method`, `path` | Histogram of request latency |
| `orders_created_total` | — | Counter for `POST /orders` |

Path labels are normalized (`/orders/42` → `/orders/{order_id}`) to avoid cardinality explosion.

### Structured log events

| Event | When | Key fields |
|-------|------|------------|
| `request_completed` | Every HTTP request (except `/metrics`) | `method`, `path`, `status_code`, `duration_ms`, `request_id` |
| `order_created` | `POST /orders` succeeds | `order_id`, `sku`, `quantity` |

## API reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness |
| `GET` | `/orders` | List all orders |
| `POST` | `/orders` | Create order — body: `{"sku":"ABC","quantity":5}` |
| `GET` | `/orders/{id}` | Get single order |
| `GET` | `/metrics` | Prometheus metrics (not logged by middleware) |

## Proof it works

Regenerate all proof files:

```bash
cd Task/projects/InfraAndDevops/D6
chmod +x scripts/*.sh
./scripts/capture-proof.sh
```

### Captured artifacts

| File | Contents |
|------|----------|
| [`proof/instrumentation-diff.patch`](proof/instrumentation-diff.patch) | Diff from `main_base.py` → `main.py` + new `observability.py` |
| [`proof/load-output.txt`](proof/load-output.txt) | `up.sh` + `load.sh` terminal output |
| [`proof/metrics-sample.txt`](proof/metrics-sample.txt) | First 40 lines of `curl /metrics` |
| [`proof/structured-log-sample.txt`](proof/structured-log-sample.txt) | Last 20 JSON log lines from `docker compose logs api` |
| [`proof/dashboard-panel.json`](proof/dashboard-panel.json) | Prometheus instant query result for the dashboard panel |

### What to look for in proof

**Metrics** — counters incremented by load traffic:

```
http_requests_total{method="POST",path="/orders",status="201"} 60.0
orders_created_total 60.0
```

**Logs** — JSON with `event=request_completed` and `event=order_created`.

**Dashboard panel** — Prometheus returns `"status": "success"` with a non-zero rate value.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `docker: command not found` | Install and start Docker Desktop |
| `port is already allocated` (8080/9090/3000) | Stop conflicting services or set `D6_API_PORT`, etc. |
| Grafana panel shows "No data" | Run `./scripts/load.sh`, wait 15s, refresh dashboard |
| Prometheus query returns empty `result` | Wait 10s after load for scrape; check `docker compose logs prometheus` |
| `/metrics` returns 404 | Ensure you're hitting the instrumented `main.py`, not `main_base.py` |

## Useful commands

```bash
# Follow live API logs (JSON)
docker compose logs -f api | grep '^{'

# Check Prometheus targets
open http://127.0.0.1:9090/targets

# Rebuild only the API service
docker compose up --build -d api

# Custom load intensity
D6_LOAD_REQUESTS=200 D6_API_URL=http://127.0.0.1:8080 ./scripts/load.sh
```

## Related

This project demonstrates the Infra & DevOps **D6** pattern: bolt structured logging and Prometheus metrics onto a small service, stand up Prometheus + Grafana with provisioning, generate traffic, and prove the dashboard panel shows live data.
