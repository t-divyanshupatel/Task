# A1 Orchestration Runbook — 45 Minute Supervisor Flow

Plan reference: [parallel-work-plan.md](./parallel-work-plan.md)  
Contract: [enrollment-contract.md](./enrollment-contract.md)

## Phase 0 — Bootstrap main (0–8 min)

```bash
mkdir enrollment-api && cd enrollment-api
git init
git commit --allow-empty -m "chore: bootstrap enrollment-api"
cp /path/to/A1/proof/enrollment-contract.md ./ENROLLMENT_CONTRACT.md
git add ENROLLMENT_CONTRACT.md && git commit -m "chore: add enrollment contract"
cp /path/to/A1/proof/parallel-work-plan.md ./PARALLEL_WORK_PLAN.md
git add PARALLEL_WORK_PLAN.md && git commit -m "docs: add parallel work plan"
```

- [ ] Contract committed before any lane starts
- [ ] Plan document lists all seven A1 sections

## Phase 1 — Spawn worktrees (8–12 min)

```bash
git branch feat/student-models
git branch feat/enrollment-routes
git branch feat/enrollment-tests
git worktree add ../enrollment-api-persistence feat/student-models
git worktree add ../enrollment-api-http feat/enrollment-routes
git worktree add ../enrollment-api-qa feat/enrollment-tests
git worktree list
```

- [ ] Four entries: main + three lane directories
- [ ] Each worktree checked out on the correct branch

## Phase 2 — Parallel agent sessions (12–32 min)

| Directory | Agent prompt section | Ownership gate |
|-----------|----------------------|----------------|
| `../enrollment-api-persistence` | Lane P | Only `app/models.py`, `database.py`, `config.py` |
| `../enrollment-api-http` | Lane H | Only `app/routes/`, `main.py`, `schemas.py`, `requirements.txt` |
| `../enrollment-api-qa` | Lane Q | Only `tests/` |

Per lane before handoff:

- [ ] `git diff main --name-only` respects ownership
- [ ] Commit message matches plan prefix (`feat(persistence):`, etc.)
- [ ] No edits outside owned paths

## Phase 3 — Sequential merge (32–40 min)

From `enrollment-api` on `main`:

```bash
git merge feat/student-models --no-ff -m "merge(a1): persistence layer"
git merge feat/enrollment-routes --no-ff -m "merge(a1): http layer"
git merge feat/enrollment-tests --no-ff -m "merge(a1): qa layer"
```

- [ ] Order: persistence → http → qa
- [ ] Resolve trivial `app/__init__.py` if needed
- [ ] `git log --oneline --graph` shows three feature commits

## Phase 4 — Verification (40–45 min)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest tests/ -v
grep -r "<<<<<<" . --include="*.py" || echo "Clean"
uvicorn app.main:app --port 8000
# run curl smoke from parallel-work-plan.md
```

- [ ] 6+ tests pass
- [ ] Five curl endpoints return JSON
- [ ] No conflict markers

## Recovery playbook

| Symptom | Action |
|---------|--------|
| Duplicate email not 409 | Fix route in HTTP lane only; re-merge |
| Enrollment 500 on missing student | Ensure HTTP lane returns 404 per contract |
| Import errors after merge | Re-check merge order persistence → http → qa |
| pytest DB pollution | QA lane must drop tables in conftest teardown |

## Cleanup (optional)

```bash
git worktree remove ../enrollment-api-persistence
git worktree remove ../enrollment-api-http
git worktree remove ../enrollment-api-qa
```
