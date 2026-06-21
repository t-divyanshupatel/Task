# Phase 1 — Planning

Run this phase **before any repo analysis or code changes**. Collect required inputs via MCQ. Do not assume defaults for required fields.

---

## User prompts (required — MCQ)

Use the **AskQuestion** tool (or equivalent MCQ UI) so the user picks from fixed options.

### Question 1 — Repository path

**Prompt:** "Which repository should I analyze for modernization opportunities?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `workspace` | Use the current workspace root |
| **B** | `custom` | User provides absolute or relative path in follow-up or "Other" |

Validate that `repoPath` exists and is a directory. If invalid, ask once more. Do not proceed without a valid path.

### Question 2 — Output format

**Prompt:** "How should I deliver the modernization report?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `markdown` | Write `modernization-report.md` in `proof/` with tables, Mermaid charts, priority matrix, and implementation details |
| **B** | `website` | Build interactive Next.js dashboard at `modernization-site/` using `Task/agents/frontend/` as template (do not edit the template folder) |

Do not start execution until both answers are confirmed.

---

## Optional inputs (ask only if relevant)

| Field | Default | When to ask |
|-------|---------|-------------|
| `scope` | full repo | Ask if monorepo — offer subdirectory or package scope |
| `modernizationFocus` | all categories | Ask if user wants to limit to deps, security, CI, types, etc. |
| `allowImplementation` | `true` | Ask if user wants analysis-only (skip Step 4 implementation) |
| `verifyCommands` | auto-detect | Ask if user has custom build/test/lint commands |

---

## Output paths

All report deliverables are written under A4, **not** as the primary report inside the analyzed repo:

| Constant | Value |
|----------|-------|
| `agentDir` | `Task/agents/Advanced/A4/agent/` |
| `proofDir` | `Task/agents/Advanced/A4/proof/` |

| `outputFormat` | Deliverable path |
|----------------|------------------|
| `markdown` | `{proofDir}/modernization-report.md` |
| `website` | `{agentDir}/modernization-site/` |

Record `startTime` (ISO 8601) as soon as both MCQ answers are confirmed.

---

## Markdown deliverable preview

When user chooses **markdown**, the report will include:

- Metadata table (agent name, timestamps, duration, repo, stack, finding counts)
- Executive summary
- **Findings** — categorized tables with evidence (`path:line` or config key), severity, and category
- **Priority matrix** — Mermaid quadrant or bar chart (value vs risk)
- **Prioritized plan** — ranked backlog with scores (impact, effort, risk, priority score)
- **First step implemented** — selected item, rationale, files changed, diff summary
- **Verification** — commands run, pass/fail, relevant output excerpts
- **Rollback notes** — step-by-step undo instructions
- Discovery notes (scan scope, exclusions, ambiguities)

---

## Website deliverable preview

When user chooses **website**:

1. **Copy** `Task/agents/frontend/` → `{agentDir}/modernization-site/` (never modify the source template)
2. Replace default page content with modernization dashboard UI
3. Embed analysis data as typed JSON/TS constants or `data/modernization-report.json`
4. Run `npm install && npm run dev` — serve on **http://localhost:3000**
5. Site must include:
   - Metadata overview and executive summary
   - Findings table with search/filter by category and severity
   - Priority matrix visualization (chart or interactive grid)
   - Ranked backlog with expandable detail panels
   - First step section (what changed, diff summary, file links)
   - Verification results panel (pass/fail badges, command output)
   - Rollback instructions section
   - Responsive layout with stats cards

---

## Planning checklist

Before proceeding to [execute.md](./execute.md):

- [ ] `repoPath` confirmed and validated
- [ ] `outputFormat` confirmed (`markdown` or `website`)
- [ ] `outputPath` determined from table above
- [ ] `startTime` recorded (ISO 8601)
- [ ] Optional inputs resolved or defaults applied
- [ ] User told which deliverable type will be produced and where it will be written
