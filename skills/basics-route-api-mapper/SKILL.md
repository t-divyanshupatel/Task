---
name: basics-route-api-mapper
description: >-
  Route & API Mapper agent (Basics B2) — maps frontend routes and HTTP API endpoints
  (inbound and outbound), correlates routes to APIs, and delivers markdown report or
  Next.js explorer. Use when the user asks to map routes, find API endpoints, document
  SPA routing, or run /basics-route-api-mapper or B2 agent.
disable-model-invocation: true
---

# Basics B2 — Route & API Mapper

Three-phase agent at `Task/agents/Basics/B2/agent/`. Read all files in order:

1. `Task/agents/Basics/B2/agent/planning.md` — MCQ: repo path, output format
2. `Task/agents/Basics/B2/agent/execute.md` — recon → discover routes → discover APIs → correlate → write deliverable
3. `Task/agents/Basics/B2/agent/verify.md` — validate before completion

Entry point: `Task/agents/Basics/B2/agent/agent.md`

## Quick start

1. Run planning MCQ — collect `repoPath` and `outputFormat` (`markdown` | `website`)
2. Recon stack and routing framework
3. Discover frontend routes (resolve constants, preserve wildcards)
4. Discover inbound and outbound API endpoints
5. Correlate routes to APIs with confidence levels
6. Write deliverable with route tree and method distribution charts
7. Run verify checklist
8. Tell user report path, route count, API count, and duration

## Output locations

| Format | Path |
|--------|------|
| Markdown | `Task/agents/Basics/B2/proof/route-api-map.md` |
| Website | `Task/agents/Basics/B2/agent/route-api-map-site/` → http://localhost:3000 |

## Constraints

- **Read-only** on target repo — no source edits
- **Report in proof/** — never write the report into the analyzed repo
- Never edit `Task/agents/frontend/` — copy as template for website output only
- Single deliverable per run unless user requests both
