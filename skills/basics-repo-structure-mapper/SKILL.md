---
name: basics-repo-structure-mapper
description: >-
  Repo Structure Mapper agent (Basics B1) — discovers classes, interfaces, services,
  controllers, models, repositories, jobs, consumers, configs, and utilities with
  path:line citations and layer diagrams. Delivers markdown report or Next.js explorer.
  Use when the user asks to map repo structure, inventory symbols, find services or
  controllers, or run /basics-repo-structure-mapper or B1 agent.
disable-model-invocation: true
---

# Basics B1 — Repo Structure Mapper

Three-phase agent at `Task/agents/Basics/B1/agent/`. Read all files in order:

1. `Task/agents/Basics/B1/agent/planning.md` — MCQ: repo path, output format
2. `Task/agents/Basics/B1/agent/execute.md` — recon → discover symbols → map layers → write deliverable
3. `Task/agents/Basics/B1/agent/verify.md` — validate before completion

Entry point: `Task/agents/Basics/B1/agent/agent.md`

## Quick start

1. Run planning MCQ — collect `repoPath` and `outputFormat` (`markdown` | `website`)
2. Recon repo stack and monorepo layout
3. Discover symbols across ten categories with `path:line` citations
4. Map layer relationships (controller → service → repository)
5. Write deliverable with Mermaid diagrams and tables
6. Run verify checklist
7. Tell user report path, symbol counts, and duration

## Output locations

| Format | Path |
|--------|------|
| Markdown | `Task/agents/Basics/B1/proof/repo-structure-map.md` |
| Website | `Task/agents/Basics/B1/agent/repo-structure-map-site/` → http://localhost:3000 |

## Constraints

- **Read-only** on target repo — no source edits
- **Report in proof/** — never write the report into the analyzed repo
- Never edit `Task/agents/frontend/` — copy as template for website output only
- Single deliverable per run unless user requests both
