# Phase 3 — Verify

Run after [execute.md](./execute.md) deliverable is written. Fix any failing checks before telling the user the task is complete.

---

## Universal checks (both formats)

- [ ] Planning MCQ completed — `repoPath` and `outputFormat` were confirmed
- [ ] **Agent name** `repo-structure-mapper` appears in deliverable metadata
- [ ] **Started at**, **Completed at**, **Duration** present
- [ ] **Repository** path matches user input
- [ ] All **ten categories** are present as sections (use "_None found._" when empty)
- [ ] Every listed symbol has a **source file reference** (`path:line`)
- [ ] Category counts in metadata match section contents
- [ ] **Layer relationships** table present with confidence (explicit/inferred)
- [ ] **Discovery notes** include files examined, exclusions, and ambiguities
- [ ] **No conflict markers** or placeholder data (`Example`, `TODO`, `TBD`) in deliverable
- [ ] **Target repo unchanged** — no edits in `repoPath`
- [ ] **Template unchanged** — `Task/agents/frontend/` was not modified (website format only)

---

## Symbol quality checks

- [ ] Controllers, services, and repositories have full row listings (not just counts)
- [ ] Descriptions use doc comments where available; `unknown` used honestly when unclear
- [ ] Duplicate symbols deduplicated by fully qualified name
- [ ] Generated/test code excluded per `includeTests` setting
- [ ] Monorepo packages noted when multiple apps exist

---

## Markdown format checks

Deliverable: `{proofDir}/repo-structure-map.md`

- [ ] File exists at `Task/agents/Basics/B1/proof/repo-structure-map.md`
- [ ] Metadata table includes stack, scope, files scanned, and per-category counts
- [ ] **Summary** paragraph present (2–4 sentences)
- [ ] **Architecture overview** with ASCII tree or package diagram
- [ ] **Category distribution** Mermaid pie or bar chart with real counts
- [ ] **Layer flow** Mermaid flowchart present
- [ ] Per-category tables: Controllers, Services, Repositories, Models, Jobs, Consumers, Configs, Utilities, Classes, Interfaces
- [ ] **Layer relationships** table with From/To/Relationship/Confidence columns
- [ ] **Discovery notes** with files examined, exclusions, ambiguities, recommendations

### Markdown spot-check

Grep the report for evidence backing:

```bash
grep -E "\.java:|\.ts:|\.js:|\.py:|\.go:|\.dart:|\.kt:|\.yml:|@|path:" Task/agents/Basics/B1/proof/repo-structure-map.md
```

Symbol tables should contain file path citations, not invented names.

---

## Website format checks

Deliverable: `{agentDir}/repo-structure-map-site/`

- [ ] Directory exists; copied from `Task/agents/frontend/` template
- [ ] `Task/agents/frontend/` files were **not** edited
- [ ] `data/repo-structure.json` (or equivalent) contains full discovery data
- [ ] `npm install` completed without errors
- [ ] `npm run build` passes
- [ ] `npm run dev` serves on **http://localhost:3000**
- [ ] Overview shows metadata, summary, and category count stats cards
- [ ] Category distribution chart visible with real numbers
- [ ] Symbol explorer lists symbols by category with search/filter
- [ ] Layer flow diagram renders correctly
- [ ] Architecture tree or package map visible
- [ ] Layer relationships panel with confidence badges
- [ ] Source citations visible and copyable per symbol
- [ ] UI is responsive (mobile + desktop)
- [ ] No default Next.js placeholder content remains

### Website smoke test

1. Open http://localhost:3000
2. Confirm repo path and stack match analysis
3. Verify category counts match metadata totals
4. Search for a known controller or service — filter works
5. Click a symbol — verify `path:line` citation and description
6. View layer diagram — controllers → services → repositories flow visible

---

## Large repo checks

If any category exceeded 75 rows during execution:

- [ ] Per-subdirectory count table present at top of that section
- [ ] Controllers, services, repositories still fully listed
- [ ] Summarized categories (models/utilities > 150) documented in discovery notes

---

## Failure handling

| Failure | Action |
|---------|--------|
| Missing source citation | Re-scan repo; add citation or move to Ambiguities |
| Category count mismatch | Reconcile metadata vs section row counts |
| Empty category section missing | Add section with "_None found._" |
| Invalid Mermaid syntax | Fix chart blocks; re-render |
| Website build fails | Fix errors in `repo-structure-map-site/` only |
| Template was edited | Revert changes to `Task/agents/frontend/` |
| Placeholder chart data | Replace with real discovery counts |
| Default Next.js page still showing | Replace with repo structure explorer UI |

Do not report success until all applicable checks pass.

---

## Completion message

Tell the user:

1. **Output path** — `Task/agents/Basics/B1/proof/repo-structure-map.md` or `http://localhost:3000`
2. **Headline stats** — e.g. "42 controllers, 68 services, 31 repositories, 156 models — Spring Boot + Java 17, 4m 22s"
3. **Notable findings** — architecture style, layer gaps, event-driven consumers, recommendations
4. **How to re-run** — invoke agent again with same or different repo/format/scope

Example:

> Repo structure map complete. Report: `Task/agents/Basics/B1/proof/repo-structure-map.md` — 12 controllers, 18 services, 9 repositories, 34 models, 2 jobs, 1 consumer, 8 configs, 15 utilities, 6 classes, 11 interfaces. Layered Spring Boot monolith; business logic in `service/` package. See Discovery Notes for 2 reflection-wired beans. Duration: 3m 12s.
