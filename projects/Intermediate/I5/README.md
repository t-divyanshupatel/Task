# Currency Converter API — Docker (I5)

Docker image for the **I4 Currency Converter FastAPI service** (`POST /convert`, `GET /rates`, `GET /health`).

Built for **Intermediate I5**: Dockerfile, clean build, container runs with health check, curl proof, and documented `docker build` / `docker run` commands.

## Requirements checklist

| Requirement | Status |
|-------------|--------|
| Dockerfile | `I5/Dockerfile` (packages `I4/service/app`) |
| Proof it builds | `docker build` succeeds |
| Container runs and service responds | Uvicorn on port 8000 |
| Health check or curl proof | Dockerfile `HEALTHCHECK` + `scripts/verify-container.sh` |
| README with docker commands | See [Build](#build) and [Run](#run) below |

## What gets containerised

This image runs the **same FastAPI app** as [`Task/projects/Intermediate/I4/service`](../../I4/README.md):

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Liveness — `{"status":"ok"}` |
| `GET /rates` | Hardcoded USD-based FX rates |
| `POST /convert` | Convert between USD, EUR, GBP, INR, JPY |

Source code is copied from `I4/service/app/` at build time. Runtime dependencies are listed in `I5/requirements.txt` (production-only — no pytest).

## Project layout

```
I5/
├── Dockerfile              # Image definition (build context = Intermediate/)
├── docker-compose.yml      # Optional compose wrapper
├── requirements.txt        # Production Python deps for the image
├── .dockerignore
├── scripts/
│   └── verify-container.sh # curl health + convert smoke test
├── proof/                  # Screenshots (build + curl proof)
└── README.md
```

## Prerequisites

- **Docker** 20+ ([Install Docker](https://docs.docker.com/get-docker/))
- **curl** (for manual smoke tests and `verify-container.sh`)

Verify Docker:

```bash
docker --version
```

## Build

**Important:** Build context is the **Intermediate** directory (parent of `I4` and `I5`), not `I5` alone.

From the repository root:

```bash
cd Task/projects/Intermediate
docker build -f I5/Dockerfile -t currency-converter-api:i5 .
```

Expected final line:

```
Successfully tagged currency-converter-api:i5
```

### Build with Docker Compose

```bash
cd Task/projects/Intermediate/I5
docker compose build
```

## Run

### Option A — `docker run`

```bash
docker run --rm -p 8000:8000 --name currency-converter currency-converter-api:i5
```

Expected log:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Option B — Docker Compose

```bash
cd Task/projects/Intermediate/I5
docker compose up
```

Stop with `Ctrl+C`, then `docker compose down` if needed.

## Prove it runs (two terminals)

### Terminal 1 — start the container

```bash
cd Task/projects/Intermediate
docker run --rm -p 8000:8000 currency-converter-api:i5
```

### Terminal 2 — curl smoke tests

**Health**

```bash
curl -s http://127.0.0.1:8000/health
```

Expected: `{"status":"ok"}`

**Rates**

```bash
curl -s http://127.0.0.1:8000/rates | head -c 200
```

**Convert**

```bash
curl -s -X POST http://127.0.0.1:8000/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from_currency": "USD", "to_currency": "EUR"}'
```

Expected: `"converted_amount": 92.0`

### Automated verification script

With the container running in Terminal 1:

```bash
cd Task/projects/Intermediate/I5
chmod +x scripts/verify-container.sh
./scripts/verify-container.sh
```

Expected:

```
All Docker verification checks passed.
```

## Health check

The image defines a Docker **HEALTHCHECK** that polls `GET /health` every 30s:

```bash
docker run -d -p 8000:8000 --name currency-converter currency-converter-api:i5
docker inspect --format='{{.State.Health.Status}}' currency-converter
```

After a few seconds, expected: `healthy`

```bash
docker rm -f currency-converter
```

Compose uses the same health probe in `docker-compose.yml`.

## Image details

| Setting | Value |
|---------|-------|
| Base image | `python:3.11-slim` |
| Workdir | `/app` |
| Exposed port | `8000` |
| Process | `uvicorn app.main:app --host 0.0.0.0 --port 8000` |
| Health endpoint | `GET /health` |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `COPY failed: file not found` | Run `docker build` from `Task/projects/Intermediate`, not from `I5/` |
| `port is already allocated` | Stop other services on 8000 or use `-p 8001:8000` |
| `connection refused` from curl | Wait for Uvicorn startup; check `docker logs <container>` |
| Build context too large | `.dockerignore` excludes `node_modules`, `.venv`, `proof/` |

## Related projects

| Project | Role |
|---------|------|
| [I4](../I4/README.md) | Source FastAPI service + Node CLI client |
| I5 (this) | Docker packaging for the I4 service |

## Dependencies (image)

| Package | Purpose |
|---------|---------|
| `fastapi` | Web framework |
| `uvicorn[standard]` | ASGI server |
| `pydantic` | Request validation |
