---
name: advance-repo-modernizer
description: >-
  Repo Modernizer agent (Advanced A4) — analyzes modernization opportunities across
  dependencies, security, CI, code quality, and architecture; prioritizes findings;
  implements exactly one highest-value first step with verification and rollback notes.
  Use when the user asks for technical debt assessment, modernization plan, dependency
  upgrade planning, or run /advance-repo-modernizer or A4 agent.
disable-model-invocation: true
---

# Advanced A4 — Repo Modernizer

Three-phase agent at `Task/agents/Advanced/A4/agent/`. Read all files in order:

1. `Task/agents/Advanced/A4/agent/planning.md` — MCQ: repo path, output format
2. `Task/agents/Advanced/A4/agent/execute.md` — recon → scan → rank → implement one step → verify → write deliverable
3. `Task/agents/Advanced/A4/agent/verify.md` — validate before completion

Entry point: `Task/agents/Advanced/A4/agent/agent.md`

## Quick start

1. Run planning MCQ — collect `repoPath` and `outputFormat` (`markdown` | `website`)
2. Recon stack, CI, and dependency files
3. Scan for modernization opportunities with evidence citations
4. Score and rank findings (value × risk)
5. Implement **#1 only** — minimal reversible change
6. Verify (build, test, or lint) and document rollback
7. Write deliverable with backlog for remaining items
8. Run verify checklist
9. Tell user report path, first step summary, and verification result

## Output locations

| Format | Path |
|--------|------|
| Markdown | `Task/agents/Advanced/A4/proof/modernization-report.md` |
| Website | `Task/agents/Advanced/A4/agent/modernization-site/` → http://localhost:3000 |

## Constraints

- **One implementation per run** — remaining items go to backlog
- **Surgical, reversible** changes only
- **Do not commit** unless user asks
- Every finding must cite file/config — no invented CVEs
- **Report in proof/** — never write the report into the analyzed repo
- Never edit `Task/agents/frontend/` — copy as template for website output only
