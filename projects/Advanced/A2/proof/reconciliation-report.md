# A2 — Reconciliation Report (Two Parallel Worktrees)

**Feature:** Student Enrollment REST API (FastAPI + SQLite)  
**Runnable app:** `sandbox/enrollment-api/`  
**Demo git history:** `sandbox/.parallel-demo/enrollment-api/`  
**Time box:** 90 minutes

---

## 1. Commands used to create worktrees

```bash
cd Task/projects/Advanced/A2
./scripts/run-two-lane-demo.sh
```

Bootstrap and worktree commands executed by the script:

```bash
mkdir -p sandbox/.parallel-demo/enrollment-api && cd sandbox/.parallel-demo/enrollment-api
git init
git commit --allow-empty -m "chore: bootstrap enrollment-api"
cp sandbox/enrollment-api-src/ENROLLMENT_CONTRACT.md .
git add ENROLLMENT_CONTRACT.md && git commit -m "chore: add enrollment contract"

git branch feat/enrollment-persistence
git branch feat/enrollment-http
git worktree add sandbox/.parallel-demo/enrollment-api-alpha feat/enrollment-persistence
git worktree add sandbox/.parallel-demo/enrollment-api-beta feat/enrollment-http
git worktree list
```

---

## 2. Branch and worktree names

| Lane | Branch | Worktree path | Owns |
|------|--------|---------------|------|
| **Alpha — Persistence** | `feat/enrollment-persistence` | `sandbox/.parallel-demo/enrollment-api-alpha/` | `app/models.py`, `database.py`, `config.py` |
| **Beta — HTTP** | `feat/enrollment-http` | `sandbox/.parallel-demo/enrollment-api-beta/` | `app/routes/`, `main.py`, `schemas.py`, `requirements.txt` |
| **Main** | `main` | `sandbox/.parallel-demo/enrollment-api/` | merge target; tests added post-merge |

Merged runnable copy (no nested git): **`sandbox/enrollment-api/`**

---

## 3. Separate outputs from each lane

### Alpha — [worktree-alpha-log.txt](./worktree-alpha-log.txt)

- Commit `c259b11` — `feat(persistence): student and enrollment models`
- Models import check: `OK: Student, Enrollment importable`
- Files touched vs `main`: `app/__init__.py`, `config.py`, `database.py`, `models.py`

### Beta — [worktree-beta-log.txt](./worktree-beta-log.txt)

- Commit `c3ce7e3` — `feat(http): enrollment routes and schemas`
- `py_compile`: OK on schemas and route modules (persistence merged later)
- Files touched vs `main`: routes, `main.py`, `schemas.py`, `requirements.txt`

---

## 4. Final merge and reconcile steps

From `sandbox/.parallel-demo/enrollment-api` on `main`:

```bash
git merge feat/enrollment-persistence --no-ff -m "merge(a2): persistence layer"
git merge feat/enrollment-http --no-ff -m "merge(a2): http layer"
# tests copied onto main after merge (not a third parallel lane)
git add tests/ && git commit -m "feat(qa): enrollment pytest suite"
git worktree remove ../enrollment-api-alpha
git worktree remove ../enrollment-api-beta
```

### Merge graph

```
* 2830aee feat(qa): enrollment pytest suite
*   e27e549 merge(a2): http layer
|\  
| * c3ce7e3 feat(http): enrollment routes and schemas
* |   b2c1779 merge(a2): persistence layer
|\ \  
| * c259b11 feat(persistence): student and enrollment models
* ac8463f chore: add enrollment contract
```

**Merge order:** persistence → HTTP → tests on main.

---

## 5. Test results

See [merged-verification-log.txt](./merged-verification-log.txt).

Summary:

| Check | Result |
|-------|--------|
| **pytest** | **7 passed** in ~0.2s |
| **Conflict markers** | Clean |
| **curl POST /students** | `201` |
| **curl GET /students** | `200` |
| **curl POST /enrollments** | `201` |
| **curl GET /enrollments** | `200` |
| **curl GET /registry/summary** | `200` — `{"student_count":1,"enrollment_count":1}` |

Regenerate:

```bash
cd Task/projects/Advanced/A2
./scripts/capture-proof.sh
```

---

## 6. Conflict notes

| Item | Result |
|------|--------|
| **Expected risk** | Both lanes add empty `app/__init__.py` |
| **Actual merge** | **No manual conflict** — identical empty files auto-merged |
| **Merge order** | Persistence before HTTP (routes import ORM models) |
| **Post-merge grep** | No `<<<<<<<` markers in `.py` files |
| **If conflict occurred** | Keep contract-compliant version; re-run `pytest` |

No manual conflict resolution was required. Disjoint directory ownership kept merges clean aside from the shared init file.
