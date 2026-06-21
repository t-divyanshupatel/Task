# Phase 1 — Planning

Run this phase **before any repo analysis or code changes**. Collect required inputs via MCQ. Do not assume defaults for required fields.

---

## User prompts (required — MCQ)

Use the **AskQuestion** tool (or equivalent MCQ UI) so the user picks from fixed options.

### Question 1 — Repository path

**Prompt:** "Which repository should I make a focused change in?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `workspace` | Use the current workspace root |
| **B** | `custom` | User provides absolute or relative path in follow-up or "Other" |

Validate that `repoPath` exists and is a directory. If invalid, ask once more. Do not proceed without a valid path.

### Question 2 — Change scope

**Prompt:** "What kind of change should I make?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `user-specified` | User describes the change in follow-up or "Other" — e.g. fix edge case, add guard, rename constant, handle null input |
| **B** | `agent-selects` | Agent picks an unfamiliar module and a small, safe, independently valuable change (bug fix, edge-case guard, missing validation, or test gap) |

If `user-specified`, capture the exact change description before execution. If `agent-selects`, state the chosen module and proposed change in one sentence before implementing.

### Question 3 — Output format

**Prompt:** "How should I deliver the focused module change report?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `markdown` | Write `focused-module-change-report.md` in `proof/` with tables, Mermaid diagrams, diff, test output, and risk charts |
| **B** | `website` | Build interactive Next.js site at `focused-change-site/` using `Task/agents/frontend/` as template (do not edit the template folder) |

Do not start execution until all three answers are confirmed.

---

## Optional inputs (ask only if relevant)

| Field | Default | When to ask |
|-------|---------|-------------|
| `changeHint` | none | Ask if user knows which module or file to touch |
| `createBranch` | `false` | Ask if user wants a dedicated branch before applying the change |
| `scope` | full repo | Ask if monorepo — offer subdirectory or package limit |
| `allowNewDependency` | `false` | Ask if adding a dependency is acceptable (default: no) |

---

## Output paths

All report deliverables are written under I3, **not** inside the analyzed repo (except the code change and test themselves):

| Constant | Value |
|----------|-------|
| `agentDir` | `Task/agents/Intermediate/I3/agent/` |
| `proofDir` | `Task/agents/Intermediate/I3/proof/` |

| `outputFormat` | Deliverable path |
|----------------|------------------|
| `markdown` | `{proofDir}/focused-module-change-report.md` |
| `website` | `{agentDir}/focused-change-site/` |

The **minimal change and test** are applied in `repoPath` (uncommitted unless user asks to commit).

Record `startTime` (ISO 8601) as soon as all MCQ answers are confirmed.

---

## Markdown deliverable preview

When user chooses **markdown**, the report will include:

- Metadata table (agent name, timestamps, duration, repo, stack, module, branch, change summary, test result)
- Executive summary
- **Module selection** — which module was chosen, why it is unfamiliar, and module map (Mermaid flowchart or table)
- **Change definition** — what changed, why now, and acceptance criteria
- **Files changed** — table with path, role, and one-line rationale per file
- **Why these files** — narrative linking each file to the change scope
- **Diff or branch** — `git diff` or branch name with stats (insertions/deletions/file count)
- **Test** — added or updated test description, command, exit code, and output excerpt
- **Before vs after** — behavior or assertion comparison table
- **Risk assessment** — dimension ratings and overall risk
- **Agent suggested vs manually verified** — comparison table (manual columns = `pending`)
- **Discovery notes** — files examined, alternatives considered, ambiguities
- **Rollback notes** — how to undo the change safely
- Optional: Mermaid sequence or bar chart for diff stats, test status pie chart

---

## Website deliverable preview

When user chooses **website**:

1. **Copy** `Task/agents/frontend/` → `{agentDir}/focused-change-site/` (never modify the source template)
2. Replace default page content with focused module change dashboard UI
3. Embed change data as typed JSON/TS constants or `data/focused-change-report.json`
4. Run `npm install && npm run dev` — serve on **http://localhost:3000**
5. Site must include:
   - Metadata overview and executive summary
   - Module selection panel with unfamiliar-module rationale
   - Files changed table with "why this file" tooltips or side panel
   - Diff viewer (syntax-highlighted) or branch badge
   - Test command panel with pass/fail badge and output excerpt
   - Before vs after comparison cards
   - Risk assessment badges (blast radius, regression, test confidence)
   - Agent vs manual verification table
   - Rollback instructions with copy-to-clipboard commands
   - Stats cards (files changed, lines added/removed, test status)
   - Responsive layout with charts (diff stats bar chart, risk breakdown)

---

## Planning checklist

Before proceeding to [execute.md](./execute.md):

- [ ] `repoPath` confirmed and validated
- [ ] `changeScope` confirmed (`user-specified` text captured, or `agent-selects` acknowledged)
- [ ] `outputFormat` confirmed (`markdown` or `website`)
- [ ] `outputPath` determined from table above
- [ ] `startTime` recorded (ISO 8601)
- [ ] Optional inputs resolved or defaults applied
- [ ] User told which deliverable type will be produced and where it will be written
