# Phase 3 — Verify

Run after [execute.md](./execute.md) deliverable is written and implementation verified. Fix any failing checks before telling the user the task is complete.

---

## Universal checks (both formats)

- [ ] Planning MCQ completed — `repoPath` and `outputFormat` were confirmed
- [ ] **Agent name** `repo-modernizer` appears in deliverable metadata
- [ ] **Started at**, **Completed at**, **Duration** present
- [ ] **Repository** path matches user input
- [ ] **Findings** section present with at least one evidence-backed row (or explicit "no findings" with scan notes)
- [ ] Every finding has **evidence** (`path:line`, config key, or command output)
- [ ] **Prioritized plan** with ranked backlog and priority scores
- [ ] **Priority chart** present (Mermaid or site visualization)
- [ ] **First step implemented** section present (or "analysis-only" noted)
- [ ] **Verification** section with command(s), exit code, and result
- [ ] **Rollback notes** with undo steps for implemented change
- [ ] **Discovery notes** include files examined and exclusions
- [ ] **No conflict markers** or placeholder findings (`Example finding`, `TODO`) in deliverable
- [ ] **Template unchanged** — `Task/agents/frontend/` was not modified (website format only)
- [ ] Implementation (if any) is **minimal** — no unrelated refactors in `repoPath`

---

## Markdown format checks

Deliverable: `{proofDir}/modernization-report.md`

- [ ] File exists at `Task/agents/Advanced/A4/proof/modernization-report.md`
- [ ] Metadata table includes stack, scope, findings count, verification status
- [ ] **Executive summary** paragraph present
- [ ] **Findings by category** summary table
- [ ] **Mermaid pie or bar chart** for findings distribution
- [ ] **Detailed findings table** with ID, severity, impact, effort, risk, evidence
- [ ] **Priority matrix** (Mermaid quadrantChart or equivalent)
- [ ] **Ranked backlog** table with priority scores
- [ ] **First step implemented** with files changed and diff summary
- [ ] **Verification table** with command output excerpt
- [ ] **Rollback notes** with git or manual undo commands
- [ ] **Recommended next steps** in discovery notes

### Markdown spot-check

Grep the report for evidence backing:

```bash
grep -E "\.json:|\.yml:|\.yaml:|\.ts:|\.js:|\.java:|\.py:|\.go:|\.gradle:|\.xml:|MOD-[0-9]" Task/agents/Advanced/A4/proof/modernization-report.md
```

Findings tables should contain file path citations or config references near each row.

---

## Website format checks

Deliverable: `{agentDir}/modernization-site/`

- [ ] Directory exists; copied from `Task/agents/frontend/` template
- [ ] `Task/agents/frontend/` files were **not** edited
- [ ] `data/modernization-report.json` (or equivalent) contains full analysis data
- [ ] `npm install` completed without errors
- [ ] `npm run build` passes
- [ ] `npm run dev` serves on **http://localhost:3000**
- [ ] Overview shows metadata, summary, and stats cards
- [ ] Findings table with search/filter by category and severity
- [ ] Priority matrix visualization visible
- [ ] Ranked backlog with implemented item highlighted
- [ ] First step panel with files changed and diff summary
- [ ] Verification panel with pass/fail status
- [ ] Rollback section with copy-to-clipboard commands
- [ ] UI is responsive (mobile + desktop)
- [ ] No default Next.js placeholder content remains

### Website smoke test

1. Open http://localhost:3000
2. Confirm repo name and stack match analysis
3. Search for a finding by ID (e.g. `MOD-001`)
4. Open priority matrix — verify implemented item is visible
5. Check verification badge matches report status
6. Copy a rollback command — verify it matches the markdown report

---

## Implementation checks (when `allowImplementation: true`)

- [ ] Exactly **one** modernization step was implemented
- [ ] Change is **reversible** and documented in rollback notes
- [ ] At least one **verification command** was run after the change
- [ ] Verification result is recorded honestly (pass/fail/skipped with reason)
- [ ] If verification failed and change was rolled back, report states this clearly

---

## Failure handling

| Failure | Action |
|---------|--------|
| Missing findings section | Re-scan repo; add findings or document why none found |
| Finding without evidence | Add citation or move to Ambiguities |
| No priority ranking | Compute priority scores; add ranked backlog |
| Missing verification | Run build/test/lint; record output |
| Missing rollback | Document undo steps for each changed file |
| Placeholder data detected | Replace with real findings from scan |
| Website build fails | Fix errors in `modernization-site/` only |
| Template was edited | Revert changes to `Task/agents/frontend/` |
| Implementation too large | Split — keep only first step; move rest to backlog |

Do not report success until all applicable checks pass.

---

## Completion message

Tell the user:

1. **Report path** — `Task/agents/Advanced/A4/proof/modernization-report.md` or `http://localhost:3000`
2. **Headline stats** — e.g. "14 findings; MOD-003 implemented (added .nvmrc); lint + test pass; 6m 12s"
3. **Top 3 backlog items** — rank, ID, title, priority score
4. **Rollback summary** — one-line undo command
5. **How to re-run** — invoke agent again for next backlog item or different repo/format

Example:

> Modernization report complete. Report: `Task/agents/Advanced/A4/proof/modernization-report.md` — 14 findings across deps, CI, and type safety; implemented MOD-003 (added `.nvmrc` matching `engines.node`); `npm run lint` and `npm test` passed. Rollback: `git checkout -- .nvmrc`. Next up: MOD-007 (add lint step to CI). Duration: 6m 12s.
