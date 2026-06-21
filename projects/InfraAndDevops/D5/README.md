# D5 — One-Command Repo Bootstrap

Bootstrap this repo from a **fresh clone** with a single command: install pinned Python (via **mise** when available), create a virtualenv, install dependencies, and run the full test suite.

Built for **Infra & DevOps D5**: Makefile + `mise.toml` + optional Dev Container — with proof artifacts and documentation of formerly implicit setup steps.

## Requirements checklist

| Requirement | Status |
|-------------|--------|
| Bootstrap config files | `Makefile`, `mise.toml`, `.tool-versions`, `.devcontainer/` |
| Single bootstrap command | **`make bootstrap`** |
| Full command output | `proof/bootstrap-full-output.txt` |
| Passing test run | `proof/tests-passing.txt` — **5 passed** |
| Notes on implicit setup | See [Previously implicit](#previously-implicit-system-packages-env-vars-versions) |

## The single command

From a fresh clone:

```bash
cd Task/projects/InfraAndDevops/D5
make bootstrap
```

This runs `scripts/bootstrap.sh bootstrap`, which:

1. Installs **Python 3.11.9** via **mise** (if `mise` is installed)
2. Falls back to **system `python3`** (≥ 3.9) if mise is not present
3. Creates `.venv/` and installs `requirements-dev.txt`
4. Runs **`pytest -v tests/`**

Expected final line:

```
=== Bootstrap complete: all tests passed ===
```

## What this repo is

A minimal **FastAPI** service used only to prove bootstrap works:

| Endpoint | Description |
|----------|-------------|
| `GET /health` | `{"status":"ok","service":"d5-bootstrap-demo"}` |
| `GET /ready` | Readiness + `APP_ENV` value |
| `POST /echo` | Echo JSON `text` field |

**5 pytest tests** in `tests/test_api.py`.

## Project layout

```
D5/
├── Makefile                  # Single entry: make bootstrap
├── mise.toml                 # Pinned Python 3.11.9 (mise)
├── .tool-versions            # Same pin for asdf
├── scripts/
│   ├── bootstrap.sh          # Bootstrap implementation
│   └── capture-proof.sh      # Regenerate proof/
├── app/
│   └── main.py               # FastAPI application
├── tests/
│   └── test_api.py
├── requirements.txt
├── requirements-dev.txt
├── pytest.ini
├── .devcontainer/
│   ├── devcontainer.json     # Optional: Cursor/VS Code container
│   └── Dockerfile
├── proof/
│   ├── bootstrap-full-output.txt
│   └── tests-passing.txt
└── README.md
```

## Bootstrap config files

### `Makefile`

| Target | Purpose |
|--------|---------|
| **`make bootstrap`** | **One command** — setup + test |
| `make setup` | Venv + pip install only |
| `make test` | Run pytest (requires setup) |
| `make run` | Start uvicorn on port 8080 |
| `make clean` | Remove `.venv`, `.pytest_cache`, `.mise/` |
| `make proof` | Regenerate `proof/` artifacts |

### `mise.toml`

```toml
python = "3.11.9"
```

Install mise: https://mise.jdx.dev

```bash
curl https://mise.run | sh
mise install   # reads mise.toml
```

### `.tool-versions` (asdf)

```
python 3.11.9
```

If you use [asdf](https://asdf-vm.com/) instead of mise:

```bash
asdf install
make bootstrap
```

### `.devcontainer/devcontainer.json`

Optional **Dev Container** for Cursor / VS Code:

- Python 3.11 feature
- `postCreateCommand`: `make bootstrap`
- Forwards port **8080**
- Sets `APP_ENV=devcontainer`

Open folder in container → bootstrap runs automatically on create.

## Prerequisites (clean machine)

| Requirement | Required? | Notes |
|-------------|-----------|-------|
| **make** | Yes | macOS/Linux default |
| **mise** or **asdf** | Recommended | Installs exact Python 3.11.9 |
| **python3** ≥ 3.9 | Fallback | Used if mise/asdf not installed |
| **git** | Yes | Clone the repo |
| **curl** | For mise install | One-time |

No global `pip install` of project deps — everything goes into `.venv/`.

## Step-by-step — simulate fresh clone

```bash
cd Task/projects/InfraAndDevops/D5

# Simulate fresh clone
make clean

# Single bootstrap command
make bootstrap
```

### Run the API after bootstrap

```bash
make run
# curl http://127.0.0.1:8080/health
```

## Proof it works

Regenerate all proof files:

```bash
cd Task/projects/InfraAndDevops/D5
make proof
# or: ./scripts/capture-proof.sh
```

### Captured artifacts

| File | Contents |
|------|----------|
| [`proof/bootstrap-full-output.txt`](proof/bootstrap-full-output.txt) | Full `make bootstrap` output after `rm -rf .venv` |
| [`proof/tests-passing.txt`](proof/tests-passing.txt) | `make test` — **5 passed** |

Captured on clean venv reset — see timestamps at top of each file.

## Previously implicit (system packages, env vars, versions)

Before this bootstrap, developers had to know or discover:

### System packages / tools

| Was implicit | Now explicit |
|--------------|--------------|
| Python **3.11** (or compatible 3.9+) | `mise.toml` / `.tool-versions` → **3.11.9** |
| `pip` and `venv` | Created by `scripts/bootstrap.sh` inside `.venv/` |
| `pytest`, `httpx` | Listed in `requirements-dev.txt`, installed by bootstrap |
| `make` | Documented prerequisite |

No system-wide FastAPI install required.

### Environment variables

| Variable | Required? | Default | Purpose |
|----------|-----------|---------|---------|
| `APP_ENV` | No | `development` | Shown in `/ready` and `/echo` responses |
| `VIRTUAL_ENV` | Auto | `.venv` | Set when using venv binaries |

Tests set `APP_ENV=test` temporarily in one test case.

### Python package versions

Pinned in `requirements.txt` / `requirements-dev.txt`:

| Package | Minimum |
|---------|---------|
| `fastapi` | 0.115.0 |
| `uvicorn[standard]` | 0.32.0 |
| `pydantic` | 2.0.0 |
| `pytest` | 8.0.0 |
| `httpx` | 0.27.0 |

Exact resolved versions live in `.venv` after bootstrap (`pip freeze`).

### Paths that were implicit

| Before | After bootstrap |
|--------|-----------------|
| Which `python` to use | mise → 3.11.9, else `python3` |
| Where deps install | `.venv/lib/...` only |
| How to run tests | `make test` or `.venv/bin/pytest` |
| Project root for imports | `pytest.ini` → `pythonpath = .` |

### What bootstrap does **not** install

- Docker
- Node.js
- Database
- Global mise/asdf (you install once via their docs)

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `make: command not found` | Install build tools / use `bash scripts/bootstrap.sh bootstrap` |
| `no Python found` | Install mise or Python 3.9+ from python.org |
| `mise not found` | Optional — install from https://mise.jdx.dev or use system Python |
| Tests fail after manual `pip install` | `make clean && make bootstrap` |
| Port 8080 in use | Change port in `Makefile` `run` target |

## Alternative single commands

| Tool | Command |
|------|---------|
| Makefile (primary) | `make bootstrap` |
| Script directly | `./scripts/bootstrap.sh bootstrap` |
| mise task (if extended) | `mise install && make bootstrap` |
| Dev Container | Reopen in Container → auto `make bootstrap` |

## Dependencies

| File | Role |
|------|------|
| `requirements.txt` | Runtime: FastAPI, uvicorn, pydantic |
| `requirements-dev.txt` | Dev: pytest, httpx |
