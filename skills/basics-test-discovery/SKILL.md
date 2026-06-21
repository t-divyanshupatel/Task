---
name: basics-test-discovery
description: >-
  Test Discovery agent (Basics B3) — detects test framework and config, finds relevant
  test files, runs exact test commands, captures real output, and interprets failures.
  Delivers markdown report or Next.js dashboard. Use when the user asks to find test
  framework, how to run tests, test commands, test results, or run /basics-test-discovery
  or B3 agent.
disable-model-invocation: true
---

# Basics B3 — Repo Test Discovery

Three-phase agent at `Task/agents/Basics/B3/agent/`. Read all files in order:

1. `Task/agents/Basics/B3/agent/planning.md` — MCQ: repo path, output format
2. `Task/agents/Basics/B3/agent/execute.md` — recon → detect framework → find tests → run commands → write deliverable
3. `Task/agents/Basics/B3/agent/verify.md` — validate before completion

Entry point: `Task/agents/Basics/B3/agent/agent.md`

## Quick start

1. Run planning MCQ — collect `repoPath` and `outputFormat` (`markdown` | `website`)
2. Recon repo stack and CI config
3. Detect test framework(s) and config files
4. Find relevant test files (unit, integration, e2e)
5. Derive exact test commands from CI, scripts, or build files
6. Run primary command and capture real terminal output
7. Interpret failures or document blockers
8. Write deliverable to proof directory or build website dashboard
9. Run verify checklist
10. Tell user report path, framework, pass/fail headline, and duration

## Output locations

| Format | Path |
|--------|------|
| Markdown | `Task/agents/Basics/B3/proof/test-discovery-report.md` |
| Website | `Task/agents/Basics/B3/agent/test-discovery-site/` → http://localhost:3000 |

## Constraints

- **Read-only on target repo** — never edit source or test files in `repoPath`
- **Run real commands** — paste actual output; do not fabricate results
- **Report in proof/** — never write the report into the analyzed repo
- Never edit `Task/agents/frontend/` — copy as template for website output only
- Dependency install is allowed to enable test execution
- Single deliverable per run unless user requests both
