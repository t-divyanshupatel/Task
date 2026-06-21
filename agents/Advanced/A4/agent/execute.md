# Phase 2 — Execute

Run after [planning.md](./planning.md) inputs are confirmed. Analyze the repo, prioritize opportunities, implement the first step, verify, and write the deliverable.

Implementation changes go **in `repoPath`**. Report writes go to `{proofDir}` and/or `{agentDir}/modernization-site/` only.

---

## Input (from planning)

| Field | Required | Description |
|-------|----------|-------------|
| `repoPath` | Yes | Repository root |
| `outputFormat` | Yes | `markdown` or `website` |
| `outputPath` | Yes | `{proofDir}/modernization-report.md` or `{agentDir}/modernization-site/` |
| `scope` | No | Subdirectory, package, or module limit in monorepos |
| `modernizationFocus` | No | Limit scan categories if user specified |
| `allowImplementation` | No | `true` default — set `false` for analysis-only |
| `verifyCommands` | No | Override auto-detected build/test/lint commands |

Record `startTime` (ISO 8601) if not already set.

---

## Step 1 — Repo reconnaissance

Establish context before hunting for modernization opportunities:

1. Read `README.md`, `package.json`, `pom.xml`, `build.gradle`, `build.gradle.kts`, `pyproject.toml`, `Cargo.toml`, `go.mod`, or equivalent.
2. Detect stack(s), language version(s), framework(s), build tool, CI provider, and package manager.
3. Identify config files: `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`, `Dockerfile`, `docker-compose.yml`, `.nvmrc`, `.node-version`, `tsconfig.json`, `.eslintrc*`, `.prettierrc*`, `renovate.json`, `dependabot.yml`, `.env.example`.
4. Note monorepo layout if present — scan each package or respect `scope`.
5. Record directories to **exclude**: `node_modules/`, `vendor/`, `build/`, `dist/`, `.git/`, `target/`, `coverage/`, `**/generated/**`.

Run applicable detection commands (read-only):

```bash
# Examples — use what fits the stack
node -v 2>/dev/null; cat .nvmrc 2>/dev/null; cat .node-version 2>/dev/null
npm outdated 2>/dev/null || yarn outdated 2>/dev/null || true
npm audit --json 2>/dev/null | head -c 5000 || true
grep -r "deprecated" package.json pom.xml 2>/dev/null | head -20
```

---

## Step 2 — Discover modernization opportunities

Scan for findings across these categories. Each finding must have **evidence** (file path + line, config key, or command output excerpt).

| Category | What to look for | Evidence examples |
|----------|------------------|-------------------|
| **Dependencies** | Outdated packages, deprecated libs, unpinned versions, missing lockfile | `package.json:42`, `npm outdated` output |
| **Security** | Known CVEs, hardcoded secrets, missing `.env.example`, weak auth config | `npm audit`, `.env` committed, `application.yml:12` |
| **CI/CD** | Missing CI, no cache, no test step, manual deploy, outdated action versions | `.github/workflows/ci.yml:1`, absent workflow |
| **Code quality** | Missing linter/formatter, inconsistent config, dead code markers | no `.eslintrc`, `TODO`/`FIXME` density |
| **Type safety** | Missing strict mode, `@ts-ignore`, untyped APIs, old JS without types | `tsconfig.json:compilerOptions.strict: false` |
| **Testing** | No tests, low coverage config, missing test script, flaky patterns | no `test/` dir, `package.json` missing `test` script |
| **Architecture** | God files, circular deps, mixed concerns, legacy patterns | import graph, file size, deprecated API usage |
| **Performance** | Sync blocking in hot paths, missing cache, unbounded queries | `N+1` patterns, no pagination |
| **Documentation** | Stale README, missing API docs, no CONTRIBUTING | README vs actual stack mismatch |
| **Tooling** | Old Node/Java version, missing editorconfig, no pre-commit hooks | `.nvmrc` missing while `engines.node` set |

### Finding record format

For each finding capture:

| Column | Description |
|--------|-------------|
| ID | `MOD-001`, `MOD-002`, … |
| Category | One of the categories above |
| Title | Short name |
| Description | What is outdated or missing |
| Evidence | `path:line` or config key or command output |
| Severity | `critical` / `high` / `medium` / `low` |
| Impact | 1–5 (5 = highest business/tech benefit) |
| Effort | 1–5 (1 = trivial, 5 = multi-day) |
| Risk | 1–5 (1 = very safe, 5 = high regression risk) |
| Suggested fix | One-line remediation |

