# D3 — CI Pipeline (GitHub Actions)

**GitHub Actions** workflow that on every **push** and **pull request** runs **lint** (Ruff), **tests** (pytest matrix), and **builds/tags a Docker image** — with pip and Docker layer caching.

Built for **Infra & DevOps D3**: workflow YAML, cache + matrix config, local CI proof, and a deliberate failure demo.

## Requirements checklist

| Requirement | Status |
|-------------|--------|
| Workflow YAML | `.github/workflows/ci.yml` |
| Lint on push | Job `lint` — Ruff check + format |
| Tests on push | Job `test` — pytest matrix Python 3.9 + 3.11 |
| Build and tag container | Job `build-image` — `d3-notify-service:$SHA` + `:latest` |
| Cache configuration | pip cache (setup-python) + GHA cache (docker build) |
| Matrix configuration | Python `3.9` and `3.11` in `test` job |
| Passing pipeline proof | `proof/ci-lint-test.txt` (lint + matrix tests) + `proof/ci-passing-local.txt` (full incl. docker build when Docker is running) |
| Docker build proof | `proof/ci-docker-build.txt` or full output in `ci-passing-local.txt` |
| Failure mode demo | `proof/ci-failure-demo.txt` + `demo/` files |
| README with instructions | This file |

## What this project is

A minimal **FastAPI** service (`D3 Notify Service`) used as the CI target:

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Liveness — `{"status":"ok","service":"d3-notify"}` |
| `GET /version` | App version |
| `POST /notify` | Accept a message (validated, max 200 chars) |

The CI pipeline lints, tests, and containerises **this repo** — not an external service.

## Project layout

```
D3/
├── .github/workflows/
│   └── ci.yml                  # GitHub Actions pipeline
├── app/
│   └── main.py                 # FastAPI application
├── tests/
│   └── test_api.py             # 5 pytest tests
├── demo/
│   ├── broken_lint.py          # Intentional lint failures (demo only)
│   └── test_broken.py          # Intentional test failure (demo only)
├── Dockerfile                  # Production image for build-image job
├── requirements.txt
├── requirements-dev.txt        # pytest, ruff, httpx
├── ruff.toml                   # Lint config (excludes demo/)
├── pytest.ini
├── scripts/
│   ├── run-ci-local.sh         # Mirror full CI locally
│   ├── demo-failure.sh         # Run failure demos
│   ├── capture-proof.sh        # Regenerate proof/*.txt
│   └── run-act.sh              # Optional: nektos/act
├── proof/
│   ├── ci-passing-local.txt    # Green local CI run
│   ├── ci-failure-demo.txt     # Lint + test failures
│   └── workflow-ci.yml         # Copy of workflow for reference
└── README.md
```

## CI pipeline architecture

```
push / pull_request
        │
        ▼
   ┌─────────┐
   │  lint   │  ruff check + ruff format --check (app, tests)
   └────┬────┘
        │ needs
        ▼
   ┌─────────┐
   │  test   │  matrix: Python 3.9 + 3.11, pytest tests/
   └────┬────┘
        │ needs
        ▼
   ┌─────────────┐
   │ build-image │  docker build → d3-notify-service:$SHA, :latest
   └─────────────┘
```

### Cache and matrix

| Job | Cache | Matrix |
|-----|-------|--------|
| `lint` | `actions/setup-python` pip cache on `requirements*.txt` | — |
| `test` | Same pip cache | `python-version: ['3.9', '3.11']`, `fail-fast: false` |
| `build-image` | `docker/build-push-action` GHA cache (`cache-from` / `cache-to`) | — |

### Image tags (build job)

```
d3-notify-service:${{ github.sha }}
d3-notify-service:latest
```

Images are **built only** (`push: false`) — suitable for CI without a registry.

## Prerequisites

| Tool | Purpose |
|------|---------|
| **Python 3.9+** | Local lint, test, proof scripts |
| **Docker** | Optional local `docker build` step in `run-ci-local.sh` |
| **GitHub** | Run workflow on push (remote) |
| **act** (optional) | Run Actions locally — `scripts/run-act.sh` |

## Quick start — local passing CI

Mirrors all three workflow jobs:

```bash
cd Task/projects/InfraAndDevops/D3
chmod +x scripts/*.sh
./scripts/run-ci-local.sh
```

Expected end:

```
=== Local CI passed ===
```

Steps executed:

1. `ruff check app tests`
2. `ruff format --check app tests`
3. `pytest -v tests/` → **5 passed**
4. `docker build` → `d3-notify-service:local` (if Docker daemon running)

