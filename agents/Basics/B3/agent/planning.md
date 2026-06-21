# Phase 1 — Planning

Run this phase **before any test scanning or command execution**. Collect required inputs via MCQ. Do not assume defaults for required fields.

---

## User prompts (required — MCQ)

Use the **AskQuestion** tool (or equivalent MCQ UI) so the user picks from fixed options.

### Question 1 — Repository path

**Prompt:** "Which repository should I analyze for test framework, test files, and run commands?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `workspace` | Use the current workspace root |
| **B** | `custom` | User provides absolute or relative path in follow-up or "Other" |

Validate that `repoPath` exists and is a directory. If invalid, ask once more. Do not proceed without a valid path.

### Question 2 — Output format

**Prompt:** "How should I deliver the test discovery report?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `markdown` | Write `test-discovery-report.md` in `proof/` with tables, Mermaid charts, command output, and failure interpretation |
| **B** | `website` | Build interactive Next.js dashboard at `test-discovery-site/` using `Task/agents/frontend/` as template (do not edit the template folder) |

Do not start execution until both answers are confirmed.

---

## Optional inputs (ask only if relevant)

| Field | Default | When to ask |
|-------|---------|-------------|
| `scope` | full repo | Ask if monorepo — offer subdirectory, package, or test type (`unit`, `integration`, `e2e`) |
| `runTests` | `true` | Ask if user wants discovery only without executing commands |
| `maxTestFilesListed` | `75` | Ask if user wants a cap before summarizing by directory |

---

## Output paths

All report deliverables are written under B3, **not** inside the analyzed repo:

| Constant | Value |
|----------|-------|
| `agentDir` | `Task/agents/Basics/B3/agent/` |
| `proofDir` | `Task/agents/Basics/B3/proof/` |

| `outputFormat` | Deliverable path |
|----------------|------------------|
| `markdown` | `{proofDir}/test-discovery-report.md` |
| `website` | `{agentDir}/test-discovery-site/` |

Record `startTime` (ISO 8601) as soon as both MCQ answers are confirmed.

---

## Markdown deliverable preview

When user chooses **markdown**, the report will include:

- Metadata table (agent name, timestamps, duration, repo, stack, scope, frameworks, test file count, pass/fail)
- Executive summary
- **Test framework & configuration** — framework table, config file details
- **Framework distribution chart** — Mermaid pie/bar if multiple frameworks
- **Relevant test files** — table with path, type, framework, what it tests
- **Test directory tree** — ASCII or Mermaid
- **Exact commands** — copy-paste ready with source references and prerequisites
- **Command results** — exit code, duration, raw terminal output in fenced blocks
- **Failures & interpretation** — classification, likely cause, recommended next steps
- Discovery notes (files examined, CI vs local, ambiguities, blockers)

---

## Website deliverable preview

When user chooses **website**:

1. **Copy** `Task/agents/frontend/` → `{agentDir}/test-discovery-site/` (never modify the source template)
2. Replace default page content with test discovery dashboard UI
3. Embed discovery data as typed JSON/TS constants or `data/test-discovery.json`
4. Run `npm install && npm run dev` — serve on **http://localhost:3000**
5. Site must include:
   - Metadata overview and executive summary
   - Framework stats cards (framework name, version, config path)
   - Test file explorer with search/filter by path, type, framework
   - Framework distribution chart (bar or pie)
   - Test directory tree navigation
   - Commands panel with copy-to-clipboard
   - Command results viewer with syntax-highlighted output
   - Failures panel with classification badges and interpretation
   - Pass/fail summary chart
   - Discovery notes section
   - Responsive layout with good visual hierarchy

---

## Planning checklist

Before proceeding to [execute.md](./execute.md):

- [ ] `repoPath` confirmed and validated
- [ ] `outputFormat` confirmed (`markdown` or `website`)
- [ ] `outputPath` determined from table above
- [ ] `startTime` recorded (ISO 8601)
- [ ] Optional inputs resolved or defaults applied
- [ ] User told which deliverable type will be produced and where it will be written