Aim for **at least 8 findings** on a non-trivial repo. If fewer, note gaps in Discovery notes.

---

## Step 3 — Prioritize and select first step

### Priority score

Compute for each finding:

```
priorityScore = (Impact × 2) - Effort - Risk
```

Higher is better. Tie-break: lower Risk, then lower Effort.

### Selection rules for first step

Pick **exactly one** finding where:

1. **Highest priority score** among items with **Risk ≤ 2** and **Effort ≤ 2**
2. If none qualify, pick highest score with **Risk ≤ 3** and **Effort ≤ 3**
3. If still none, pick top item but mark `[NEEDS CLARIFICATION]` and **do not implement** — report only

Good first-step examples (low risk, high value):

- Add missing `.nvmrc` / `.node-version` matching `engines` field
- Add `engines` field to `package.json` when Node version is implicit
- Enable ESLint/Prettier config that already exists but isn't wired in CI
- Add missing `test` or `lint` script to CI pipeline
- Pin a floating dependency to a stable version (patch/minor)
- Add `.env.example` documenting required env vars (no secrets)
- Replace a single deprecated API call with its documented replacement
- Add Dependabot/Renovate config when none exists

Bad first-step examples (defer):

- Major framework upgrades (React 17→19, Spring Boot 2→3)
- Database schema migrations
- Auth system rewrites
- Monorepo restructure
- Removing large legacy modules

Produce a **ranked backlog table** (all findings, sorted by priority score descending).

---

## Step 4 — Implement the first step

Skip if `allowImplementation: false`.

1. Create a short implementation plan (2–5 bullet points) before editing.
2. Make **minimal** changes in `repoPath` only — touch the fewest files needed.
3. Match existing code style and conventions.
4. Do not refactor unrelated code.
5. Record every file changed with before/after summary.

After editing, capture a diff summary:

```bash
git -C "$repoPath" diff --stat 2>/dev/null || diff summary manually
git -C "$repoPath" diff 2>/dev/null | head -200
```

---

## Step 5 — Verify the implementation

Run the appropriate checks for the stack. Record command, exit code, and relevant output.

| Stack signal | Try (in order) |
|--------------|----------------|
| Node/TS | `npm run lint`, `npm test`, `npm run build`, `npx tsc --noEmit` |
| Java/Maven | `mvn test`, `mvn verify`, `mvn checkstyle:check` |
| Java/Gradle | `./gradlew test`, `./gradlew build`, `./gradlew check` |
| Python | `pytest`, `ruff check`, `mypy .` |
| Go | `go test ./...`, `go vet ./...` |
| Flutter/Dart | `flutter test`, `dart analyze` |

If verification fails:

1. Attempt one fix if clearly caused by your change.
2. If still failing, **rollback** the implementation (Step 6) and select the next eligible finding OR report failure with evidence.
3. Never claim success without a passing verification command.

If no tests/build exist, run the closest available check (lint, typecheck, or syntax compile) and note the limitation.

---

## Step 6 — Rollback notes

For the implemented change, document:

| Item | Content |
|------|---------|
| Files to revert | List each path |
| Git command | `git checkout -- <files>` or `git revert` if committed |
| Manual undo | Steps if change isn't git-tracked |
| Verification after rollback | Command to confirm clean state |

---

## Step 7 — Write deliverable

Record `endTime` and compute `duration` (human-readable, e.g. `8m 45s`).

Branch on `outputFormat`:

---

### Format A — Markdown (`outputFormat: markdown`)

Write to `{proofDir}/modernization-report.md`.

Use this exact structure:

