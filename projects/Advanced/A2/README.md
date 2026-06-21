# A2 — Execute Two Parallel Worktrees

**Status:** Done

## Goal

Create **two parallel git worktrees**, implement independent lanes for a **Student Enrollment REST API**, merge cleanly on `main`, and prove reconciliation with pytest and curl.

## Feature

| Method | Route               | Purpose                        |
| ------ | ------------------- | ------------------------------ |
| POST   | `/students`         | Register a student             |
| GET    | `/students`         | List students                  |
| POST   | `/enrollments`      | Enroll in a course             |
| GET    | `/enrollments`      | List enrollments               |
| GET    | `/registry/summary` | Count students and enrollments |

## Two-lane split

| Lane                | Branch                        | Worktree                | Delivers                                    |
| ------------------- | ----------------------------- | ----------------------- | ------------------------------------------- |
| Alpha — Persistence | `feat/enrollment-persistence` | `enrollment-api-alpha/` | SQLAlchemy models, DB session, config       |
| Beta — HTTP         | `feat/enrollment-http`        | `enrollment-api-beta/`  | FastAPI routes, schemas, `requirements.txt` |

Tests are added on **`main` after both merges** (not a third parallel lane).

## Project layout

```
A2/
├── proof/
│   ├── reconciliation-report.md      # Full merge proof (6 sections)
│   ├── worktree-alpha-log.txt        # Lane Alpha verification
│   ├── worktree-beta-log.txt         # Lane Beta verification
│   └── merged-verification-log.txt   # pytest + curl after merge
├── sandbox/
│   ├── enrollment-api/               # Merged runnable app
│   ├── enrollment-api-src/           # Source template for demo script
│   └── .parallel-demo/               # Git demo with worktree history (generated)
├── scripts/
│   ├── run-two-lane-demo.sh          # Bootstrap worktrees, merge, lane logs
│   └── capture-proof.sh              # pytest + curl → proof/
└── README.md
```

## Quick start — run merged app

```bash
cd Task/projects/Advanced/A2/sandbox/enrollment-api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest tests/ -v
uvicorn app.main:app --host 127.0.0.1 --port 8010
```

Smoke test:

```bash
curl -s -X POST http://127.0.0.1:8010/students \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Ada Lovelace","email":"ada@uni.edu","program":"CS"}'
curl -s http://127.0.0.1:8010/registry/summary
```

## Regenerate proof

```bash
cd Task/projects/Advanced/A2
chmod +x scripts/*.sh
./scripts/run-two-lane-demo.sh    # worktree alpha/beta logs + demo git graph
./scripts/capture-proof.sh        # pytest + curl on sandbox/enrollment-api
```

## Requirements checklist

| Requirement              | Location                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Worktree create commands | [proof/reconciliation-report.md](proof/reconciliation-report.md) §1                                                      |
| Branch / worktree names  | [proof/reconciliation-report.md](proof/reconciliation-report.md) §2                                                      |
| Lane outputs             | [proof/worktree-alpha-log.txt](proof/worktree-alpha-log.txt), [proof/worktree-beta-log.txt](proof/worktree-beta-log.txt) |
| Merge / reconcile steps  | [proof/reconciliation-report.md](proof/reconciliation-report.md) §4                                                      |
| Test results             | [proof/merged-verification-log.txt](proof/merged-verification-log.txt)                                                   |
| Conflict notes           | [proof/reconciliation-report.md](proof/reconciliation-report.md) §6                                                      |

## Proof it works

| File                                                                   | Contents                                            |
| ---------------------------------------------------------------------- | --------------------------------------------------- |
| [proof/reconciliation-report.md](proof/reconciliation-report.md)       | Commands, worktrees, merge graph, conflict analysis |
| [proof/worktree-alpha-log.txt](proof/worktree-alpha-log.txt)           | Persistence lane commit + file ownership            |
| [proof/worktree-beta-log.txt](proof/worktree-beta-log.txt)             | HTTP lane commit + py_compile gate                  |
| [proof/merged-verification-log.txt](proof/merged-verification-log.txt) | **7 pytest passed** + five curl smoke calls         |

## Related

- **A1** — three-lane parallel **plan** for the same enrollment domain: [../A1/README.md](../A1/README.md)
- **A3** — polyglot fraud scoring pipeline: [../A3/README.md](../A3/README.md)
