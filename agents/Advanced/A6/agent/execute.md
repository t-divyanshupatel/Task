# Phase 2 — Execute

Run after [planning.md](./planning.md) inputs are confirmed. Find a bottleneck, measure baseline, profile, apply a minimal fix, re-measure, verify behavior, and write the deliverable.

Implementation changes go **in `repoPath`**. Report writes go to `{proofDir}` and/or `{agentDir}/performance-site/` only.

---

## Input (from planning)

| Field | Required | Description |
|-------|----------|-------------|
| `repoPath` | Yes | Repository root |
| `outputFormat` | Yes | `markdown` or `website` |
| `outputPath` | Yes | `{proofDir}/performance-optimization-report.md` or `{agentDir}/performance-site/` |
| `scope` | No | Subdirectory, package, or script limit in monorepos |
| `targetHint` | No | User-specified slow path to prioritize |
| `benchmarkIterations` | No | Override default iteration count |
| `allowCodeChange` | No | `true` default — set `false` for analysis-only |
| `verifyCommands` | No | Override auto-detected test commands |

Record `startTime` (ISO 8601) if not already set.

---

## Step 1 — Repo reconnaissance and target selection

Establish context and pick **one** small, optimizable target:

1. Read `README.md`, build manifests, and entry points (`main`, `bin`, scripts, API routes).
2. Detect stack(s), runtime, and how to run services/scripts locally.
3. List candidate hot paths:
   - CLI scripts with loops or I/O
   - API handlers with N+1 queries or sync blocking
   - Data processing functions with repeated work
   - File/network-heavy utilities
   - Tight loops with redundant allocations or parsing
4. Prefer targets that are:
   - **Small** — single file or few files, runnable in isolation
   - **Measurable** — can be benchmarked with a script or command in &lt; 2 minutes
   - **Fixable minimally** — obvious hotspot without architecture change
5. If `targetHint` provided, start there; otherwise pick the best candidate and document why.

Record target metadata:

| Field | Example |
|-------|---------|
| `targetName` | `scripts/export-users.ts` or `UserService.findAll` |
| `targetPath` | `src/scripts/export-users.ts` |
| `targetType` | `script` / `service` / `handler` / `function` |
| `selectionRationale` | Repeated JSON parse inside loop; easy to benchmark |

---

## Step 2 — Baseline measurement

Measure **before** any code change. Document method precisely so after-measurement is comparable.

### Measurement rules

1. Use a **repeatable harness** — same input data, same machine context, same command.
2. Run **warm-up** then **timed iterations** (default 100; adjust for slow targets).
3. Capture at least **two metrics** where possible:
   - Wall-clock time (ms) — mean, median, p95
   - Throughput (ops/s or items/s) — if applicable
4. Record environment: OS, runtime version, CPU note if relevant, dataset size.
5. Save raw numbers — do not round aggressively; show enough precision for delta.

### Example harness patterns

```bash
# Node/TS script — time CLI
/usr/bin/time -l node dist/scripts/export-users.js --limit 1000

# Python — timeit
python -m timeit -n 100 -r 3 "import script; script.run()"

# Go benchmark
go test -bench=BenchmarkExportUsers -benchmem ./...

# Java — JMH or simple loop timing in a test
mvn test -Dtest=ExportUsersBenchmarkTest

# curl endpoint latency (warm then measure)
for i in $(seq 1 50); do curl -s -o /dev/null -w "%{time_total}\n" http://localhost:8080/api/users; done
```

### Baseline record format

| Column | Description |
|--------|-------------|
| Metric | e.g. `mean_latency_ms`, `p95_latency_ms`, `throughput_rps` |
| Value | Numeric result |
| Unit | ms, s, ops/s, MB/s |
| Iterations | Count |
| Input size | e.g. 1000 records, 5 MB file |
| Command | Exact command run |

---

## Step 3 — Profiling

Profile the target to identify **where** time is spent. Match profiler to stack:

