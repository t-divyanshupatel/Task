---
name: intermediate-seeded-bug-diagnosis
description: >-
  Seeded Bug Diagnosis agent (Intermediate I6) — reproduces a bug in an unfamiliar
  repo, traces root cause with file paths, applies a minimal fix, runs verification,
  and delivers a markdown report or Next.js diagnosis explorer. Use when the user
  asks to diagnose a seeded bug, reproduce a failure, find root cause, fix a bug
  with verification, or compare agent vs manual verification.
disable-model-invocation: true
---

# Seeded Bug Diagnosis (Intermediate I6)

Three-phase agent at `Task/agents/Intermediate/I6/agent/`. Read all files in order:

1. `Task/agents/Intermediate/I6/agent/planning.md` — MCQ: repo path, symptom, output format
2. `Task/agents/Intermediate/I6/agent/execute.md` — reproduce, root cause, fix, verify, write deliverable
3. `Task/agents/Intermediate/I6/agent/verify.md` — validate before completion

Entry point: `Task/agents/Intermediate/I6/agent/agent.md`

## Quick start

1. Run planning MCQ — collect `repoPath`, `symptom` (`user-specified` | `discover`), and `outputFormat` (`markdown` | `website`)
2. Reproduce the bug with real command output (before fixing)
3. Trace root cause to `path:line`, apply minimal fix in `repoPath`
4. Rerun verification command; capture before vs after
5. Write deliverable to proof directory or build website
6. Run verify checklist
7. Tell user report path, root cause file, fix summary, verification result

## Task

Diagnose a seeded bug in an unfamiliar repo. Show:

- Reproduction steps (with before-fix output)
- Root cause with file paths
- Minimal fix (with diff)
- Verification command and result
- What the agent suggested vs what was manually verified

## Output locations

| Format | Path |
|--------|------|
| Markdown | `Task/agents/Intermediate/I6/proof/bug-diagnosis-report.md` |
| Website | `Task/agents/Intermediate/I6/agent/bug-diagnosis-site/` → http://localhost:3000 |

## Constraints

- **May edit target repo** for the minimal fix — no commit/push unless user asks
- **Report in proof/** — never write the report into the analyzed repo
- Never edit `Task/agents/frontend/` — copy as template for website output only
- Reproduce before fixing — no code changes until bug is reproduced or blocked
- Single deliverable per run unless user requests both

## When to use

- "Diagnose the seeded bug in this repo"
- "Reproduce the failure and find root cause"
- "Fix the bug and show verification"
- "What did the agent verify vs what needs manual review?"
