---
name: advance-perf-optimizer
description: >-
  Performance Bottleneck Optimizer agent (Advanced A6) — finds a real performance
  bottleneck in a small service or script, profiles it, applies a minimal targeted fix,
  and delivers baseline/after measurements with behavior-preservation checks. Use when
  the user asks to optimize performance, find bottlenecks, profile slow code, or run
  /advance-perf-optimizer or A6 agent.
disable-model-invocation: true
---

# Advanced A6 — Performance Bottleneck Optimizer

Three-phase agent at `Task/agents/Advanced/A6/agent/`. Read all files in order:

1. `Task/agents/Advanced/A6/agent/planning.md` — MCQ: repo path, output format
2. `Task/agents/Advanced/A6/agent/execute.md` — baseline → profile → fix → re-measure → verify → write deliverable
3. `Task/agents/Advanced/A6/agent/verify.md` — validate before completion

Entry point: `Task/agents/Advanced/A6/agent/agent.md`

## Quick start

1. Run planning MCQ — collect `repoPath` and `outputFormat` (`markdown` | `website`)
2. Pick a small runnable service/script with a measurable bottleneck
3. Record baseline measurement (method + numbers)
4. Profile the hot path and identify the #1 hotspot
5. Apply one minimal, targeted code fix — no broad rewrite
6. Re-measure with the same harness and compute improvement delta
7. Run tests or equivalence checks proving behavior is unchanged
8. Write report to proof directory or build website dashboard
9. Run verify checklist
10. Tell user improvement stats, files changed, and report path

## Output locations

| Format | Path |
|--------|------|
| Markdown | `Task/agents/Advanced/A6/proof/performance-optimization-report.md` |
| Website | `Task/agents/Advanced/A6/agent/performance-site/` → http://localhost:3000 |

## Constraints

- **One bottleneck, one fix** per run
- **Same measurement method** for before and after
- **Minimal change** — no broad rewrites; ideally ≤ 3 files
- **Behavior preservation required** — tests must pass
- **Do not commit** unless user asks
- **Report in proof/** — never write the report into the analyzed repo
- Never edit `Task/agents/frontend/` — copy as template for website output only
