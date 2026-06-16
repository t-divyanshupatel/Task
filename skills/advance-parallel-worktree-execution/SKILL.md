---
name: advance-parallel-worktree-execution
description: |
  Parallel Worktree Execution — in 90 minutes, creates two or more parallel git worktrees
  or branches, makes independent changes in each lane, reconciles them cleanly, and
  documents commands, lane outputs, merge steps, test results, and conflict notes.
  Requires an A1 plan or inline lane definitions. May edit source in owned directories.
disable-model-invocation: true
---

You are the **Parallel Worktree Execution** agent (task **A2**). A developer gives you a repository and either an **A1 parallel plan** or inline lane definitions. Your job is to **actually execute** parallel work in **≤90 minutes**:

1. **Create** git worktrees (or branches) from a shared baseline commit.
2. **Implement** independent changes in each lane per ownership boundaries.
3. **Verify** each lane in isolation before merge.
4. **Merge** lanes in the documented order and resolve conflicts.
5. **Run** post-merge integration tests.
6. **Write an execution report** at `outputPath` with commands, outputs, and conflict notes.

You **may edit source, tests, and README** in lane-owned directories. Do **not** commit or push unless the user explicitly asks — but **do** create local commits per lane (required for merge demo). The report is the audit trail.

---

## Input

| Field | Required | Description |
|-------|----------|-------------|
| `repoPath` | Yes | Repository root — default demo: `Task/Advanced/A3/` |
| `planPath` | No | Path to A1 plan — e.g. `Task/Advanced/A1/parallel-worktree-plan.md`. If missing, use `laneDefinitions` or default A3 two-lane demo |
| `laneDefinitions` | No | Inline lane spec when no plan — array of `{ id, branch, worktreePath, owns, task }` |
| `lanesToRun` | No | Subset of lane IDs to execute. Default: `2` lanes minimum — demo uses `S` + `R` |
| `baseBranch` | No | Default: `main` |
| `worktreesDir` | No | Parent for worktrees. Default: `{repoPath}/../A3-worktrees/` or `../{repo}-worktrees/` |
| `outputPath` | No | Default: `Task/Advanced/A2/parallel-worktree-execution-report.md` |
| `skipMerge` | No | `false` (default) — merge after lane work; `true` — stop after lane commits (report only) |
| `initRepo` | No | `auto` (default) — init git if `repoPath` has no `.git`; `false` — fail if not a repo |

If `repoPath` is missing, ask once.

Record `startTime` (ISO 8601) as soon as you begin.

---

## Time budget

| Phase | Max minutes |
|-------|-------------|
| Baseline + worktree setup | 15 |
| Lane S implementation + tests | 25 |
| Lane R implementation + tests | 25 |
| Merge + conflict resolution | 15 |
| Integration tests + report | 10 |
| **Total** | **90** |

Adjust lane time when running more than two lanes — prioritize completing two lanes cleanly over starting a third.

---

## Phase 1 — Baseline and worktree setup

### Initialize repository (if needed)

When `initRepo: auto` and no `.git`:

```bash
cd {repoPath}
cat > .gitignore <<'EOF'
# language-specific ignores — venv, node_modules, target/, .pytest_cache/
EOF
git init -b {baseBranch}
git add .
git commit -m "Baseline for parallel worktree demo."
```

Record **baseline commit SHA**.

### Create worktrees

From repo root:

```bash
mkdir -p {worktreesDir}

git worktree add {worktreesDir}/lane-s-service -b lane-s-service
git worktree add {worktreesDir}/lane-r-scorer -b lane-r-scorer

git worktree list
```

Capture verbatim `git worktree list` output for the report.

### Default demo lanes (when no plan provided)

| Lane | Branch | Worktree | Owns | Task |
|------|--------|----------|------|------|
| **S** | `lane-s-service` | `lane-s-service/` | `service/**` | Add `GET /stats` endpoint + tests |
| **R** | `lane-r-scorer` | `lane-r-scorer/` | `scorer/**` | Add `weekend_transaction` scoring signal (+5) |

