# Phase 2 — Execute

Run after [planning.md](./planning.md) inputs are confirmed. Acquire the diff, perform multi-dimensional review, compute verdict, and write the deliverable.

You are **read-only on `repoPath`** unless `applyFixes: true`. Report writes go to `{proofDir}` and/or `{agentDir}/pr-review-site/` only.

---

## Input (from planning)

| Field | Required | Description |
|-------|----------|-------------|
| `reviewTarget` | Yes | `pr-url`, `branch`, or `local-diff` |
| `repoPath` | Yes* | Repository root (*required for branch/local-diff) |
| `outputFormat` | Yes | `markdown` or `website` |
| `outputPath` | Yes | `{proofDir}/pr-review-report.md` or `{agentDir}/pr-review-site/` |
| `prUrl` | No | PR/MR URL when `reviewTarget: pr-url` |
| `branchName` | No | Source branch when `reviewTarget: branch` |
| `baseBranch` | No | Target branch — default: repo default |
| `jiraKey` | No | Jira ticket for requirements alignment |
| `ticketContext` | No | Free-text requirements when no Jira |
| `focusAreas` | No | Limit review dimensions — default: all five |
| `assumeAgentGenerated` | No | `true` default — apply agent-specific heuristics |
| `postToPr` | No | `false` default — report only |
| `applyFixes` | No | `false` default — do not edit code |

Record `startTime` (ISO 8601) if not already set.

---

## Step 1 — Acquire diff and context

### Resolve the review target

| Input | Action |
|-------|--------|
| `pr-url` | Detect platform (GitHub / GitLab / Bitbucket). Fetch MR/PR metadata — title, author, source branch, target branch, description, linked issues. Use `gh pr diff`, GitLab/Bitbucket API, or MCP if configured. |
| `branch` | `git fetch origin {branchName} {baseBranch}`. Diff: `git diff origin/{baseBranch}...origin/{branchName}` (or local branch if not pushed). |
| `local-diff` | If on a feature branch: `git diff {baseBranch}...HEAD`. If dirty tree: `git diff` + `git diff --cached`. |

If the diff is empty, stop and tell the user — nothing to review.

### Capture metadata

| Field | Source |
|-------|--------|
| Repository name / path | Remote URL or `repoPath` |
| Source branch | PR or branch input |
| Target branch | PR or `baseBranch` |
| PR/MR title & author | API or user |
| Commit count & messages | `git log {base}..{head} --oneline` |
| Files changed | `git diff --stat` |
| Diff size | File count and approximate KB |
| Jira key | Regex from branch/title, or `jiraKey` input |
| Requirements | Jira via MCP (`read_jira_issue_api`) or `ticketContext` |

### Read surrounding context (not just the diff)

For each changed file, skim:

- Imports and callers (who depends on this code?)
- Matching tests — `**/*Test*`, `**/*.test.*`, `**/*_test.go`, `**/test_*.py`
- Config / migration files touched alongside code
- README or API docs if public surface changed

### Baseline repo health (optional, read-only)

If fast enough, run the narrowest existing check:

| Priority | Command | Purpose |
|----------|---------|---------|
| 1 | CI-equivalent test command from changed package | Same gate merge would hit |
| 2 | Lint on changed paths | Obvious style/type errors |
| 3 | Build / compile | Syntax and dependency resolution |

Document result as `PASS` / `FAIL` / `NOT RUN` — do not block the review if tests cannot run, but note it in the report.

---

## Step 2 — Multi-dimensional review

Review **every changed hunk**. Every finding **must** cite evidence (`path:line` or diff hunk). Use `unknown` rather than inventing issues. Respect `focusAreas` when provided.

### Review dimensions

| Dimension | What to look for | Common agent-generated PR patterns |
|-----------|------------------|--------------------------------------|
| **Correctness** | Logic bugs, off-by-one, null/undefined handling, race conditions, wrong HTTP status codes, broken error paths, API contract drift, incorrect types, missing validation on boundaries | Happy-path-only code; copy-paste from outdated examples; invented function signatures; partial refactors leaving dead branches |
| **Security** | Injection (SQL, NoSQL, XSS, command), authZ/authN gaps, secrets in code, SSRF, path traversal, insecure defaults, missing input validation, sensitive data in logs, dependency CVEs in changed lockfiles | Disabled security "for testing"; `eval` / dynamic code; string-concat SQL; credentials in diff; overly permissive CORS |
| **Tests** | Missing tests for new behavior, tests that don't assert anything meaningful, mocking the unit under test, no negative/error cases, flaky patterns, deleted tests without replacement, coverage gaps on critical paths | Generated tests that mirror implementation line-for-line; tests that always pass; no edge-case coverage |
| **Performance** | N+1 queries, unbounded loops, missing indexes, sync I/O on hot paths, unnecessary allocations, missing pagination, large payload serialization, cache stampedes, blocking calls in async handlers | Fetching full collections then filtering in memory; regex scans on large tables; missing `limit`; redundant API calls |
| **Maintainability** | Unclear naming, god functions, duplicated logic, missing types, magic numbers, poor error messages, inconsistent patterns vs repo, missing docs on public APIs, drive-by refactors, scope creep beyond ticket | Unrelated formatting across files; new abstractions for one use; comments that restate code; ignoring repo conventions |