```markdown
# Modernization Report

## Metadata

| Field | Value |
|-------|-------|
| **Agent name** | repo-modernizer |
| **Started at** | {startTime ISO 8601} |
| **Completed at** | {endTime ISO 8601} |
| **Duration** | {duration} |
| **Repository** | {repoPath} |
| **Repo name** | {derived name} |
| **Stack detected** | {e.g. Node 20 + TypeScript + Next.js 15} |
| **Scope** | {scope or "full repo"} |
| **Findings count** | {n} |
| **First step implemented** | {MOD-00X title or "None (analysis-only)"} |
| **Verification status** | {pass / fail / skipped} |

## Executive Summary

{3–5 sentences: repo health, top themes, what was implemented, verification outcome.}

## Findings

### Summary by category

| Category | Count | Highest severity |
|----------|-------|------------------|
| Dependencies | {n} | {severity} |
| Security | {n} | {severity} |
| ... | ... | ... |

### Findings chart

\`\`\`mermaid
pie title Findings by category
  "Dependencies" : {n}
  "Security" : {n}
  "CI/CD" : {n}
  ...
\`\`\`

### Detailed findings

| ID | Category | Title | Severity | Impact | Effort | Risk | Evidence | Suggested fix |
|----|----------|-------|----------|--------|--------|------|----------|---------------|
| MOD-001 | Dependencies | ... | high | 4 | 2 | 1 | package.json:12 | ... |

## Prioritized Plan

### Priority matrix

\`\`\`mermaid
quadrantChart
  title Modernization Priority Matrix
  x-axis Low Effort --> High Effort
  y-axis Low Impact --> High Impact
  quadrant-1 Quick wins
  quadrant-2 Major projects
  quadrant-3 Fill-ins
  quadrant-4 Thankless tasks
  {item labels with coordinates}
\`\`\`

### Ranked backlog

| Rank | ID | Title | Priority score | Impact | Effort | Risk | Status |
|------|-----|-------|----------------|--------|--------|------|--------|
| 1 | MOD-003 | ... | 5 | 4 | 1 | 1 | **Implemented** |
| 2 | MOD-001 | ... | 4 | 5 | 2 | 2 | Backlog |

## First Step Implemented

### Selected item

| Field | Value |
|-------|-------|
| **ID** | MOD-003 |
| **Title** | ... |
| **Why this first** | Highest priority score among low-risk items |
| **Category** | ... |

### Changes made

| File | Change summary |
|------|----------------|
| .nvmrc | Added Node 20 to match engines field |

### Diff summary

\`\`\`
{git diff --stat or equivalent}
\`\`\`

## Verification

| Command | Exit code | Result | Notes |
|---------|-----------|--------|-------|
| npm run lint | 0 | pass | no new errors |
| npm test | 0 | pass | 142 tests |

### Output excerpt

\`\`\`
{relevant stdout/stderr lines}
\`\`\`

## Rollback Notes

### Quick rollback

\`\`\`bash
git checkout -- .nvmrc
\`\`\`

### Files affected

- `.nvmrc` — delete or restore previous content

### Post-rollback verification

\`\`\`bash
node -v  # confirm expected version
\`\`\`

## Discovery Notes

### Files examined
- `path/to/file` — {why it mattered}

### Excluded from scan
- `node_modules/` — third-party

### Ambiguities & gaps
- {items that could not be verified}

### Recommended next steps
- {items ranked #2 and #3 from backlog}
```

---

### Format B — Website (`outputFormat: website`)

Build at `{agentDir}/modernization-site/`.

#### Bootstrap (do not edit template)

```bash
cp -R Task/agents/frontend/. {agentDir}/modernization-site/
cd {agentDir}/modernization-site
npm install
```

**Never modify files under `Task/agents/frontend/`** — only files inside `modernization-site/`.

#### Required site features

1. **Overview** — metadata, executive summary, stats cards (findings count, severity breakdown, verification badge)
2. **Findings explorer** — searchable/filterable table by category and severity; evidence with copy-to-clipboard
3. **Priority matrix** — visual chart (CSS grid, SVG, or chart library) plotting impact vs effort/risk
4. **Ranked backlog** — sortable table; highlight implemented item
5. **First step panel** — selected item, rationale, files changed, diff summary
6. **Verification panel** — commands, pass/fail badges, output excerpts
7. **Rollback section** — copy-to-clipboard rollback commands
8. **Responsive UI** — clean layout, works mobile through desktop

#### Data layer

Generate `{agentDir}/modernization-site/data/modernization-report.json` from analysis results. Website must reflect **same completeness** as the markdown report. Use real discovered data only — no placeholder findings.

#### Run locally

```bash
cd {agentDir}/modernization-site
npm run dev
```

Open **http://localhost:3000**. Fix build/lint errors until `npm run build` passes.

---

## Execution rules

1. **Evidence over guessing** — every finding cites a file, config, or command output.
2. **One step only** — implement exactly one modernization item per run.
3. **Verify before reporting success** — run at least one automated check after implementation.
4. **Rollback always documented** — even if implementation was skipped.
5. **Report in proof directory** — markdown goes to `{proofDir}/`; never write the primary report into the analyzed repo.
6. **Template unchanged** — never edit `Task/agents/frontend/`; only the copied site directory.
7. **Single deliverable** — either markdown **or** website, not both unless explicitly requested.

After writing deliverable, proceed to [verify.md](./verify.md).