Both lanes may **append** a `## Parallel lane changelog` section to `README.md` — expect README conflict on merge.

---

## Phase 2 — Lane S execution

Work in `{worktreesDir}/lane-s-service`.

### Rules

- Edit **only** `service/**` and README append section.
- Do **not** read or depend on Lane R changes.
- Commit when lane tests pass.

### Default implementation (A3 demo)

1. Add `GET /stats` to FastAPI service returning transaction counts by status.
2. Add/update tests in `service/tests/test_api.py`.
3. Append to README:

   ```markdown
   ## Parallel lane changelog — Lane S
   - Added `GET /stats` endpoint.
   ```

### Lane S verification

```bash
cd service
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest -q
```

Record: command, exit code, test count, output snippet.

### Lane S commit

```bash
git add service/ README.md
git commit -m "Lane S: add GET /stats endpoint for transaction counts."
```

Record commit SHA.

---

## Phase 3 — Lane R execution

Work in `{worktreesDir}/lane-r-scorer`.

### Rules

- Edit **only** `scorer/**` and README append section.
- Independent of Lane S.

### Default implementation (A3 demo)

1. Add weekend transaction detection in Rust scorer (+5 risk when transaction is on Sat/Sun).
2. Add/update tests in `scorer/tests/` or `scorer/src/lib.rs` unit tests.
3. Append to README:

   ```markdown
   ## Parallel lane changelog — Lane R
   - Added weekend_transaction scoring signal (+5).
   ```

### Lane R verification

```bash
cd scorer
cargo test
```

Record: command, exit code, output snippet.

### Lane R commit

```bash
git add scorer/ README.md
git commit -m "Lane R: add weekend_transaction scoring signal (+5)."
```

Record commit SHA.

---

## Phase 4 — Merge and reconcile

Return to main repo root (`repoPath`).

### Merge order (default demo)

```bash
# Merge Lane S first
git merge lane-s-service --no-edit
# Record result: fast-forward or merge commit

# Merge Lane R second
git merge lane-r-scorer --no-edit
# Expect README conflict — resolve manually
```

### README conflict resolution

When both lanes appended changelog sections:

1. Open conflicted `README.md`.
2. Keep **both** lane changelog sections.
3. Remove conflict markers.
4. `git add README.md && git commit -m "Merge lane-r-scorer; resolve README changelog conflict."`

Document conflict files, resolution strategy, and final integration commit SHA.

If `skipMerge: true`, document lane commit SHAs and stop — note merge steps as "planned not executed".

---

## Phase 5 — Post-merge verification

Run integration-level checks from merged `main`:

```bash
cd {repoPath}/service && pytest -q
cd {repoPath}/worker && npm test 2>/dev/null || true
cd {repoPath}/scorer && cargo test 2>/dev/null || true
```

Record each command and result. Note skipped tests (e.g. integration tests requiring live Rust binary).

### Capture separate lane outputs

For the report, summarize **before merge**:

| Lane | Files changed | Commit | Tests | Key deliverable |
|------|---------------|--------|-------|-----------------|
| S | list | SHA | PASS/FAIL | GET /stats |
| R | list | SHA | PASS/FAIL | weekend signal |

---

## Phase 6 — Write the execution report

Record `endTime` and compute `duration`.

Write to `outputPath`:

```markdown
# Parallel Worktree Execution Report

## Metadata

| Field | Value |
|-------|-------|
| **Agent name** | parallel-worktree-execution |
| **Task ID** | A2 |
| **Started at** | {startTime} |
| **Completed at** | {endTime} |
| **Duration** | {duration} |
| **Repository root** | {repoPath} |
| **Plan used** | {planPath or "inline defaults"} |
| **Base commit** | {SHA — message} |
| **Integration commit** | {SHA or "merge skipped"} |
| **Lanes executed** | {list} |

## Executive summary

{3–5 sentences: lanes run, merge outcome, test results, conflicts.}

{Optional mermaid gitGraph}

## 1. Commands used to create worktrees

### 1.1 Initialize repository and baseline

\`\`\`bash
{verbatim commands}
\`\`\`

**Baseline commit:** `{SHA}`

### 1.2 Create parallel worktrees

\`\`\`bash
{verbatim commands}
\`\`\`

**Output:**

\`\`\`
{git worktree list}
\`\`\`

## 2. Branch and worktree names

| Lane | Branch | Worktree path | Scope |
|------|--------|---------------|-------|
| S | `lane-s-service` | `{path}` | `service/` |
| R | `lane-r-scorer` | `{path}` | `scorer/` |

## 3. Separate outputs from each lane

### Lane S — {title}

**Commit:** `{SHA}`

**Files changed:**

| File | Change |
|------|--------|
| … | … |

**Diff summary:**

\`\`\`diff
{key diff hunks or git show --stat}
\`\`\`

**Tests:**

| Command | Result |
|---------|--------|
| `pytest -q` | PASS — {n} tests |

### Lane R — {title}

{Same structure}

## 4. Final merge or reconcile steps

\`\`\`bash
{merge commands verbatim}
\`\`\`

| Step | Action | Result |
|------|--------|--------|
| 1 | Merge `lane-s-service` | {fast-forward / merge commit} |
| 2 | Merge `lane-r-scorer` | {conflict / clean} |
| 3 | Resolve README | {strategy} |

**Integration commit:** `{SHA}`

## 5. Test results

### Post-merge

| Suite | Command | Result |
|-------|---------|--------|
| Service | `pytest -q` | {PASS/FAIL — count} |
| Worker | `npm test` | {PASS/FAIL/SKIPPED} |
| Scorer | `cargo test` | {PASS/FAIL/SKIPPED} |

### Output

\`\`\`
{truncated test output}
\`\`\`

## 6. Conflict notes

| File | Lanes | Type | Resolution |
|------|-------|------|------------|
| `README.md` | S + R | content | Kept both changelog sections |

### Conflict diff (before resolution)

\`\`\`diff
{conflict markers excerpt if any}
\`\`\`

## 7. Verification checklist

- [ ] Two+ worktrees created from same baseline
- [ ] Each lane committed independently
- [ ] Each lane tests passed before merge
- [ ] Merge completed (or documented skip)
- [ ] Post-merge tests run
- [ ] Conflicts documented with resolution

## 8. Cleanup (optional)

\`\`\`bash
git worktree remove {worktreesDir}/lane-s-service
git worktree remove {worktreesDir}/lane-r-scorer
\`\`\`

## Discovery notes

{Commands run, ambiguities, known limitations}
```

Print compact summary:

```markdown
## Parallel Worktree Execution — complete

| Lanes | {S, R} |
| Merge | {clean / README conflict resolved} |
| Tests | {post-merge summary} |
| Report | {outputPath} |
```

---

## Rules

1. **Actually execute** — create real worktrees and commits; do not simulate with prose only.
2. **Respect ownership** — lane edits stay in owned paths (+ README append).
3. **Verify before merge** — each lane's tests must run; document FAIL honestly.
4. **Merge order** — follow A1 plan when provided; default S then R for demo.
5. **Conflict transparency** — document every conflict file and resolution.
6. **Minimal scope** — demo lanes add one feature each; no drive-by refactors.
7. **No push** — unless user explicitly requests.
8. **Evidence over claims** — paste real SHAs, command output, test counts.
9. **Two lanes minimum** — task requires demonstrating parallel execution.
10. **Single deliverable** — report at `outputPath` plus compact chat summary.

---

## Completion checklist

Before finishing, verify:

- [ ] Worktree creation commands and output in report
- [ ] Branch/worktree names table complete
- [ ] Separate lane outputs with commits and diffs
- [ ] Merge/reconcile steps documented with SHAs
- [ ] Post-merge test results with commands
- [ ] Conflict notes section filled (or "none")
- [ ] Report file exists at `outputPath`
- [ ] User receives compact summary
