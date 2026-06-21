# Phase 3 — Verify

Run after [execute.md](./execute.md) deliverable is written. Fix any failing checks before telling the user the task is complete.

---

## Universal checks (both formats)

- [ ] Planning MCQ completed — `repoPath` and `outputFormat` were confirmed
- [ ] **Agent name** `repo-route-api-mapper` appears in deliverable metadata
- [ ] **Started at**, **Completed at**, **Duration** present
- [ ] **Repository** path matches user input
- [ ] **Frontend routes** section present with count matching metadata
- [ ] **API endpoints** section present with count matching metadata
- [ ] Every listed route/endpoint has a **source file citation** (`path:line`)
- [ ] HTTP **method** documented for every API endpoint
- [ ] **Frontend → API call map** section present (use "_None mapped._" only if truly no client calls found)
- [ ] **Method distribution** chart present with real counts
- [ ] **Route tree** or architecture diagram present
- [ ] **Discovery notes** include files examined, dynamic routes, and ambiguities
- [ ] **No conflict markers** or placeholder data (`Example`, `TODO`, `/api/example`) in deliverable
- [ ] **Target repo unchanged** — no edits in `repoPath`
- [ ] **Template unchanged** — `Task/agents/frontend/` was not modified (website format only)

---

## Route quality checks

- [ ] Frontend paths use consistent notation (`:id` or `[id]`, not mixed randomly)
- [ ] API paths include global prefix when app uses one (e.g. `/admin`, `/api/v1`)
- [ ] Duplicate `METHOD + path` pairs deduplicated
- [ ] Auth/middleware noted where detectable; `unknown` used honestly
- [ ] Dynamic/runtime routes documented in Discovery Notes
- [ ] Test-only routes excluded unless explicitly requested

---

## Markdown format checks

Deliverable: `{proofDir}/route-api-map.md`

- [ ] File exists at `Task/agents/Basics/B2/proof/route-api-map.md`
- [ ] Metadata includes stack, base URL, frontend route count, API count, method breakdown
- [ ] **Summary** paragraph present (2–4 sentences)
- [ ] **Method distribution** Mermaid pie or bar chart
- [ ] **Route tree** Mermaid flowchart or graph
- [ ] **Frontend routes** table with Path, Component, Auth, File columns
- [ ] **API endpoints** grouped by namespace (admin/store/auth/hooks/custom)
- [ ] **Frontend → API call map** table with confidence column
- [ ] **OpenAPI cross-reference** section present (or explicit "_None found._")
- [ ] Counts in metadata match section row totals

### Markdown spot-check

```bash
grep -E "route\.ts:|\.tsx:|GET|POST|PUT|PATCH|DELETE|/admin/|/store/" Task/agents/Basics/B2/proof/route-api-map.md
```

Route tables should contain file path citations and HTTP methods, not invented paths.

---

## Website format checks

Deliverable: `{agentDir}/route-api-map-site/`

- [ ] Directory exists; copied from `Task/agents/frontend/` template
- [ ] `Task/agents/frontend/` files were **not** edited
- [ ] `data/route-api-map.json` (or equivalent) contains full discovery data
- [ ] `npm install` completed without errors
- [ ] `npm run build` passes
- [ ] `npm run dev` serves on **http://localhost:3000**
- [ ] Frontend routes tab searchable with auth badges
- [ ] API endpoints tab filterable by method
- [ ] Call map tab shows frontend→API relationships
- [ ] Route tree and method chart visible with real data
- [ ] Source citations copyable per row
- [ ] UI responsive (mobile + desktop)
- [ ] No default Next.js placeholder content remains

### Website smoke test

1. Open http://localhost:3000
2. Confirm route/API counts match metadata
3. Search for a known admin or store path — filter works
4. Filter API list by GET — results match report
5. Open call map — verify at least one mapping has `path:line` citation

---

## Large repo checks

If any section exceeded 100 rows:

- [ ] Per-namespace count table at section top
- [ ] Primary namespaces (admin, store, public) fully listed
- [ ] Summarized secondary namespaces documented in Discovery Notes

---

## Failure handling

| Failure | Action |
|---------|--------|
| Missing source citation | Re-scan repo; add citation or move to Ambiguities |
| Route count mismatch | Reconcile metadata vs tables |
| No HTTP methods on API rows | Re-read handler exports; add method column |
| Invalid Mermaid | Fix chart syntax |
| Website build fails | Fix errors in `route-api-map-site/` only |
| Template was edited | Revert changes to `Task/agents/frontend/` |
| Placeholder paths detected | Replace with real discovered routes |

Do not report success until all applicable checks pass.

---

## Completion message

Tell the user:

1. **Output path** — `Task/agents/Basics/B2/proof/route-api-map.md` or `http://localhost:3000`
2. **Headline stats** — e.g. "48 frontend routes, 324 API endpoints (256 admin, 50 store), 142 GET, 89 POST, 5m 10s"
3. **Notable findings** — unmapped routes, missing auth, OpenAPI mismatches
4. **How to re-run** — invoke agent again with same or different repo/format/scope

Example:

> Route & API map complete. Report: `Task/agents/Basics/B2/proof/route-api-map.md` — 62 frontend routes, 324 API endpoints (GET 198, POST 89, DELETE 22), Medusa admin + store APIs under `packages/medusa/src/api/`. 41 frontend→API mappings with explicit citations. See Discovery Notes for 3 plugin-loaded dynamic routes. Duration: 5m 10s.
