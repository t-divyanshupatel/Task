---
name: advance-pr-review
description: >-
  PR Review agent (Advanced A5) — structured pull request review across correctness,
  security, tests, performance, and maintainability with severity, blocking classification,
  suggested fixes, and merge verdict. Use when the user asks to review a PR, agent-generated
  diff, security pass on a branch, or run /advance-pr-review or A5 agent.
disable-model-invocation: true
---

# Advanced A5 — PR Review

Three-phase agent at `Task/agents/Advanced/A5/agent/`. Read all files in order:

1. `Task/agents/Advanced/A5/agent/planning.md` — MCQ: review target, repo path, output format
2. `Task/agents/Advanced/A5/agent/execute.md` — acquire diff → review → verdict → write deliverable
3. `Task/agents/Advanced/A5/agent/verify.md` — validate before completion

Entry point: `Task/agents/Advanced/A5/agent/agent.md`

## Quick start

1. Run planning MCQ — collect review target (PR URL, branch, or diff), `repoPath`, and `outputFormat` (`markdown` | `website`)
2. Acquire full diff (`git diff`, `gh pr diff`)
3. Review each hunk against five dimensions (correctness, security, tests, performance, maintainability)
4. Assign issue IDs with severity and blocking classification
5. Write verdict (APPROVE / REQUEST CHANGES / COMMENT) and report
6. Run verify checklist
7. Tell user report path, verdict, and blocking issue count

## Output locations

| Format | Path |
|--------|------|
| Markdown | `Task/agents/Advanced/A5/proof/pr-review-report.md` |
| Website | `Task/agents/Advanced/A5/agent/pr-review-site/` → http://localhost:3000 |

## Constraints

- **Read-only by default** — no code edits unless user asks to apply fixes
- **Redact secrets** — report location only, never paste values
- Evidence from diff only — no invented issues
- **Report in proof/** — never write the report into the analyzed repo
- Use `gh pr view` / `gh pr diff` when PR URL provided
