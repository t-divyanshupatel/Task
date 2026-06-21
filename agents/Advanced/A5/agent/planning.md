# Phase 1 — Planning

Run this phase **before acquiring the diff or writing any review findings**. Collect required inputs via MCQ. Do not assume defaults for required fields.

---

## User prompts (required — MCQ)

Use the **AskQuestion** tool (or equivalent MCQ UI) so the user picks from fixed options.

### Question 1 — Review target

**Prompt:** "What should I review?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `pr-url` | User provides GitHub/GitLab/Bitbucket PR/MR URL in follow-up or "Other" |
| **B** | `branch` | User provides source branch name — diff against default base branch |
| **C** | `local-diff` | Review uncommitted or current-branch changes in a local repo |

If `pr-url`: validate URL format. If `branch` or `local-diff`: require `repoPath` (Question 2).

Do not proceed without a valid review target.

### Question 2 — Repository path

**Prompt:** "Which repository contains the changes?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `workspace` | Use the current workspace root |
| **B** | `custom` | User provides absolute or relative path in follow-up or "Other" |

Required for `branch` and `local-diff`. For `pr-url`, infer from remote when possible; confirm if ambiguous.

Validate that `repoPath` exists and is a directory. If invalid, ask once more.

### Question 3 — Output format

**Prompt:** "How should I deliver the PR review report?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `markdown` | Write `pr-review-report.md` in `proof/` with tables, charts, issue list, and verdict |
| **B** | `website` | Build interactive Next.js site at `pr-review-site/` using `Task/agents/frontend/` as template (do not edit the template folder) |

Do not start execution until all required answers are confirmed.

---

## Optional inputs (ask only if relevant)

| Field | Default | When to ask |
|-------|---------|-------------|
| `baseBranch` | repo default (`main`, `master`, `development`) | Ask if branch comparison target is non-standard |
| `jiraKey` | none | Ask if requirements alignment is needed and key not in branch/PR title |
| `ticketContext` | none | Ask if no Jira available but acceptance criteria exist |
| `focusAreas` | all five dimensions | Ask if user wants to limit scope — e.g. `security`, `tests` only |
| `assumeAgentGenerated` | `true` | Ask if reviewing a human-authored PR |
| `postToPr` | `false` | Ask if user wants review posted as PR comment (requires API token) |
| `applyFixes` | `false` | Ask if user wants suggested fixes applied locally (not default) |

---

## Output paths

All report deliverables are written under A5, **not** as the primary report inside the analyzed repo:

| Constant | Value |
|----------|-------|
| `agentDir` | `Task/agents/Advanced/A5/agent/` |
| `proofDir` | `Task/agents/Advanced/A5/proof/` |

| `outputFormat` | Deliverable path |
|----------------|------------------|
| `markdown` | `{proofDir}/pr-review-report.md` |
| `website` | `{agentDir}/pr-review-site/` |

Record `startTime` (ISO 8601) as soon as all required MCQ answers are confirmed.

---

## Markdown deliverable preview

When user chooses **markdown**, the report will include:

- Metadata table (agent name, timestamps, duration, repo, PR/branch, verdict, counts)
- Executive summary and verdict panel
- **Issue list** — one subsection per finding (REV-001, REV-002, …) with dimension, severity, classification, evidence, suggested fix, verification steps
- **Issue summary table** — sortable overview of all findings
- **Severity distribution chart** — Mermaid pie or bar chart
- **Dimension coverage table** — findings per correctness/security/tests/performance/maintainability
- Requirements alignment (when Jira/ticket context available)
- Files reviewed, commits, verification performed
- Discovery notes and known limitations

---

## Website deliverable preview

When user chooses **website**:

1. **Copy** `Task/agents/frontend/` → `{agentDir}/pr-review-site/` (never modify the source template)
2. Replace default page content with PR review explorer UI
3. Embed review data as typed JSON/TS constants or `data/pr-review.json`
4. Run `npm install && npm run dev` — serve on **http://localhost:3000**
5. Site must include:
   - Metadata overview with verdict badge (APPROVE / REQUEST CHANGES / COMMENT)
   - Stats cards — blocking, non-blocking, advisory counts by severity
   - Issue list with filter by dimension, severity, and classification
   - Expandable issue detail panels — evidence, suggested fix, verification steps
   - Severity distribution chart and dimension coverage chart
   - Requirements alignment table (when available)
   - Files reviewed table with risk badges
   - Copy-to-clipboard for REV IDs and file citations
   - Responsive layout

---

## Planning checklist

Before proceeding to [execute.md](./execute.md):

- [ ] Review target confirmed (`pr-url`, `branch`, or `local-diff`)
- [ ] `repoPath` confirmed and validated (when required)
- [ ] `outputFormat` confirmed (`markdown` or `website`)
- [ ] `outputPath` determined from table above
- [ ] Optional inputs resolved or defaults applied
- [ ] `startTime` recorded (ISO 8601)
- [ ] User told which deliverable type will be produced and where it will be written
