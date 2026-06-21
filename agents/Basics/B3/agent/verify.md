# Phase 3 — Verify

Run after [execute.md](./execute.md) deliverable is written. Fix any failing checks before telling the user the task is complete.

---

## Universal checks (both formats)

- [ ] Planning MCQ completed — `repoPath` and `outputFormat` were confirmed
- [ ] **Agent name** `repo-test-discovery` appears in deliverable metadata
- [ ] **Started at**, **Completed at**, **Duration** present
- [ ] **Repository** path matches user input
- [ ] **Stack detected** and **scope** documented
- [ ] **Test framework(s)** and **config file path(s)** documented with evidence
- [ ] **Relevant test files** listed (or summarized by directory if > 75)
- [ ] **Exact commands** are copy-paste ready with source references
- [ ] **Command results** section present with exit code and raw output (or explicit NOT RUN with reason)
- [ ] **Failures & interpretation** present (or explicit pass statement)
- [ ] **Discovery notes** include files examined and ambiguities
- [ ] **No conflict markers** or placeholder rows (`ExampleTest`, `TODO`, `xxx`) in deliverable
- [ ] **Template unchanged** — `Task/agents/frontend/` was not modified (website format only)
- [ ] **No source edits** in `repoPath` (dependency install only is allowed)

---

## Test discovery quality checks

- [ ] Framework detection traces to config file, `package.json`, or CI — not guessed
- [ ] Primary command matches CI or documented script when available
- [ ] Test file paths are real relative paths from repo root
- [ ] Command output is actual terminal capture — not fabricated
- [ ] Failures include classification and 1–2 sentence interpretation
- [ ] Blockers (missing deps, TLS, wrong Node version) documented honestly when tests cannot run

---

## Markdown format checks

Deliverable: `{proofDir}/test-discovery-report.md`

- [ ] File exists at `Task/agents/Basics/B3/proof/test-discovery-report.md`
- [ ] Metadata table includes test file count, frameworks found, primary result
- [ ] **Summary** paragraph present (2–4 sentences)
- [ ] **Test Framework & Configuration** table with version and config paths
- [ ] **Mermaid chart** for framework or test-type distribution (when multiple types exist)
- [ ] **Relevant Test Files** table with Path, Type, Framework columns
- [ ] **Exact Commands** table with Purpose, Working dir, Source columns
- [ ] **Command Results** with fenced raw output blocks
- [ ] **Failures & Interpretation** table or explicit pass statement
- [ ] **Recommended next steps** when failures or blockers exist

### Markdown spot-check

Grep the report for evidence backing:

```bash
grep -E "jest\.config|vitest\.config|package\.json|\.spec\.|\.test\.|Exit code|FAILED|PASSED" Task/agents/Basics/B3/proof/test-discovery-report.md | head -20
```

Report should contain concrete file paths and real command output snippets.

---

## Website format checks

Deliverable: `{agentDir}/test-discovery-site/`

- [ ] Directory exists; copied from `Task/agents/frontend/` template
- [ ] `Task/agents/frontend/` files were **not** edited
- [ ] `data/test-discovery.json` (or equivalent) contains full discovery data
- [ ] `npm install` completed without errors
- [ ] `npm run build` passes
- [ ] `npm run dev` serves on **http://localhost:3000**
- [ ] Overview shows metadata and framework stat cards
- [ ] Test file explorer lists files with search/filter
- [ ] Framework distribution chart shows real numbers
- [ ] Commands panel with copy-to-clipboard works
- [ ] Command results viewer shows exit code and output
- [ ] Failures panel populated when failures exist
- [ ] Discovery notes section populated
- [ ] UI is responsive (mobile + desktop)
- [ ] No default Next.js placeholder content remains

### Website smoke test

1. Open http://localhost:3000
2. Confirm repo name and stack match analysis
3. Verify test file count on overview matches metadata
4. Search for a known test file — detail panel shows path and framework
5. Open command results — output renders without errors

---

## Failure handling

| Failure | Action |
|---------|--------|
| Missing framework section | Re-scan package.json, CI, config files |
| No command output | Run primary command; paste actual output or document blocker |
| Fabricated results | Remove; re-run command or mark NOT RUN |
| Missing test files section | Expand glob patterns; check monorepo packages |
| Count mismatch | Re-count test files; fix metadata |
| Website build fails | Fix errors in `test-discovery-site/` only |
| Template was edited | Revert changes to `Task/agents/frontend/` |
| Too many test file rows | Apply directory summary per large-repo rules |

Do not report success until all applicable checks pass.

---

## Completion message

Tell the user:

1. **Report path** — `Task/agents/Basics/B3/proof/test-discovery-report.md` or `http://localhost:3000`
2. **Headline stats** — e.g. "Jest 29.x — 312 test files, `yarn test` FAILED (3 assertion failures), 4m 12s"
3. **Stack and scope** — one line
4. **Notable findings** — e.g. CI uses different command, integration tests need Docker
5. **How to re-run** — invoke agent again with different repo, scope, or format

Example:

> Test discovery complete. Report: `Task/agents/Basics/B3/proof/test-discovery-report.md` — Medusa monorepo, Jest 29.x + integration-tests/http, 847 test files. Primary command `yarn test:unit` exit 0 (PASSED). Integration command blocked: missing `node_modules`. Duration: 6m 08s.