| Stack | Profiling tools (try in order) |
|-------|-------------------------------|
| Node/TS | `node --prof`, `0x`, clinic.js (`clinic doctor`), `console.time` spans, Chrome DevTools |
| Python | `cProfile`, `py-spy`, `scalene`, `line_profiler` |
| Go | `pprof` (`go test -cpuprofile`), `trace` |
| Java | JFR, async-profiler, VisualVM, JMH |
| Shell | `time`, `strace -c`, `hyperfine` |

### Profiling output to capture

1. **Tool and command** used
2. **Top hotspots** — function/method names with % time or cumulative time
3. **Call path** — brief stack or sequence leading to hotspot
4. **Evidence** — `path:line` for the hot code
5. **Interpretation** — 2–4 sentences on what the profile proved (not speculation)

### Hotspot record format

| Rank | Function / location | % time or ms | Evidence | Notes |
|------|---------------------|--------------|----------|-------|
| 1 | `parseRow` @ export-users.ts:88 | 62% | profile + line | JSON.parse per row in loop |

Aim for a profile that **confirms** the suspected bottleneck with numbers.

---

## Step 4 — Explain the bottleneck

Write a short root-cause explanation (3–6 sentences):

- What work is being done redundantly or inefficiently
- Why it dominates runtime (with profile %)
- Why a small change can fix it (cache, batch, algorithm tweak, I/O reduction, etc.)
- What was **not** chosen (broad rewrite, new dependency, premature caching layer)

Mark `[NEEDS CLARIFICATION]` if profile data is inconclusive and you cannot justify the fix.

---

## Step 5 — Implement minimal fix

Skip if `allowCodeChange: false`.

### Fix selection rules

Pick **exactly one** targeted change:

1. Addresses the #1 profile hotspot
2. Touches **fewest files** (ideally 1–2)
3. Preserves public behavior and output semantics
4. Avoids new heavy dependencies
5. Avoids unrelated cleanup

Good fix examples:

- Move invariant computation outside a loop
- Replace repeated `JSON.parse` with a single parse or cached lookup
- Batch DB queries instead of N+1 in one function
- Use `StringBuilder` / buffer instead of repeated string concat in hot loop
- Read file once instead of per-request
- Add memoization for pure function called with same args in loop

Bad fix examples (defer):

- Rewrite entire module or service
- Switch frameworks or databases
- Add Redis/caching layer across the app
- Parallelize everything without profiling proof
- Micro-optimize cold paths

After editing, capture diff summary:

```bash
git -C "$repoPath" diff --stat 2>/dev/null || diff summary manually
git -C "$repoPath" diff 2>/dev/null | head -200
```

---

## Step 6 — After measurement

Re-run the **identical** benchmark harness from Step 2.

### Improvement record

| Metric | Baseline | After | Delta | Improvement % |
|--------|----------|-------|-------|---------------|
| mean_latency_ms | 842 | 126 | -716 | 85.0% faster |
| throughput_rps | 12 | 79 | +67 | 558% |

Compute improvement %:

```
improvement% = ((baseline - after) / baseline) × 100   # for latency (lower is better)
gain% = ((after - baseline) / baseline) × 100            # for throughput (higher is better)
```

If after measurement is **not better**, rollback (Step 8) and either try the next smallest fix or report failure honestly.

---

## Step 7 — Behavior verification

Prove the fix did **not** change correctness.

| Stack signal | Try (in order) |
|--------------|----------------|
| Node/TS | `npm test`, `npm run test -- --grep <target>`, snapshot tests |
| Python | `pytest`, targeted test file |
| Go | `go test ./...`, `go test -run TestExportUsers` |
| Java | `mvn test`, `./gradlew test` |
| Any | Golden-output diff: run script before/after on fixed input, compare stdout/hash |

### Verification record

