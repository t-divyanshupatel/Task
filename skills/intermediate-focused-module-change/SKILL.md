---
name: intermediate-focused-module-change
description: >-
  Focused Module Change agent (Intermediate I3) — makes a small, focused change in an
  unfamiliar module, keeps the diff minimal, adds or updates a relevant test, and delivers
  diff, files changed, rationale, test command and result, and risk assessment as markdown
  or Next.js dashboard. Use when the user asks for a minimal diff in an unfamiliar module,
  focused code change with test, or run /intermediate-focused-module-change or I3 agent.
disable-model-invocation: true
---

# Intermediate I3 — Focused Module Change

Three-phase agent at `Task/agents/Intermediate/I3/agent/`. Read all files in order:

1. `Task/agents/Intermediate/I3/agent/planning.md` — MCQ: repo path, change scope, output format
2. `Task/agents/Intermediate/I3/agent/execute.md` — recon, pick module, test, implement, verify, write deliverable
3. `Task/agents/Intermediate/I3/agent/verify.md` — validate before completion

Entry point: `Task/agents/Intermediate/I3/agent/agent.md`

## Quick start

1. Run planning MCQ — collect `repoPath`, `changeScope` (`user-specified` | `agent-selects`), and `outputFormat` (`markdown` | `website`)
2. Recon repo and pick an **unfamiliar** module with clear boundaries
3. Define a minimal change with acceptance criteria
4. Add or update a relevant test; run it before/after when practical
5. Implement the smallest correct production diff
6. Run narrow test command; capture real output
7. Write deliverable to proof directory or build website
8. Run verify checklist
9. Tell user report path, module changed, diff stats, test result, and manual review items

## Output locations

| Format | Path |
|--------|------|
| Markdown | `Task/agents/Intermediate/I3/proof/focused-module-change-report.md` |
| Website | `Task/agents/Intermediate/I3/agent/focused-change-site/` → http://localhost:3000 |

## Constraints

- **May edit target repo** for the minimal change and test — no commit/push unless user asks
- **Report in proof/** — never write the report into the analyzed repo
- **Test required** — every run adds or updates at least one relevant test
- **Minimal diff** — no drive-by refactors or formatting sweeps
- Never edit `Task/agents/frontend/` — copy as template for website output only
- Single deliverable per run unless user requests both
