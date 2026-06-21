# Phase 3 — Verify

Run after [execute.md](./execute.md) deliverable is written. Fix any failing checks before telling the user the task is complete.

---

## Universal checks (both formats)

- [ ] Planning MCQ completed — review target, `repoPath` (when required), and `outputFormat` were confirmed
- [ ] **Agent name** `pr-review` appears in deliverable metadata
- [ ] **Started at**, **Completed at**, **Duration** present
- [ ] **Repository** and **PR/branch** match user input
- [ ] **Verdict** present (APPROVE / REQUEST CHANGES / COMMENT) with confidence level
- [ ] **Issue list** present — every finding has REV ID, dimension, severity, classification
- [ ] Every finding has **location** (`path:line`), **problem**, **suggested fix**, and **verification steps**
- [ ] **Blocking vs non-blocking counts** match detailed findings
- [ ] Verdict is **consistent** with blocking count (zero blocking → not REQUEST CHANGES)
- [ ] **Issue summary table** present and sorted by severity
- [ ] **Dimension coverage** table present
- [ ] **Severity chart** present (Mermaid or site visualization)
- [ ] **Discovery notes** include diff acquisition method and commands run
- [ ] **No conflict markers** or placeholder findings (`Example issue`, `TODO`) in deliverable
- [ ] **Template unchanged** — `Task/agents/frontend/` was not modified (website format only)
- [ ] **Secrets redacted** — no credential values pasted in report
- [ ] **Read-only respected** — no code changes unless `applyFixes: true` was explicitly set

---

## Markdown format checks

Deliverable: `{proofDir}/pr-review-report.md`

- [ ] File exists at `Task/agents/Advanced/A5/proof/pr-review-report.md`
- [ ] Metadata table includes PR/branch, files changed, verdict, blocking count, baseline tests status
- [ ] **Summary** paragraph present
- [ ] **Verdict section** with must-fix and recommended follow-ups lists
- [ ] **Severity distribution** table and **Mermaid pie chart**
- [ ] **Issue list** — one subsection per REV ID with evidence block and verification table
- [ ] **Issue summary table** with ID, severity, classification, dimension, location, title
- [ ] **Dimension coverage** table and **Mermaid chart**
- [ ] **Files reviewed** table
- [ ] **Verification performed** section with commands and results
- [ ] **Requirements alignment** filled or marked n/a

### Markdown spot-check

Grep the report for evidence backing:

```bash
grep -E "REV-[0-9]|Source:|path:line|\.ts:|\.js:|\.java:|\.py:|\.go:" Task/agents/Advanced/A5/proof/pr-review-report.md
```

Issue entries should contain file path citations near each finding.

---

## Website format checks

Deliverable: `{agentDir}/pr-review-site/`

- [ ] Directory exists; copied from `Task/agents/frontend/` template
- [ ] `Task/agents/frontend/` files were **not** edited
- [ ] `data/pr-review.json` (or equivalent) contains full review data
- [ ] `npm install` completed without errors
- [ ] `npm run build` passes
- [ ] `npm run dev` serves on **http://localhost:3000**
- [ ] Overview shows verdict badge and metadata
- [ ] Issue explorer with filter by dimension, severity, classification
- [ ] Issue detail panels show evidence, suggested fix, verification steps
- [ ] Severity and dimension charts rendered
- [ ] Files reviewed table visible
- [ ] Copy-to-clipboard for REV IDs and citations works
- [ ] UI is responsive (mobile + desktop)
- [ ] No default Next.js placeholder content remains

### Website smoke test

1. Open http://localhost:3000
2. Confirm verdict badge matches report
3. Filter issues by `blocking` — verify count matches metadata
4. Open a REV detail — evidence and suggested fix visible
5. Check verification steps table is populated
6. Verify severity chart totals match findings count

---

## Review quality checks

- [ ] Every **blocking** finding is justified (security, correctness, CI failure, or critical test gap)
- [ ] Every finding includes **actionable suggested fix** (not just "fix this")
- [ ] Every finding includes **at least one verification step**
- [ ] **Agent heuristics** applied when `assumeAgentGenerated: true` (scope creep, hallucinated APIs, test theater flagged if present)
- [ ] **Pre-existing issues** in untouched files listed separately — not counted as REV findings
- [ ] If diff was empty, report states this and execution stopped appropriately

---

## Failure handling

| Failure | Action |
|---------|--------|
| Missing issue list | Re-review diff; add findings or state "no issues found" with evidence of thorough review |
| Finding without suggested fix | Add concrete fix for each REV item |
| Finding without verification | Add at least one verification step per REV item |
| Verdict inconsistent with blocking count | Reconcile — REQUEST CHANGES requires ≥1 blocking |
| Count mismatch in summary table | Reconcile metadata counts with issue list |
| Placeholder data detected | Replace with real findings from diff review |
| Website build fails | Fix errors in `pr-review-site/` only |
| Template was edited | Revert changes to `Task/agents/frontend/` |
| Secrets in report | Redact values; keep location references only |

Do not report success until all applicable checks pass.

---

## Completion message

Tell the user:

1. **Report path** — `Task/agents/Advanced/A5/proof/pr-review-report.md` or `http://localhost:3000`
2. **Verdict** — APPROVE / REQUEST CHANGES / COMMENT with confidence
3. **Headline stats** — e.g. "12 findings: 2 blocking (REV-001, REV-003), 7 non-blocking, 3 advisory; verdict REQUEST CHANGES; 8m 12s"
4. **Must fix** — list blocking REV IDs with one-line titles
5. **How to re-run** — invoke agent again with same or different PR/target/format

Example:

> PR review complete. Report: `Task/agents/Advanced/A5/proof/pr-review-report.md` — reviewed `feature/add-search` → `main`, 18 files changed. Verdict: **REQUEST CHANGES** (confidence: high) — 2 blocking: REV-001 (missing auth on new endpoint), REV-003 (SQL injection in filter). 5 non-blocking, 2 advisory. Baseline tests: PASS. Duration: 8m 12s.

Also print compact summary:

```markdown
## PR Review — {verdict}

| Severity | Blocking | Non-blocking | Advisory |
|----------|----------|--------------|----------|
| critical | {n} | {n} | {n} |
| high     | {n} | {n} | {n} |
| medium   | {n} | {n} | {n} |
| low      | {n} | {n} | {n} |
| info     | {n} | {n} | {n} |

**Must fix:** {REV-IDs or "None"}
**Report:** {outputPath}
```
