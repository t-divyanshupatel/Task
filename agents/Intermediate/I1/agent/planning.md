# Phase 1 — Planning

Run this phase **before any repo analysis**. Collect required inputs via MCQ. Do not assume defaults for required fields.

---

## User prompts (required — MCQ)

Use the **AskQuestion** tool (or equivalent MCQ UI) so the user picks from fixed options.

### Question 1 — Repository path

**Prompt:** "Which repository should I analyze for tables and entities?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `workspace` | Use the current workspace root |
| **B** | `custom` | User provides absolute or relative path in follow-up or "Other" |

Validate that `repoPath` exists and is a directory. If invalid, ask once more. Do not proceed without a valid path.

### Question 2 — Output format

**Prompt:** "How should I deliver the ER diagram report?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `markdown` | Write `er-diagram-report.md` in the agent directory with tables, charts, Mermaid diagram |
| **B** | `website` | Build interactive Next.js site at `er-diagram-site/` using `Task/agents/frontend/` as template (do not edit the template folder) |

Do not start execution until both answers are confirmed.

---

## Optional inputs (ask only if relevant)

| Field | Default | When to ask |
|-------|---------|-------------|
| `includeLogicalEntities` | `false` | Ask if repo has heavy domain modeling without ORM |
| `scope` | full repo | Ask if monorepo — offer subdirectory scope |

---

## Output paths (agent directory)

All deliverables are written **next to this agent**, not inside the analyzed repo:

| Constant | Value |
|----------|-------|
| `agentDir` | `Task/agents/Intermediate/I1/agent/` |

| `outputFormat` | Deliverable path |
|----------------|------------------|
| `markdown` | `{agentDir}/er-diagram-report.md` |
| `website` | `{agentDir}/er-diagram-site/` |

---

## Markdown deliverable preview

When user chooses **markdown**, the report will include:

- Metadata table (agent name, timestamps, duration, repo, stack, counts)
- Summary paragraph
- Tables & entities inventory with per-table detail sections
- Primary keys, foreign keys, inferred relationships (each with source citations)
- Relationships summary table
- **Mermaid `erDiagram`** block (valid syntax)
- Discovery notes (files examined, ambiguities, deprecated objects)
- Optional: ASCII architecture diagram, relationship count charts (markdown tables)

---

## Website deliverable preview

When user chooses **website**:

1. **Copy** `Task/agents/frontend/` → `{agentDir}/er-diagram-site/` (never modify the source template)
2. Replace default page content with ER diagram explorer UI
3. Embed discovered schema as typed JSON/TS data
4. Run `npm install && npm run dev` — serve on **http://localhost:3000**
5. Site must include: metadata overview, searchable table list, relationship graph (Mermaid or visual), PK/FK badges, source file citations, responsive layout

---

## Planning checklist

Before proceeding to [execute.md](./execute.md):

- [ ] `repoPath` confirmed and validated
- [ ] `outputFormat` confirmed (`markdown` or `website`)
- [ ] `outputPath` determined from table above
- [ ] `startTime` recorded (ISO 8601)
- [ ] User told which deliverable type will be produced and where it will be written