### Severity scale

| Severity | Meaning | Typical examples |
|----------|---------|------------------|
| `critical` | Exploitable security flaw, data loss/corruption, production outage risk | SQL injection, auth bypass, migration without rollback |
| `high` | Definite bug or serious design flaw likely to fail in production | Wrong business logic, missing auth on new endpoint, race on shared state |
| `medium` | Likely problem under realistic conditions, or significant gap | Missing error handling, weak validation, performance regression at scale |
| `low` | Minor issue, unlikely to cause failure soon | Naming nit, minor duplication, missing log context |
| `info` | Observation, improvement, or question — not a defect | Suggested refactor, optional optimization, needs product clarification |

### Blocking classification

| Classification | Merge rule |
|----------------|------------|
| **blocking** | Must fix before merge — any `critical` or `high` correctness/security issue; any `high` test gap on new critical path; migration without rollback; failing CI that this PR introduces |
| **non-blocking** | Should fix but merge acceptable with tracked follow-up — most `medium` items, `low`, and `info` |
| **advisory** | Nice-to-have — style, micro-optimizations, optional docs |

Default mapping:

- `critical` → **blocking**
- `high` → **blocking** (security/correctness/test on critical path); **non-blocking** if purely maintainability with safe workaround
- `medium` → **non-blocking** (unless security-adjacent)
- `low` / `info` → **non-blocking** or **advisory**

### For each finding, capture

| Field | Description |
|-------|-------------|
| **ID** | `REV-001`, `REV-002`, … |
| **Title** | Short name — e.g. "SQL injection in search filter" |
| **Dimension** | `correctness` / `security` / `tests` / `performance` / `maintainability` |
| **Severity** | `critical` / `high` / `medium` / `low` / `info` |
| **Classification** | `blocking` / `non-blocking` / `advisory` |
| **Location** | `path:line` (or `path` if line unknown) |
| **Evidence** | Quote or paraphrase the problematic code — max 5 lines |
| **Problem** | What is wrong and why it matters — 1–3 sentences |
| **Suggested fix** | Concrete change — code snippet, pattern name, or step list |
| **Verification** | How to confirm the fix works — test to add, command to run, manual step |
| **Ticket alignment** | `in-scope` / `out-of-scope` / `missing-from-pr` / `n/a` |
| **Notes** | Ambiguity, needs author clarification |

Deduplicate related findings. Group when one root cause drives multiple symptoms.

### Agent-specific heuristics (when `assumeAgentGenerated: true`)

Flag these patterns explicitly:

1. **Scope creep** — changes not traceable to ticket/requirements
2. **Hallucinated APIs** — imports or methods that don't exist in the repo or dependency version
3. **Placeholder implementations** — `TODO`, `FIXME`, stub returns, hardcoded mock data in production paths
4. **Test theater** — assertions on constants, tests that don't exercise the changed code path
5. **Incomplete error contracts** — new endpoints without 4xx/5xx handling documented or tested
6. **Missing rollback** — DB migrations without undo
7. **Silent behavior change** — modified defaults not mentioned in PR description

### Do not report (out of scope)

- Pre-existing issues in untouched files (unless the PR makes them worse) — note as pre-existing in discovery, not as REV findings
- Pure formatting preferences with no functional impact — `advisory` at most
- Dependency version bumps with no CVE unless they introduce breaking API misuse in the diff

---

## Step 3 — Requirements alignment

When Jira or `ticketContext` is available:

| Check | Action |
|-------|--------|
| Acceptance criteria | Map each criterion to `covered` / `partial` / `missing` with evidence |
| Out-of-scope work | List files/changes not required by ticket — REV finding if significant |
| Missing requirements | Ticket asks for X; diff does not include X — `missing-from-pr` finding |

