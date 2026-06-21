---
name: intermediate-repo-e2e-flow-tracer
description: >-
  Repo E2E Flow Tracer agent (Intermediate I2) — traces one endpoint, event, or
  cron job end-to-end from entry point through major files and functions to final
  DB, API, or queue side effects. Delivers a markdown report or Next.js flow
  explorer with sequence diagrams and call-path tables. Use when the user asks to
  trace a flow, endpoint, event handler, cron job, or sequence diagram for a
  request path through the codebase.
disable-model-invocation: true
---

# Repo E2E Flow Tracer (Intermediate I2)

Three-phase agent at `Task/agents/Intermediate/I2/agent/`. Read all files in order:

1. `Task/agents/Intermediate/I2/agent/planning.md` — MCQ: repo path, flow target, output format
2. `Task/agents/Intermediate/I2/agent/execute.md` — recon, trace path, write deliverable
3. `Task/agents/Intermediate/I2/agent/verify.md` — validate before completion

Entry point: `Task/agents/Intermediate/I2/agent/agent.md`

## Quick start

1. Run planning MCQ — collect `repoPath`, `flowTarget`, and `outputFormat` (`markdown` | `website`)
2. Execute trace (read-only on target repo)
3. Write deliverable to I2 output paths
4. Run verify checklist
5. Tell user output path and headline stats

## Task

Trace **one** endpoint, event, or cron job end-to-end. Show:

- Entry point
- Step-by-step file and function path
- External dependencies
- DB, API, or queue side effects
- Sequence diagram
- Known uncertainty

## Output locations

| Format | Path |
|--------|------|
| Markdown | `Task/agents/Intermediate/I2/proof/e2e-flow-trace-report.md` |
| Website | `Task/agents/Intermediate/I2/agent/e2e-flow-site/` → http://localhost:3000 |

## Constraints

- Read-only on analyzed repo — no source edits
- Never edit `Task/agents/frontend/` — copy as template for website output only
- Single flow per run unless user explicitly requests a chained flow
- Single deliverable per run unless user requests both

## When to use

- "Trace this endpoint end-to-end"
- "Show the call path from controller to database"
- "Map a cron job to its side effects"
- "Draw a sequence diagram for this API flow"
- "What happens when this Kafka event is consumed?"
