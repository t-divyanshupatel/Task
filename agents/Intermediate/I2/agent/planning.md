# Phase 1 — Planning

Run this phase **before any repo analysis**. Collect required inputs via MCQ. Do not assume defaults for required fields.

---

## User prompts (required — MCQ)

Use the **AskQuestion** tool (or equivalent MCQ UI) so the user picks from fixed options.

### Question 1 — Repository path

**Prompt:** "Which repository should I trace a flow in?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `workspace` | Use the current workspace root |
| **B** | `custom` | User provides absolute or relative path in follow-up or "Other" |

Validate that `repoPath` exists and is a directory. If invalid, ask once more. Do not proceed without a valid path.

### Question 2 — Flow target

**Prompt:** "Which endpoint, event, or cron job should I trace end-to-end?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `user-specified` | User provides the flow in follow-up or "Other" (see **Flow target formats** below) |
| **B** | `pick-one` | After brief recon, pick one representative flow (prefer a well-wired HTTP endpoint with clear handler → service → persistence). State choice and why before tracing. |

Accept any of these formats (normalize internally):

| Kind | Examples |
|------|----------|
| HTTP endpoint | `GET /mf/v2/dashboard`, `POST /api/users/:id` |
| Named handler / route key | `DASHBOARD_API`, `handleLastSync`, route constant from `routes.js` |
| Event / message | `UserCreatedEvent`, `kafka topic orders.created`, `@RabbitListener` queue name |
| Cron / scheduler | `@Scheduled(cron = "0 0 * * *")`, `node-cron` job name, Bull queue processor |

### Question 3 — Output format

**Prompt:** "How should I deliver the E2E flow trace report?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `markdown` | Write `e2e-flow-trace-report.md` in `proof/` with tables, charts, Mermaid sequence diagram |
| **B** | `website` | Build interactive Next.js site at `e2e-flow-site/` using `Task/agents/frontend/` as template (do not edit the template folder) |

Do not start execution until all three answers are confirmed.

---

## Optional inputs (ask only if relevant)

| Field | Default | When to ask |
|-------|---------|-------------|
| `includeSiblingRepos` | `false` | Ask if flow likely calls sibling microservices |
| `scope` | full repo | Ask if monorepo — offer subdirectory scope |

---

## Output paths

All deliverables are written under I2, **not** inside the analyzed repo:

| Constant | Value |
|----------|-------|
| `agentDir` | `Task/agents/Intermediate/I2/agent/` |
| `proofDir` | `Task/agents/Intermediate/I2/proof/` |

| `outputFormat` | Deliverable path |
|----------------|------------------|
| `markdown` | `{proofDir}/e2e-flow-trace-report.md` |
| `website` | `{agentDir}/e2e-flow-site/` |

---

## Markdown deliverable preview

When user chooses **markdown**, the report will include:

- Metadata table (agent name, timestamps, duration, repo, flow, stack, step/side-effect counts)
- Summary paragraph
- Entry point table (kind, identifier, file, function, trigger)
- Step-by-step call path table with `path:line` citations
- External dependencies table
- Side effects (Database, Outbound APIs, Queues/Events) with confidence levels
- **Mermaid `sequenceDiagram`** block (valid syntax)
- Known uncertainty table + files examined + not traced (out of scope)
- Optional: call-path depth chart, side-effect count summary (markdown tables)

---

## Website deliverable preview

When user chooses **website**:

1. **Copy** `Task/agents/frontend/` → `{agentDir}/e2e-flow-site/` (never modify the source template)
2. Replace default page content with E2E flow explorer UI
3. Embed traced flow as typed JSON/TS data
4. Run `npm install && npm run dev` — serve on **http://localhost:3000**
5. Site must include: metadata overview, entry point card, interactive step timeline, external dependencies panel, side-effects tabs (DB/API/Queue), Mermaid sequence diagram, source file citations, responsive layout with charts/stats cards

---

## Planning checklist

Before proceeding to [execute.md](./execute.md):

- [ ] `repoPath` confirmed and validated
- [ ] `flowTarget` confirmed (user-specified or `pick-one` acknowledged)
- [ ] `outputFormat` confirmed (`markdown` or `website`)
- [ ] `outputPath` determined from table above
- [ ] `startTime` recorded (ISO 8601)
- [ ] User told which deliverable type will be produced and where it will be written
