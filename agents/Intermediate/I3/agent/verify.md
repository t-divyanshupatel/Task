# Phase 3 — Verify

Run after [execute.md](./execute.md) deliverable is written, the change is applied, and tests have been run. Fix any failing checks before telling the user the task is complete.

---

## Universal checks (both formats)

- [ ] Planning MCQ completed — `repoPath`, `changeScope`, and `outputFormat` were confirmed
- [ ] **Agent name** `focused-module-change` appears in deliverable metadata
- [ ] **Started at**, **Completed at**, **Duration** present
- [ ] **Repository** path matches user input
- [ ] **Unfamiliar module** documented with path and rationale
- [ ] **Change definition** includes motivation and acceptance criteria
- [ ] **Files changed** table lists every file in the diff
- [ ] **Why these files** narrative explains each changed path
- [ ] **Diff or branch** section present with `git diff --stat` and full diff (or branch name + diff)
- [ ] **Test added or updated** — at least one test file touched or explicitly added
- [ ] **Test command** and **real output** with exit code present
- [ ] **Before vs after** comparison table filled
- [ ] **Risk assessment** table present with overall risk summary
- [ ] **Agent suggested vs manually verified** table present (manual columns = `pending`)
- [ ] **Rollback notes** with undo steps
- [ ] **Discovery notes** include files examined
- [ ] **No conflict markers** or placeholder data (`TODO`, `example`, `xxx lines`) in deliverable
- [ ] **Template unchanged** — `Task/agents/frontend/` was not modified (website format only)
- [ ] Change is **minimal** — no unrelated refactors beyond stated scope

---

## Change quality checks

- [ ] Module was **unfamiliar** at start of run — rationale is credible, not the default entry file only
- [ ] Production diff is **focused** — ideally ≤3 production files and ≤50 lines (or justified in report)
- [ ] **Exactly one** primary behavior change (extras deferred to discovery notes)
- [ ] Test **proves the change** — not a trivial assertion or deleted coverage
- [ ] `git diff` in `repoPath` **matches** diff in the report
- [ ] No new dependencies added (unless `allowNewDependency: true`)
- [ ] No commit/push unless user explicitly requested

---

## Test checks

- [ ] Test file path and test name documented
- [ ] Test command is the **narrowest** proof (single file or `-t` / `-k` filter when possible)
- [ ] Exit code and output excerpt are **real** (re-run if suspicious)
- [ ] Test result in metadata matches test section (PASS / FAIL / NOT RUN)
- [ ] If FAIL, report says so honestly — success is not claimed

---

## Markdown format checks

Deliverable: `{proofDir}/focused-module-change-report.md`

- [ ] File exists at `Task/agents/Intermediate/I3/proof/focused-module-change-report.md`
- [ ] Metadata table includes: module, change summary, files changed count, lines changed, test result
- [ ] **Module map** — Mermaid flowchart or equivalent diagram present
- [ ] **Files changed** table with role and line counts
- [ ] **Why these files** section present
- [ ] **Diff stats** block from `git diff --stat`
- [ ] **Diff** block with actual `git diff` content
- [ ] **Mermaid chart** for diff stats or test status (xychart-beta, pie, or flowchart)
- [ ] **Test command** block with exact shell command
- [ ] **Test output** block with verbatim or faithfully truncated output
- [ ] **Risk assessment** table with four dimensions
- [ ] **Agent vs manual** comparison table complete

### Markdown spot-check

Grep the report for evidence backing:

```bash
grep -E "Source:|path:line|\.java:|\.js:|\.ts:|\.py:|\.go:|git diff|PASS|FAIL|\+[0-9]" Task/agents/Intermediate/I3/proof/focused-module-change-report.md
```

Module path, diff, and test output should appear with concrete values.

---

## Website format checks

Deliverable: `{agentDir}/focused-change-site/`

- [ ] Directory exists; copied from `Task/agents/frontend/` template
- [ ] `Task/agents/frontend/` files were **not** edited
- [ ] `data/focused-change-report.json` (or equivalent) contains full change data
- [ ] `npm install` completed without errors
- [ ] `npm run build` passes
- [ ] `npm run dev` serves on **http://localhost:3000**
- [ ] Overview shows metadata, module name, and test pass/fail badge
- [ ] Module selection panel shows unfamiliar-module rationale
- [ ] Files changed table with per-file "why" detail
- [ ] Diff viewer shows actual fix diff
- [ ] Diff stats chart visible with real numbers
- [ ] Test panel shows command, output, and result
- [ ] Before vs after comparison cards populated
- [ ] Risk assessment badges rendered
- [ ] Agent vs manual verification table visible
- [ ] Rollback section with copy-to-clipboard commands
- [ ] UI is responsive (mobile + desktop)
- [ ] No default Next.js placeholder content remains

### Website smoke test

1. Open http://localhost:3000
2. Confirm module path and change summary match the repo work
3. View diff — file list matches `git diff --stat` in target repo
4. Check test panel — result badge matches report (PASS / FAIL)
5. Verify risk section and agent vs manual table are populated

---

## Failure handling

| Failure | Action |
|---------|--------|
| Module too large | Narrow to one function/file; document deferred scope |
| Cannot run tests | Document in **Blocked**; set test result NOT RUN |
| Diff too large | Split work — implement smallest slice; justify or rollback extras |
| No test added | Add focused test before completing |
| Test does not prove change | Strengthen assertion or change test target |
| Diff in report ≠ actual changes | Reconcile `git diff` with report |
| Website build fails | Fix errors in `focused-change-site/` only |
| Template was edited | Revert changes to `Task/agents/frontend/` |
| Unrelated files in diff | Revert scope creep; document alternatives only |
| Fabricated output suspected | Re-run commands; paste real output |

Do not report success until all applicable checks pass.

---

## Completion message

Tell the user:

1. **Report path** — `Task/agents/Intermediate/I3/proof/focused-module-change-report.md` or `http://localhost:3000`
2. **Change location** — files changed in `repoPath` (uncommitted unless user asked to commit)
3. **Headline stats** — e.g. "Module: `src/validator/` — added null guard; 2 files, +14/-2; test PASS; low risk; 7m 18s"
4. **Manual review items** — what still needs human verification from the comparison table
5. **Rollback summary** — one-line undo command
6. **How to re-run** — invoke agent again with same or different repo/change/format

Example:

> Focused module change complete. Report: `Task/agents/Intermediate/I3/proof/focused-module-change-report.md` — unfamiliar module `packages/core/utils/src/validate-amount.ts`, added negative-amount guard (+6 lines), updated `validate-amount.test.ts`, verification PASS (`npm test -- validate-amount.test.ts -t "rejects negative"`). Manual review pending: full monorepo test suite. Rollback: `git checkout -- packages/core/utils/src/validate-amount.ts packages/core/utils/src/__tests__/validate-amount.test.ts`. Duration: 7m 18s.
