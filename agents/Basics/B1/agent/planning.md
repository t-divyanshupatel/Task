# Phase 1 — Planning

Run this phase **before any repo scanning or symbol discovery**. Collect required inputs via MCQ. Do not assume defaults for required fields.

---

## User prompts (required — MCQ)

Use the **AskQuestion** tool (or equivalent MCQ UI) so the user picks from fixed options.

### Question 1 — Repository path

**Prompt:** "Which repository should I map for classes, services, controllers, and other major symbols?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `workspace` | Use the current workspace root |
| **B** | `custom` | User provides absolute or relative path in follow-up or "Other" |

Validate that `repoPath` exists and is a directory. If invalid, ask once more. Do not proceed without a valid path.

### Question 2 — Output format

**Prompt:** "How should I deliver the repo structure map?"

| Option | ID | Action |
|--------|-----|--------|
| **A** | `markdown` | Write `repo-structure-map.md` in `proof/` with tables, Mermaid charts, architecture diagrams, and category count graphs |
| **B** | `website` | Build interactive Next.js explorer at `repo-structure-map-site/` using `Task/agents/frontend/` as template (do not edit the template folder) |

Do not start execution until both answers are confirmed.

---

## Optional inputs (ask only if relevant)

| Field | Default | When to ask |
|-------|---------|-------------|
| `scope` | full repo | Ask if monorepo — offer subdirectory, package, or module name |
| `includeTests` | `false` | Ask if user wants test doubles and fixtures included |

---

## Output paths

All report deliverables are written under B1, **not** as the primary report inside the analyzed repo:

| Constant | Value |
|----------|-------|
| `agentDir` | `Task/agents/Basics/B1/agent/` |
| `proofDir` | `Task/agents/Basics/B1/proof/` |

| `outputFormat` | Deliverable path |
|----------------|------------------|
| `markdown` | `{proofDir}/repo-structure-map.md` |
| `website` | `{agentDir}/repo-structure-map-site/` |

Record `startTime` (ISO 8601) as soon as both MCQ answers are confirmed.

---

## Markdown deliverable preview

When user chooses **markdown**, the report will include:

- Metadata table (agent name, timestamps, duration, repo, stack, scope, per-category counts)
- Executive summary (2–4 sentences on architecture and organization)
- **Architecture overview** — ASCII tree or package diagram
- **Category distribution chart** — Mermaid pie or bar chart of symbol counts
- **Layer flow diagram** — Mermaid flowchart (controllers → services → repositories)
- Per-category tables: Controllers, Services, Repositories, Models, Jobs, Consumers, Configs, Utilities, Classes, Interfaces
- **Layer relationships** table with confidence (explicit vs inferred)
- Discovery notes (files examined, exclusions, ambiguities, recommendations)

---

## Website deliverable preview

When user chooses **website**:

1. **Copy** `Task/agents/frontend/` → `{agentDir}/repo-structure-map-site/` (never modify the source template)
2. Replace default page content with repo structure explorer UI
3. Embed discovery data as typed JSON/TS constants or `data/repo-structure.json`
4. Run `npm install && npm run dev` — serve on **http://localhost:3000**
5. Site must include:
   - Metadata overview and executive summary
   - Category count stats cards and bar/pie chart
   - Searchable/filterable symbol explorer by category
   - Layer relationship diagram (Mermaid or visual graph)
   - Per-category detail panels with source citations (`path:line`)
   - Architecture tree or package map
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
