# A1 — Parallel Work Plan (Student Enrollment Service)

**Time box:** 45 minutes · **Type:** planning + optional live supervision demo

## Feature scope

Build a **Student Enrollment REST API** with five endpoints (see [enrollment-contract.md](./enrollment-contract.md)):

- Register and list students
- Create and list course enrollments
- Registry summary counts

The work splits into three lanes with **non-overlapping file ownership**.

---

## 1. Task decomposition

### Lane P — Persistence (`feat/student-models`)

| Owns | Delivers |
|------|----------|
| `app/models.py`, `app/database.py`, `app/config.py`, `app/__init__.py` | SQLAlchemy `Student` + `Enrollment` models, session factory, SQLite URL |

**Must not edit:** `app/routes/`, `app/main.py`, `app/schemas.py`, `tests/`

### Lane H — HTTP surface (`feat/enrollment-routes`)

| Owns | Delivers |
|------|----------|
| `app/routes/`, `app/main.py`, `app/schemas.py`, `requirements.txt`, `app/__init__.py` | FastAPI app, Pydantic schemas, all five routes |

**Must not edit:** `app/models.py`, `app/database.py`, `tests/`  
**May import:** `from app.models import Student, Enrollment` (stub if persistence lane not merged yet)

### Lane Q — Quality (`feat/enrollment-tests`)

| Owns | Delivers |
|------|----------|
| `tests/` only | pytest fixtures + minimum **6** tests covering students, enrollments, summary |

**Must not edit:** any file under `app/`

---

## 2. Worktree and branch names

| Worktree directory (sibling to main repo) | Branch | Lane |
|-------------------------------------------|--------|------|
| `enrollment-api-persistence/` | `feat/student-models` | P |
| `enrollment-api-http/` | `feat/enrollment-routes` | H |
| `enrollment-api-qa/` | `feat/enrollment-tests` | Q |
| `enrollment-api/` (main checkout) | `main` | merge target |

Bootstrap main repo:

```bash
mkdir enrollment-api && cd enrollment-api
git init
git commit --allow-empty -m "chore: bootstrap enrollment-api"
# copy ENROLLMENT_CONTRACT.md from A1/proof/enrollment-contract.md
git add ENROLLMENT_CONTRACT.md && git commit -m "chore: add enrollment contract"
```

Create worktrees:

```bash
git branch feat/student-models
git branch feat/enrollment-routes
git branch feat/enrollment-tests
git worktree add ../enrollment-api-persistence feat/student-models
git worktree add ../enrollment-api-http feat/enrollment-routes
git worktree add ../enrollment-api-qa feat/enrollment-tests
git worktree list
```

---

## 3. Agent prompts (one per lane)

### Lane P — Persistence

```
You are on branch feat/student-models in the enrollment-api worktree.

Implement ONLY the persistence layer for the Student Enrollment Service.

Create:
- app/__init__.py (empty)
- app/config.py — DATABASE_URL = "sqlite:///./enrollment.db"
- app/database.py — engine, SessionLocal, Base, get_db()
- app/models.py — Student and Enrollment ORM models matching ENROLLMENT_CONTRACT.md

Rules:
- Do NOT create routes, schemas, main.py, or tests
- Use SQLAlchemy declarative models
- Student.email must be unique
- Enrollment.student_id is a foreign key to students.id
- Commit: git commit -m "feat(persistence): student and enrollment models"
```

### Lane H — HTTP surface

```
You are on branch feat/enrollment-routes in the enrollment-api worktree.

Implement ONLY the HTTP layer for the Student Enrollment Service.

Create:
- app/__init__.py (empty)
- app/schemas.py — StudentCreate/Response, EnrollmentCreate/Response, RegistrySummary
- app/main.py — FastAPI app, create_all, include routers
- app/routes/students.py — POST/GET /students (409 on duplicate email)
- app/routes/enrollments.py — POST/GET /enrollments (404 if student missing)
- app/routes/registry.py — GET /registry/summary
- requirements.txt — fastapi, uvicorn, sqlalchemy, pydantic, pytest, httpx, email-validator

Rules:
- Import models from app.models; if missing, assume they exist per contract
- Do NOT edit app/models.py, app/database.py, or tests/
- Validate course_code length 3–8, term non-empty
- Commit: git commit -m "feat(http): enrollment routes and schemas"
```

### Lane Q — Quality

```
You are on branch feat/enrollment-tests in the enrollment-api worktree.

Write the pytest suite ONLY. Do not modify app/ source files.

Create:
- tests/conftest.py — TestClient, in-memory SQLite, override get_db
- tests/test_students.py — POST 201, duplicate email 409, GET list
- tests/test_enrollments.py — POST 201, unknown student 404
- tests/test_registry.py — summary counts after one student + one enrollment

Minimum 6 tests. Commit: git commit -m "feat(qa): enrollment pytest suite"
```

---

## 4. Shared constraints (all lanes)

1. Python 3.9+, FastAPI, SQLAlchemy, SQLite, pytest — no other frameworks
2. File paths must match [enrollment-contract.md](./enrollment-contract.md)
3. Public HTTP contract is frozen — no route or field renames
4. Each lane leaves the repo syntactically valid and committable
5. Lane H owns `requirements.txt`; other lanes must not add packages elsewhere
6. Imports use the `app.` package prefix
7. No lane merges its own branch — supervisor merges on `main` only

---

## 5. Merge order

1. **`feat/student-models` → main** — routes and tests depend on ORM shape
2. **`feat/enrollment-routes` → main** — tests need running app
3. **`feat/enrollment-tests` → main** — last; imports full stack

Use `--no-ff` merge commits for a clear audit trail.

---

## 6. Conflict and risk plan

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Both P and H create empty `app/__init__.py` | High | Accept either version; content is identical |
| Email uniqueness implemented differently | Medium | Contract specifies DB unique constraint on `Student.email` |
| FK vs plain int for `student_id` | Medium | Persistence lane owns schema; HTTP lane only validates existence |
| `requirements.txt` drift | Low | Only lane H edits it |
| Tests use wrong DB override | Medium | QA lane must override `get_db` in conftest |

**On conflict:** keep the version that matches `ENROLLMENT_CONTRACT.md`, run `pytest` before the next merge.

---

## 7. Verification plan

### Per-lane gates (before merge)

| Lane | Gate |
|------|------|
| P | `python -c "from app.models import Student, Enrollment"` succeeds |
| H | `python -m py_compile app/main.py` (models may be stubbed pre-merge) |
| Q | Test files collect with `pytest --collect-only` (may skip run pre-merge) |

### Post-merge on `main`

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest tests/ -v
grep -r "<<<<<<" . --include="*.py" || echo "Clean"
uvicorn app.main:app --port 8000
```

**curl smoke:**

```bash
curl -s -X POST http://127.0.0.1:8000/students \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Ada Lovelace","email":"ada@uni.edu","program":"CS"}'
curl -s http://127.0.0.1:8000/students
curl -s -X POST http://127.0.0.1:8000/enrollments \
  -H "Content-Type: application/json" \
  -d '{"student_id":1,"course_code":"CS101","term":"2026-FALL"}'
curl -s http://127.0.0.1:8000/enrollments
curl -s http://127.0.0.1:8000/registry/summary
```

**Sign-off checklist:**

- [ ] 6+ pytest tests green
- [ ] All five curl calls return valid JSON
- [ ] No merge conflict markers
- [ ] `git log --graph` shows three feature branches merged in order
