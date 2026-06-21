# Phase 3 — Verify

Run after [execute.md](./execute.md) deliverable is written and the fix is applied. Fix any failing checks before telling the user the task is complete.

---

## Universal checks (both formats)

- [ ] Planning MCQ completed — `repoPath`, `symptom`, and `outputFormat` were confirmed
- [ ] **Agent name** `repo-seeded-bug-diagnosis` appears in deliverable metadata
- [ ] **Started at**, **Completed at**, **Duration** present
- [ ] **Repository** path matches user input
- [ ] **Expected vs actual** documented before fix was applied
- [ ] **Reproduction steps** and **before-fix output** present (or **Blocked** section explains why not)
- [ ] **Root cause** cites `path:line` and includes call path table
- [ ] **Minimal fix** diff shown — no drive-by refactors beyond primary bug
- [ ] **Verification command** and **after-fix output** present with real exit code
- [ ] **Before vs after** comparison table filled
- [ ] **Agent suggested vs manually verified** table present (manual columns = `pending`)
- [ ] **Risk assessment** table present
- [ ] **Discovery notes** include files examined
- [ ] **No conflict markers** or placeholder data (`TODO`, `example_bug`) in deliverable
- [ ] **Template unchanged** — `Task/agents/frontend/` was not modified (website format only)
- [ ] Fix applied only for primary bug — secondary issues listed, not silently fixed

---

## Bug-fix checks (target repo)

- [ ] Bug was **reproduced** before any fix (or blocked with evidence)
- [ ] Fix addresses the **primary root cause** identified in the report
- [ ] **Verification reran** the same reproduction command/test — result is PASS
- [ ] `git diff` in `repoPath` matches diff in the report (or report explains if git unavailable)
- [ ] No unrelated files changed (or report notes justified exceptions)
- [ ] No commit/push unless user explicitly requested

---

## Markdown format checks

Deliverable: `{proofDir}/bug-diagnosis-report.md`

- [ ] File exists at `Task/agents/Intermediate/I6/proof/bug-diagnosis-report.md`
- [ ] Metadata table includes: stack, symptom, root cause file, fix status, verification result
- [ ] **Reproduction command** block with exact shell command
- [ ] **Before-fix output** block with verbatim or faithfully truncated output
- [ ] **Defective code (before)** and **Fixed code (after)** snippets with source citations
- [ ] **Diff** block with actual `git diff` content
- [ ] **Call path** table with at least 2 hops ending at defect
- [ ] Counts and statuses in metadata match section contents

### Markdown spot-check

Grep the report for evidence backing:

```bash
grep -E "Source:|path:line|\.java:|\.js:|\.ts:|\.py:|\.go:" Task/agents/Intermediate/I6/proof/bug-diagnosis-report.md
```

Root cause and call path should appear near file citations.

---

## Website format checks

Deliverable: `{agentDir}/bug-diagnosis-site/`

- [ ] Directory exists; copied from `Task/agents/frontend/` template
- [ ] `Task/agents/frontend/` files were **not** edited
- [ ] `data/bug-diagnosis.json` (or equivalent) contains full diagnosis data
- [ ] `npm install` completed without errors
- [ ] `npm run build` passes
- [ ] `npm run dev` serves on **http://localhost:3000**
- [ ] Overview shows metadata, fix status, and verification result
- [ ] Reproduction timeline shows steps and before-fix output
- [ ] Root cause panel shows file citations and call path
- [ ] Diff viewer shows actual fix diff
- [ ] Before vs after comparison cards populated
- [ ] Agent vs manual verification table visible
- [ ] Risk assessment badges rendered
- [ ] Source citations copyable per section
- [ ] UI is responsive (mobile + desktop)
- [ ] No default Next.js "edit page.tsx" placeholder content remains

### Website smoke test

1. Open http://localhost:3000
2. Confirm symptom and fix status match diagnosis
3. Expand reproduction steps — verify before-fix output present
4. View root cause — file path and line citation visible
5. Check verification section — after-fix output shows PASS

---

## Failure handling

| Failure | Action |
|---------|--------|
| Cannot reproduce | Document in **Blocked**; do not apply fix; partial report OK |
| Root cause unclear | Document ambiguities; do not guess — set fix status BLOCKED |
| Fix does not pass verification | Revert or iterate; update report with FAIL status |
| Missing source citation | Re-scan repo; add citation or move to Ambiguities |
| Diff in report ≠ actual changes | Reconcile `git diff` with report |
| Website build fails | Fix errors in `bug-diagnosis-site/` only |
| Unrelated files in diff | Revert scope creep; document secondary issues only |
| Fabricated output suspected | Re-run commands; paste real output |

Do not report success until all applicable checks pass.

---

## Completion message

Tell the user:

1. **Report path** — `Task/agents/Intermediate/I6/proof/bug-diagnosis-report.md` or `http://localhost:3000`
2. **Fix location** — files changed in `repoPath` (uncommitted unless user asked to commit)
3. **Headline stats** — e.g. "Root cause: `converter.py:42` — wrong divisor; verification PASS; 3 files changed; 6m 12s"
4. **Manual review items** — what still needs human verification from the comparison table
5. **How to re-run** — invoke agent again with same or different repo/symptom/format

Example:

> Bug diagnosis complete. Report: `Task/agents/Intermediate/I6/proof/bug-diagnosis-report.md` — reproduced failing test `test_convert_usd_eur`, root cause `src/converter.py:42` (inverted rate divisor), minimal 1-line fix applied, verification PASS. Manual review pending: full test suite, staging deploy. Fix is uncommitted in `Task/my-app/`.