### Regenerate proof artifacts

```bash
./scripts/capture-proof.sh
```

Writes:

- `proof/ci-passing-local.txt`
- `proof/ci-failure-demo.txt`
- `proof/workflow-ci.yml`

## GitHub Actions — remote green run

1. Push this directory to a GitHub repository (root or monorepo path).
2. Ensure `.github/workflows/ci.yml` is on the default branch.
3. Push any commit:

```bash
git add .
git commit -m "chore: trigger D3 CI"
git push
```

4. Open **Actions** → workflow **CI** → confirm three jobs are green:
   - Lint (ruff)
   - Test (Python 3.9)
   - Test (Python 3.11)
   - Build container image

Paste the run URL in your submission, e.g. `https://github.com/<org>/<repo>/actions/runs/<id>`.

## Failure mode demo

Deliberately broken files live under `demo/` (excluded from normal CI lint scope).

### Local demo script

```bash
./scripts/demo-failure.sh
```

**Demo 1 — lint failure** (`demo/broken_lint.py`):

- Unused imports `os`, `sys` → Ruff `F401`
- Exit code **1**

**Demo 2 — test failure** (`demo/test_broken.py`):

- `assert 1 == 2` → pytest **FAILED**
- Exit code **1**

Proof captured in `proof/ci-failure-demo.txt`.

### Simulate a broken commit on GitHub

To fail the real pipeline:

1. Temporarily add a failing test to `tests/`:

```python
def test_ci_should_fail() -> None:
    assert False
```

2. Push → `test` job fails → `build-image` skipped (`needs: test`).

3. Revert the commit and push again for green CI.

Or break lint:

```python
import unused_module  # F401
```

in `app/main.py`, push, then revert.

## Optional — run with `act` (local GitHub Actions)

Install [nektos/act](https://github.com/nektos/act):

```bash
brew install act   # macOS
```

Run:

```bash
./scripts/run-act.sh
```

Requires Docker. Uses `.github/workflows/ci.yml` with `act push`.

## Run the service manually

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Or via Docker:

```bash
docker build -t d3-notify-service:local .
docker run --rm -p 8000:8000 d3-notify-service:local
curl -s http://127.0.0.1:8000/health
```

## Test locally

```bash
source .venv/bin/activate
pip install -r requirements-dev.txt
pytest -v
```

Expected: **5 passed**

| Test | Area |
|------|------|
| `test_health_returns_ok` | `GET /health` |
| `test_version_returns_app_version` | `GET /version` |
| `test_notify_accepts_valid_message` | `POST /notify` happy path |
| `test_notify_rejects_empty_message` | Validation |
| `test_notify_rejects_missing_message` | Validation |

## Proof it works

Regenerate all proof files:

```bash
cd Task/projects/InfraAndDevops/D3
chmod +x scripts/*.sh
./scripts/capture-proof.sh
```

### Captured artifacts

| File | Contents |
|------|----------|
| [`proof/ci-passing-local.txt`](proof/ci-passing-local.txt) | Full local CI run — lint OK, **5 tests passed**, docker build |
| [`proof/ci-lint-test.txt`](proof/ci-lint-test.txt) | Lint + pytest matrix steps only |
| [`proof/ci-docker-build.txt`](proof/ci-docker-build.txt) | Docker image build step output |
| [`proof/ci-failure-demo.txt`](proof/ci-failure-demo.txt) | Lint errors + failed pytest demo |
| [`proof/workflow-ci.yml`](proof/workflow-ci.yml) | Snapshot of GitHub Actions workflow |

## Workflow file reference

Primary workflow: [.github/workflows/ci.yml](.github/workflows/ci.yml)

Key triggers:

```yaml
on:
  push:
    branches: ["**"]
  pull_request:
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ModuleNotFoundError: app` | Run pytest from repo root; `pytest.ini` sets `pythonpath = .` |
| `ruff` fails on `demo/` | Demo is excluded in `ruff.toml`; CI only checks `app tests` |
| Docker build skipped locally | Start Docker Desktop; or ignore — lint+test still prove CI |
| `act` not found | Use `./scripts/run-ci-local.sh` instead |
| GitHub `build-image` fails | Ensure `Dockerfile` is at repo root for this project path |

## Dependencies

| Package | Role |
|---------|------|
| `fastapi`, `uvicorn`, `pydantic` | Runtime (app + image) |
| `pytest`, `httpx` | Tests |
| `ruff` | Lint + format check |