| Check | Command | Exit code | Result | Notes |
|-------|---------|-----------|--------|-------|
| Unit tests | `npm test` | 0 | pass | 142 tests |
| Output equivalence | `diff baseline.out optimized.out` | 0 | pass | identical output |

If no tests exist, create a **minimal** equivalence check (e.g. compare output hash on a fixture) and note the limitation. Never skip this step.

---

## Step 8 — Rollback notes

For the implemented change, document:

| Item | Content |
|------|---------|
| Files to revert | List each path |
| Git command | `git checkout -- <files>` or `git revert` if committed |
| Manual undo | Steps if change isn't git-tracked |
| Verification after rollback | Re-run benchmark to confirm baseline restored |

---

## Step 9 — Write deliverable

Record `endTime` and compute `duration` (human-readable, e.g. `12m 30s`).

Branch on `outputFormat`:

---

### Format A — Markdown (`outputFormat: markdown`)

Write to `{proofDir}/performance-optimization-report.md`.

Use this exact structure:

```markdown
# Performance Optimization Report

## Metadata

| Field | Value |
|-------|-------|
| **Agent name** | perf-bottleneck-optimizer |
| **Started at** | {startTime ISO 8601} |
| **Completed at** | {endTime ISO 8601} |
| **Duration** | {duration} |
| **Repository** | {repoPath} |
| **Repo name** | {derived name} |
| **Stack detected** | {e.g. Node 20 + TypeScript} |
| **Target** | {targetName} |
| **Target path** | {targetPath} |
| **Improvement summary** | {e.g. 85% faster mean latency (842ms → 126ms)} |
| **Behavior verification** | {pass / fail / partial} |

## Executive Summary

{3–5 sentences: what was slow, what caused it, what changed, how much faster, tests status.}

## Target Selection

| Field | Value |
|-------|-------|
| **Chosen target** | {targetName} |
| **Type** | {script / service / handler / function} |
| **Path** | {targetPath} |
| **Why this target** | {rationale} |

### Candidates considered

| Candidate | Path | Why chosen / rejected |
|-----------|------|------------------------|
| export-users script | scripts/export-users.ts | **Selected** — tight loop, easy benchmark |
| image resize job | jobs/resize.ts | Rejected — requires image fixtures |

## Baseline Measurement

### Method

| Field | Value |
|-------|-------|
| **Harness** | {description} |
| **Command** | `{exact command}` |
| **Iterations** | {n} |
| **Input size** | {dataset description} |
| **Environment** | {OS, runtime version} |

### Results

| Metric | Value | Unit |
|--------|-------|------|
| mean_latency | {n} | ms |
| p95_latency | {n} | ms |
| throughput | {n} | ops/s |

### Raw output excerpt

\`\`\`
{benchmark stdout}
\`\`\`

## Profiling

### Approach

| Field | Value |
|-------|-------|
| **Tool** | {e.g. clinic.js, cProfile, pprof} |
| **Command** | `{exact command}` |
| **Duration / samples** | {n} |

### Hotspots

| Rank | Location | Time share | Evidence | Interpretation |
|------|----------|------------|----------|----------------|
| 1 | parseRow @ export-users.ts:88 | 62% | profile + line | Dominates runtime |

### Profile visualization

\`\`\`mermaid
xychart-beta
  title "Top hotspots (% CPU time)"
  x-axis ["parseRow", "writeFile", "fetchUsers", "other"]
  y-axis "Time %" 0 --> 70
  bar [62, 18, 12, 8]
\`\`\`

## Bottleneck Explanation

{3–6 sentences with root cause, backed by profile data and path:line citations.}

## Code Change

### Summary

| Field | Value |
|-------|-------|
| **Fix type** | {e.g. hoist invariant, batch query, cache parse} |
| **Files changed** | {count} |
| **Lines changed** | {approx} |
| **Broad rewrite?** | No |

### Files modified

| File | Change summary |
|------|----------------|
| scripts/export-users.ts | Parse JSON once per chunk instead of per row |

### Diff summary

\`\`\`
{git diff --stat or equivalent}
\`\`\`

## After Measurement

### Method

{Same table as baseline — must match exactly.}

### Results comparison

| Metric | Baseline | After | Delta | Improvement |
|--------|----------|-------|-------|-------------|
| mean_latency_ms | 842 | 126 | -716 | **85.0% faster** |
| p95_latency_ms | 1102 | 158 | -944 | 85.7% faster |
| throughput_rps | 12 | 79 | +67 | 558% gain |

### Improvement chart

\`\`\`mermaid
xychart-beta
  title "Before vs After (mean latency ms)"
  x-axis ["Baseline", "After fix"]
  y-axis "ms" 0 --> 900
  bar [842, 126]
\`\`\`

## Behavior Verification

| Check | Command | Exit code | Result | Notes |
|-------|---------|-----------|--------|-------|
| Unit tests | npm test | 0 | pass | all green |
| Output equivalence | diff out files | 0 | pass | identical CSV |

### Output excerpt

\`\`\`
{test stdout}
\`\`\`

## Rollback Notes

### Quick rollback

\`\`\`bash
git checkout -- scripts/export-users.ts
\`\`\`

### Files affected

- `scripts/export-users.ts` — revert parse-hoist change

### Post-rollback verification

\`\`\`bash
{benchmark command}  # expect baseline numbers restored
npm test
\`\`\`

## Discovery Notes

### Files examined
- `path/to/file` — {why it mattered}

### Excluded from scan
- `node_modules/` — third-party

### Additional bottlenecks (backlog)
| Rank | Location | Est. impact | Why deferred |
|------|----------|-------------|--------------|
| 2 | writeFile @ export-users.ts:120 | 18% | Out of scope — one fix per run |

### Ambiguities & gaps
- {items that could not be verified}
```

