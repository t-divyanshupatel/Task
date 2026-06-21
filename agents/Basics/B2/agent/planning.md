# Phase 1 — Planning

Run this phase **before any route scanning or API discovery**. Collect required inputs via MCQ. Do not assume defaults for required fields.

---

## User prompts (required — MCQ)

Use the **AskQuestion** tool (or equivalent MCQ UI) so the user picks from fixed options.

### Question 1 — Repository path

**Prompt:** "Which repository should I scan for frontend routes and API endpoints?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `workspace` | Use the current workspace root |
| **B** | `custom` | User provides absolute or relative path in follow-up or "Other" |

Validate that `repoPath` exists and is a directory. If invalid, ask once more. Do not proceed without a valid path.

### Question 2 — Output format

**Prompt:** "How should I deliver the route and API map?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `markdown` | Write `route-api-map.md` in `proof/` with tables, Mermaid route trees, method charts, and frontend↔API cross-reference |
| **B** | `website` | Build interactive Next.js explorer at `route-api-map-site/` using `Task/agents/frontend/` as template (do not edit the template folder) |

Do not start execution until both answers are confirmed.

---

## Optional inputs (ask only if relevant)

| Field | Default | When to ask |
|-------|---------|-------------|
| `baseUrl` | auto-detect | Ask if app uses a path prefix (e.g. `/mf`, `/admin`) or deployed base URL |
| `scope` | full repo | Ask if monorepo — offer subdirectory or package (e.g. `packages/medusa`, `apps/web`) |
| `includeInternalApis` | `false` | Ask if user wants gRPC/internal-only routes documented separately |
| `includeMockServices` | `true` | Ask if sibling mock API servers should be included |

Record `startTime` (ISO 8601) as soon as both MCQ answers are confirmed.

---

## Output paths

All report deliverables are written under B2, **not** as the primary report inside the analyzed repo:

| Constant | Value |
|----------|-------|
| `agentDir` | `Task/agents/Basics/B2/agent/` |
| `proofDir` | `Task/agents/Basics/B2/proof/` |

| `outputFormat` | Deliverable path |
|----------------|------------------|
| `markdown` | `{proofDir}/route-api-map.md` |
| `website` | `{agentDir}/route-api-map-site/` |

---

## Markdown deliverable preview

When user chooses **markdown**, the report will include:

- Metadata table (agent name, timestamps, duration, repo, stack, base URL, counts)
- Executive summary (2–4 sentences on routing architecture)
- **Route overview diagram** — Mermaid graph of frontend areas vs API namespaces
- **Method distribution chart** — Mermaid pie/bar for GET/POST/PUT/PATCH/DELETE
- **Frontend routes** — full table with path, component/page, auth, source file
- **Backend API endpoints** — full table with method, path, handler, auth/middleware, source file
- **Frontend → API call map** — which pages/hooks call which endpoints (with evidence)
- **OpenAPI / Swagger** cross-reference if present
- Discovery notes (files examined, dynamic routes, ambiguities)

---

## Website deliverable preview

When user chooses **website**:

1. **Copy** `Task/agents/frontend/` → `{agentDir}/route-api-map-site/` (never modify the source template)
2. Replace default page content with route & API explorer UI
3. Embed discovery data as typed JSON/TS constants or `data/route-api-map.json`
4. Run `npm install && npm run dev` — serve on **http://localhost:3000**
5. Site must include:
   - Metadata overview and executive summary
   - Searchable frontend route list with path filter
   - Searchable API endpoint list with method filter (GET/POST/… badges)
   - Route tree visualization (Mermaid or nested tree UI)
   - Method distribution chart
   - Frontend↔API cross-reference panel
   - Source file citations (`path:line`) with copy-to-clipboard
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
