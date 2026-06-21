#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SANDBOX="${ROOT}/sandbox"
SRC="${SANDBOX}/enrollment-api-src"
DEMO="${SANDBOX}/.parallel-demo"
MAIN_DIR="${DEMO}/enrollment-api"
ALPHA_DIR="${DEMO}/enrollment-api-alpha"
BETA_DIR="${DEMO}/enrollment-api-beta"
PROOF_DIR="${ROOT}/proof"
mkdir -p "${PROOF_DIR}"

if [[ ! -d "${SRC}" ]]; then
  echo "ERROR: missing ${SRC}" >&2
  exit 1
fi

echo "==> Reset demo sandbox"
rm -rf "${DEMO}"
mkdir -p "${DEMO}"

echo "==> Bootstrap main repository"
mkdir -p "${MAIN_DIR}"
cd "${MAIN_DIR}"
git init -q
git commit --allow-empty -q -m "chore: bootstrap enrollment-api"
cp "${SRC}/ENROLLMENT_CONTRACT.md" .
git add ENROLLMENT_CONTRACT.md
git commit -q -m "chore: add enrollment contract"

git branch feat/enrollment-persistence
git branch feat/enrollment-http
git worktree add "${ALPHA_DIR}" feat/enrollment-persistence
git worktree add "${BETA_DIR}" feat/enrollment-http

echo "==> Lane Alpha — persistence"
mkdir -p "${ALPHA_DIR}/app"
cp "${SRC}/app/__init__.py" "${ALPHA_DIR}/app/"
cp "${SRC}/app/config.py" "${ALPHA_DIR}/app/"
cp "${SRC}/app/database.py" "${ALPHA_DIR}/app/"
cp "${SRC}/app/models.py" "${ALPHA_DIR}/app/"
cd "${ALPHA_DIR}"
git add app/
git commit -q -m "feat(persistence): student and enrollment models"
ALPHA_SHA=$(git rev-parse --short HEAD)
python3 -m pip install -q sqlalchemy
{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Lane: Alpha (feat/enrollment-persistence)"
  echo "Worktree: ${ALPHA_DIR}"
  echo "Commit: ${ALPHA_SHA}"
  PYTHONPATH=. python3 -c "from app.models import Student, Enrollment; print('OK: Student, Enrollment importable')"
  echo ""
  echo "git diff main --name-only:"
  git diff main --name-only
} | tee "${PROOF_DIR}/worktree-alpha-log.txt"

echo "==> Lane Beta — HTTP surface"
mkdir -p "${BETA_DIR}/app/routes"
cp "${SRC}/app/__init__.py" "${BETA_DIR}/app/"
cp "${SRC}/app/schemas.py" "${BETA_DIR}/app/"
cp "${SRC}/app/main.py" "${BETA_DIR}/app/"
cp "${SRC}/app/routes/"* "${BETA_DIR}/app/routes/"
cp "${SRC}/requirements.txt" "${BETA_DIR}/"
cd "${BETA_DIR}"
git add app/ requirements.txt
git commit -q -m "feat(http): enrollment routes and schemas"
BETA_SHA=$(git rev-parse --short HEAD)
{
  echo "Captured: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Lane: Beta (feat/enrollment-http)"
  echo "Worktree: ${BETA_DIR}"
  echo "Commit: ${BETA_SHA}"
  python3 -m py_compile app/schemas.py app/routes/students.py app/routes/enrollments.py app/routes/registry.py
  echo "py_compile: OK (persistence layer merged later)"
  echo ""
  echo "git diff main --name-only:"
  git diff main --name-only
} | tee "${PROOF_DIR}/worktree-beta-log.txt"

echo "==> Merge on main"
cd "${MAIN_DIR}"
git merge feat/enrollment-persistence --no-ff -q -m "merge(a2): persistence layer"
git merge feat/enrollment-http --no-ff -q -m "merge(a2): http layer"
cp -R "${SRC}/tests" .
git add tests/
git commit -q -m "feat(qa): enrollment pytest suite"

echo "==> git worktree list"
git worktree list

git worktree remove "${ALPHA_DIR}"
git worktree remove "${BETA_DIR}"

echo "==> Demo git repo ready at ${MAIN_DIR}"
echo "Run ./scripts/capture-proof.sh against sandbox/enrollment-api for live verification proof"