If no ticket context, state `Requirements source: none` and skip alignment scoring.

---

## Step 4 — Merge verdict

| Metric | Rule |
|--------|------|
| **Blocking count** | Count findings with `classification: blocking` |
| **Verdict** | `APPROVE` — zero blocking; `REQUEST CHANGES` — one or more blocking; `COMMENT` — zero blocking but ≥3 medium or significant misalignment |

| Verdict | Condition |
|---------|-----------|
| **REQUEST CHANGES** | Any blocking finding, or baseline tests FAIL due to this PR |
| **COMMENT** | No blocking, but medium findings or requirements gaps worth discussion |
| **APPROVE** | No blocking; requirements covered; no critical/high open items |

Always state verdict confidence: `high` / `medium` / `low` — based on diff completeness, whether tests were run, and domain complexity.

---

## Step 5 — Write deliverable

Record `endTime` and compute `duration` (human-readable, e.g. `8m 12s`).

Branch on `outputFormat`:

---

### Format A — Markdown (`outputFormat: markdown`)

Write to `{proofDir}/pr-review-report.md`.

Use this exact structure:

```markdown
# PR Review Report

## Metadata

| Field | Value |
|-------|-------|
| **Agent name** | pr-review |
| **Started at** | {startTime ISO 8601} |
| **Completed at** | {endTime ISO 8601} |
| **Duration** | {duration} |
| **Repository** | {repo name or path} |
| **PR / branch** | {URL or branch name} |
| **Source → target** | `{source}` → `{target}` |
| **Author** | {author or unknown} |
| **Jira key** | {key or "none"} |
| **Files changed** | {count} |
| **Diff size** | {KB} |
| **Focus areas** | {user focus or "all"} |
| **Agent-generated heuristics** | {true / false} |
| **Baseline tests** | {PASS / FAIL / NOT RUN} |
| **Findings count** | {total} |
| **Blocking count** | {n} |
| **Verdict** | {APPROVE / REQUEST CHANGES / COMMENT} |
| **Verdict confidence** | {high / medium / low} |

## Summary

{3–5 sentences: what the PR does, overall quality, top risks, verdict rationale.}

## Verdict

| Verdict | {APPROVE / REQUEST CHANGES / COMMENT} |
|---------|---------------------------------------|
| **Blocking issues** | {n} |
| **Non-blocking issues** | {n} |
| **Advisory items** | {n} |
| **Confidence** | {high / medium / low} — {one sentence why} |

### Must fix before merge

{Numbered list of blocking REV IDs with one-line title each — or "None."}

### Recommended follow-ups

{Numbered list of non-blocking medium/high-value items — or "None."}

## Severity distribution

### Counts by severity

| Severity | Blocking | Non-blocking | Advisory | Total |
|----------|----------|--------------|----------|-------|
| critical | {n} | {n} | {n} | {n} |
| high | {n} | {n} | {n} | {n} |
| medium | {n} | {n} | {n} | {n} |
| low | {n} | {n} | {n} | {n} |
| info | {n} | {n} | {n} | {n} |

### Distribution chart

\`\`\`mermaid
pie title Findings by severity
  "critical" : {n}
  "high" : {n}
  "medium" : {n}
  "low" : {n}
  "info" : {n}
\`\`\`

## Issue list

{One subsection per finding, ordered: blocking first, then by severity descending.}

### REV-001 — {Title}

| Field | Value |
|-------|-------|
| **Dimension** | {correctness / security / tests / performance / maintainability} |
| **Severity** | {critical / high / medium / low / info} |
| **Classification** | {blocking / non-blocking / advisory} |
| **Location** | `{path:line}` |
| **Ticket alignment** | {in-scope / out-of-scope / missing-from-pr / n/a} |

**Problem:** {1–3 sentences}

**Evidence:**

\`\`\`{lang}
{quoted code — max 5 lines}
\`\`\`

**Source:** `{path:line-line}`

**Suggested fix:**

{Concrete fix — prose and/or code snippet}

\`\`\`{lang}
{suggested code if applicable}
\`\`\`

**Verification:**

| Step | Action |
|------|--------|
| 1 | {e.g. Add unit test `test_search_rejects_invalid_input`} |
| 2 | {e.g. Run `npm test -- search.test.ts`} |
| 3 | {e.g. Manual: POST /api/search with malicious input → expect 400} |

**Notes:** {optional — questions for author}

{Repeat for every finding.}

## Issue summary table

| ID | Sev | Class | Dimension | Location | Title |
|----|-----|-------|-----------|----------|-------|
| REV-001 | high | blocking | security | `src/api/search.ts:42` | SQL injection in search filter |

## Requirements alignment

| Criterion | Status | Evidence |
|-----------|--------|----------|
| {from Jira or ticketContext} | covered / partial / missing | {file:line or "not found"} |

**Out-of-scope changes detected:** {list or "None"}

**Missing from PR:** {list or "None"}

## Dimension coverage

| Dimension | Findings | Blocking | Notes |
|-----------|----------|----------|-------|
| Correctness | {n} | {n} | {headline} |
| Security | {n} | {n} | {headline} |
| Tests | {n} | {n} | {headline} |
| Performance | {n} | {n} | {headline} |
| Maintainability | {n} | {n} | {headline} |

### Dimension chart

\`\`\`mermaid
pie title Findings by dimension
  "Correctness" : {n}
  "Security" : {n}
  "Tests" : {n}
  "Performance" : {n}
  "Maintainability" : {n}
\`\`\`

## Files reviewed

| File | Change type | Risk | Notes |
|------|-------------|------|-------|
| `{path}` | added / modified / deleted | low / medium / high | {one line} |

## Commits

| SHA | Message |
|-----|---------|
| `{short}` | {subject} |

## Verification performed

| Check | Command | Result |
|-------|---------|--------|
| {e.g. Unit tests} | `{command}` | PASS / FAIL / NOT RUN |
| {e.g. Lint changed files} | `{command}` | PASS / FAIL / NOT RUN |

### Output

\`\`\`
{truncated output if tests were run}
\`\`\`

## Discovery notes

### Commands run

- `{command}` — {purpose}

### Diff acquisition

- {how diff was obtained — gh, git diff, API}

### Ambiguities

- {e.g. auth requirements unclear from ticket}

### Pre-existing issues (not attributed to this PR)

- `{path:line}` — {brief note}

## Known limitations

{Empty if none — e.g. could not run integration tests, no staging access}

## Posting status

{Only if postToPr: true — posted / failed / skipped (no token)}
```