---

### Format B — Website (`outputFormat: website`)

Build at `{agentDir}/performance-site/`.

#### Bootstrap (do not edit template)

```bash
cp -R Task/agents/frontend/. {agentDir}/performance-site/
cd {agentDir}/performance-site
npm install
```

**Never modify files under `Task/agents/frontend/`** — only files inside `performance-site/`.

#### Required site features

1. **Overview** — metadata, executive summary, improvement stats cards (baseline vs after, % faster)
2. **Target panel** — chosen service/script, path, selection rationale
3. **Baseline measurement** — method table, numeric results, command details
4. **Profiling section** — hotspot table or bar chart, tool/command info
5. **Bottleneck explanation** — root-cause narrative with code citations
6. **Code change panel** — files changed, diff summary, "minimal fix" badge
7. **After measurement** — side-by-side or bar chart comparison (before vs after)
8. **Behavior verification** — pass/fail badges, test output excerpts
9. **Rollback section** — copy-to-clipboard rollback commands
10. **Responsive UI** — clean layout, readable charts, works mobile through desktop

#### Data layer

Generate `{agentDir}/performance-site/data/performance-report.json` from analysis results. Website must reflect **same completeness** as the markdown report. Use real measured data only — no placeholder numbers.

#### Run locally

```bash
cd {agentDir}/performance-site
npm run dev
```

Open **http://localhost:3000**. Fix build/lint errors until `npm run build` passes.

---

## Execution rules

1. **Evidence over guessing** — every hotspot and metric cites a command, profile, or `path:line`.
2. **One fix only** — optimize exactly one bottleneck per run.
3. **Same benchmark method** — before and after must be directly comparable.
4. **Verify behavior** — run tests or equivalence checks after the fix.
5. **Rollback always documented** — even if fix was skipped or reverted.
6. **Report in proof directory** — markdown goes to `{proofDir}/`; never write the primary report into the analyzed repo.
7. **Template unchanged** — never edit `Task/agents/frontend/`; only the copied site directory.
8. **Single deliverable** — either markdown **or** website, not both unless explicitly requested.

After writing deliverable, proceed to [verify.md](./verify.md).
