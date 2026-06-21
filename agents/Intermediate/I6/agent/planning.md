# Phase 1 — Planning

Run this phase **before any repo analysis or code changes**. Collect required inputs via MCQ. Do not assume defaults for required fields.

---

## User prompts (required — MCQ)

Use the **AskQuestion** tool (or equivalent MCQ UI) so the user picks from fixed options.

### Question 1 — Repository path

**Prompt:** "Which repository contains the seeded bug?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `workspace` | Use the current workspace root |
| **B** | `custom` | User provides absolute or relative path in follow-up or "Other" |

Validate that `repoPath` exists and is a directory. If invalid, ask once more. Do not proceed without a valid path.

### Question 2 — Symptom / bug hint

**Prompt:** "What symptom or hint should I use to find the bug?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `user-specified` | User describes failing test, wrong output, error message, or broken behavior in follow-up or "Other" |
| **B** | `discover` | Agent searches repo for seeded-bug signals (`BUG.md`, failing tests, `SEEDED BUG`, README known issues) and states inferred symptom before reproducing |

### Question 3 — Output format

**Prompt:** "How should I deliver the bug diagnosis report?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `markdown` | Write `bug-diagnosis-report.md` in `proof/` with tables, charts, diff, before/after output |
| **B** | `website` | Build interactive Next.js site at `bug-diagnosis-site/` using `Task/agents/frontend/` as template (do not edit the template folder) |

Do not start execution until all three answers are confirmed.

---

## Optional inputs (ask only if relevant)

| Field | Default | When to ask |
|-------|---------|-------------|
| `reproHint` | none | Ask if user knows exact command to reproduce (e.g. `npm test`, `curl POST /convert`) |
| `createBranch` | `false` | Ask if user wants a dedicated branch before applying fix |
| `scope` | full repo | Ask if monorepo — offer subdirectory scope |

---

## Output paths

All report deliverables are written under I6, **not** inside the analyzed repo (except the bug fix itself):

| Constant | Value |
|----------|-------|
| `agentDir` | `Task/agents/Intermediate/I6/agent/` |
| `proofDir` | `Task/agents/Intermediate/I6/proof/` |

| `outputFormat` | Deliverable path |
|----------------|------------------|
| `markdown` | `{proofDir}/bug-diagnosis-report.md` |
| `website` | `{agentDir}/bug-diagnosis-site/` |

The **minimal fix** is applied in `repoPath` (uncommitted unless user asks to commit).

---

## Markdown deliverable preview

When user chooses **markdown**, the report will include:

- Metadata table (agent name, timestamps, duration, repo, stack, symptom, root cause file, fix status)
- Summary paragraph
- Expected vs actual behavior table
- Numbered reproduction steps with before-fix command output
- Root cause section with `path:line` citations, defective code snippet, call path table
- Minimal fix section with rationale, files changed, `git diff`, fixed code snippet
- Verification section with command, exit code, after-fix output, before vs after table
- Agent suggested vs manually verified comparison table
- Risk assessment table
- Discovery notes (files examined, secondary issues, ambiguities)
- Optional: status charts (fix status, risk ratings) as markdown tables

---

## Website deliverable preview

When user chooses **website**:

1. **Copy** `Task/agents/frontend/` → `{agentDir}/bug-diagnosis-site/` (never modify the source template)
2. Replace default page content with bug diagnosis explorer UI
3. Embed diagnosis data as typed JSON/TS constants
4. Run `npm install && npm run dev` — serve on **http://localhost:3000**
5. Site must include: metadata overview, reproduction steps timeline, root cause panel with file citations, diff viewer, before/after output comparison, verification result cards, agent vs manual verification table, risk assessment badges, responsive layout with charts/stats cards

---

## Planning checklist

Before proceeding to [execute.md](./execute.md):

- [ ] `repoPath` confirmed and validated
- [ ] `symptom` confirmed (`user-specified` or `discover` acknowledged)
- [ ] `outputFormat` confirmed (`markdown` or `website`)
- [ ] `outputPath` determined from table above
- [ ] `startTime` recorded (ISO 8601)
- [ ] User told which deliverable type will be produced and where it will be written