---

### Format B — Website (`outputFormat: website`)

Build at `{agentDir}/pr-review-site/`.

#### Bootstrap (do not edit template)

```bash
cp -R Task/agents/frontend/. {agentDir}/pr-review-site/
cd {agentDir}/pr-review-site
npm install
```

**Never modify files under `Task/agents/frontend/`** — only files inside `pr-review-site/`.

#### Required site features

1. **Overview page** — metadata, verdict badge, summary, stats cards (blocking/non-blocking/advisory counts)
2. **Issue explorer** — filterable/sortable table by dimension, severity, classification
3. **Issue detail panels** — evidence snippet, suggested fix, verification steps per REV ID
4. **Charts** — severity distribution pie/bar; dimension coverage chart
5. **Requirements alignment** — table when Jira/ticket context available
6. **Files reviewed** — table with change type and risk badges
7. **Verification panel** — commands run and pass/fail status
8. **Copy-to-clipboard** for REV IDs and `path:line` citations
9. **Responsive UI** — clean layout, works on mobile through desktop

#### Data layer

Generate `{agentDir}/pr-review-site/data/pr-review.json` (or typed TS constants) from review results. Website must reflect **same completeness** as the markdown report.

#### Run locally

```bash
cd {agentDir}/pr-review-site
npm run dev
```

Open **http://localhost:3000**. Fix build/lint errors until `npm run build` passes.

---

## Step 6 — Optional: post review to PR

Only when `postToPr: true` and API token is available:

1. Post a summary comment with verdict, blocking list, and link to full report.
2. Optionally post inline comments on blocking findings at `path:line`.
3. Record posting status in the report.

If posting fails, print the formatted comment for manual paste.

---

## Execution rules

1. **Evidence over claims** — every finding cites `path:line` or a diff hunk; never invent bugs or test results.
2. **Read-only by default** — do not edit code unless `applyFixes: true`.
3. **Blocking must be justified** — tie each blocking classification to user impact or policy.
4. **Suggested fix required** — every REV item includes an actionable fix, not just criticism.
5. **Verification required** — every REV item includes at least one concrete verification step.
6. **Review the diff, not intentions** — judge what the code does, not what the PR description claims.
7. **Redact secrets** — report location and type; never paste secret values.
8. **Stack-aware** — apply conventions appropriate to the detected language/framework.
9. **Scope discipline** — do not demand refactors of untouched code; flag pre-existing issues separately.

After writing deliverable, proceed to [verify.md](./verify.md).
