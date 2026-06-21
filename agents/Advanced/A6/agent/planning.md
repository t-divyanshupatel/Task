# Phase 1 — Planning

Run this phase **before any profiling, benchmarking, or code changes**. Collect required inputs via MCQ. Do not assume defaults for required fields.

---

## User prompts (required — MCQ)

Use the **AskQuestion** tool (or equivalent MCQ UI) so the user picks from fixed options.

### Question 1 — Repository path

**Prompt:** "Which repository should I analyze for a performance bottleneck?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `workspace` | Use the current workspace root |
| **B** | `custom` | User provides absolute or relative path in follow-up or "Other" |

Validate that `repoPath` exists and is a directory. If invalid, ask once more. Do not proceed without a valid path.

### Question 2 — Output format

**Prompt:** "How should I deliver the performance optimization report?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `markdown` | Write `performance-optimization-report.md` in `proof/` with tables, Mermaid charts, before/after graphs, and measurement data |
| **B** | `website` | Build interactive Next.js dashboard at `performance-site/` using `Task/agents/frontend/` as template (do not edit the template folder) |

Do not start execution until both answers are confirmed.

---

## Optional inputs (ask only if relevant)

| Field | Default | When to ask |
|-------|---------|-------------|
| `scope` | auto-detect | Ask if monorepo — offer subdirectory, package, or specific script/service |
| `targetHint` | auto-detect | Ask if user already knows the slow script, endpoint, or function |
| `benchmarkIterations` | `100` or auto | Ask if user wants a specific iteration count for micro-benchmarks |
| `allowCodeChange` | `true` | Ask if user wants analysis-only (skip fix implementation) |
| `verifyCommands` | auto-detect | Ask if user has custom test/benchmark commands |

---

## Output paths

All report deliverables are written under A6, **not** as the primary report inside the analyzed repo:

| Constant | Value |
|----------|-------|
| `agentDir` | `Task/agents/Advanced/A6/agent/` |
| `proofDir` | `Task/agents/Advanced/A6/proof/` |

| `outputFormat` | Deliverable path |
|----------------|------------------|
| `markdown` | `{proofDir}/performance-optimization-report.md` |
| `website` | `{agentDir}/performance-site/` |

Record `startTime` (ISO 8601) as soon as both MCQ answers are confirmed.

---

## Markdown deliverable preview

When user chooses **markdown**, the report will include:

- Metadata table (agent name, timestamps, duration, repo, target, improvement summary)
- Executive summary
- **Target selection** — which service/script/function was chosen and why
- **Baseline measurement** — method, environment, iterations, raw numbers, latency/throughput table
- **Profiling** — tool used, commands, flame graph or hotspot table, profile interpretation
- **Bottleneck explanation** — short root-cause narrative with `path:line` citations
- **Code change** — files changed, diff summary, why this fix is minimal
- **After measurement** — same method as baseline with improvement delta and Mermaid bar chart
- **Behavior verification** — tests/checks run, pass/fail, output excerpts
- **Rollback notes** — how to undo the change safely
- Discovery notes (candidates considered, exclusions, ambiguities)

---

## Website deliverable preview

When user chooses **website**:

1. **Copy** `Task/agents/frontend/` → `{agentDir}/performance-site/` (never modify the source template)
2. Replace default page content with performance optimization dashboard UI
3. Embed analysis data as typed JSON/TS constants or `data/performance-report.json`
4. Run `npm install && npm run dev` — serve on **http://localhost:3000**
5. Site must include:
   - Metadata overview and executive summary
   - Before/after comparison chart (bar or line chart)
   - Baseline and after measurement tables with method details
   - Profiling hotspot visualization or ranked hotspot table
   - Bottleneck explanation panel with code citations
   - Code change section (files changed, diff summary)
   - Improvement stats cards (delta %, absolute time saved, throughput gain)
   - Behavior verification panel (pass/fail badges, test output)
   - Rollback instructions section
   - Responsive layout with good visual hierarchy

---

## Planning checklist

Before proceeding to [execute.md](./execute.md):

- [ ] `repoPath` confirmed and validated
- [ ] `outputFormat` confirmed (`markdown` or `website`)
- [ ] `outputPath` determined from table above
- [ ] `startTime` recorded (ISO 8601)
- [ ] Optional inputs resolved or defaults applied
- [ ] User told which deliverable type will be produced and where it will be written
