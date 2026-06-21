---
name: intermediate-repo-er-diagram
description: >-
  Repo ER Diagram agent (Intermediate I1) — discovers database tables and
  persistent entities, documents PKs/FKs/inferred relationships with source
  citations, and delivers a markdown report or Next.js ER explorer. Use when the
  user asks for an ER diagram, entity-relationship map, database schema diagram,
  table inventory, or Mermaid erDiagram from a repository.
disable-model-invocation: true
---

# Repo ER Diagram (Intermediate I1)

Three-phase agent at `Task/agents/Intermediate/I1/agent/`. Read all files in order:

1. `Task/agents/Intermediate/I1/agent/planning.md` — MCQ: repo path + output format
2. `Task/agents/Intermediate/I1/agent/execute.md` — discover schema, write deliverable
3. `Task/agents/Intermediate/I1/agent/verify.md` — validate before completion

Entry point: `Task/agents/Intermediate/I1/agent/agent.md`

## Quick start

1. Run planning MCQ — collect `repoPath` and `outputFormat` (`markdown` | `website`)
2. Execute discovery (read-only on target repo)
3. Write deliverable to agent directory
4. Run verify checklist
5. Tell user output path and headline stats

## Task

Build an ER diagram for all tables and entities in the repo. Use **only the repo as source**. Cite source file for every table, entity, and relationship. Deliver:

- List of tables and entities
- Primary keys
- Foreign keys or inferred relationships
- Source file path per claim
- Valid Mermaid ER diagram

## Output locations

| Format | Path |
|--------|------|
| Markdown | `Task/agents/Intermediate/I1/agent/er-diagram-report.md` |
| Website | `Task/agents/Intermediate/I1/agent/er-diagram-site/` → http://localhost:3000 |

## Constraints

- Read-only on analyzed repo — no source edits
- Never edit `Task/agents/frontend/` — copy as template for website output only
- Single deliverable per run unless user requests both

## When to use

- "Build an ER diagram for this repo"
- "Map database tables and relationships"
- "Show me the schema with Mermaid erDiagram"
- "Document PKs and FKs with source citations"
