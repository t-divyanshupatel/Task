# Phase 3 — Verify

Run after [execute.md](./execute.md) deliverable is written, measurements recorded, and behavior checks completed. Fix any failing checks before telling the user the task is complete.

---

## Universal checks (both formats)

- [ ] Planning MCQ completed — `repoPath` and `outputFormat` were confirmed
- [ ] **Agent name** `perf-bottleneck-optimizer` appears in deliverable metadata
- [ ] **Started at**, **Completed at**, **Duration** present
- [ ] **Repository** path matches user input
- [ ] **Target selection** documented with path and rationale
- [ ] **Baseline measurement** present with method, command, iterations, and numeric results
- [ ] **Profiling** section present with tool, command, and hotspot findings
- [ ] Every hotspot has **evidence** (`path:line`, profile %, or command output)
- [ ] **Bottleneck explanation** is concise and tied to profile data
- [ ] **Code change** section present (or "analysis-only" noted)
- [ ] **After measurement** uses the **same method** as baseline
- [ ] **Improvement delta** shown with real numbers (not placeholder)
- [ ] **Behavior verification** with command(s), exit code, and result
- [ ] **Rollback notes** with undo steps for implemented change
- [ ] **Discovery notes** include files examined, exclusions, and backlog
- [ ] **No conflict markers** or placeholder data (`Example`, `TODO`, `xxx ms`) in deliverable
- [ ] **Template unchanged** — `Task/agents/frontend/` was not modified (website format only)
- [ ] Fix is **minimal** — no unrelated refactors in `repoPath`

---

## Measurement quality checks

- [ ] Baseline and after use **identical** harness, input size, and environment
- [ ] At least **one latency or throughput metric** has before and after values
- [ ] Improvement percentage or delta is **arithmetically correct**
- [ ] Raw command or output excerpt included for credibility
- [ ] If improvement is negligible (&lt; 5%), report says so honestly or documents rollback

---

## Profiling quality checks

- [ ] Named profiler tool (not just "I think it's slow")
- [ ] Top hotspot ranked with time share or cumulative time
- [ ] Profile finding maps to the code change (fix targets #1 hotspot)
- [ ] Chart or table visualization present (Mermaid or site chart)

---

## Markdown format checks

Deliverable: `{proofDir}/performance-optimization-report.md`

- [ ] File exists at `Task/agents/Advanced/A6/proof/performance-optimization-report.md`
- [ ] Metadata table includes target, improvement summary, behavior verification status
- [ ] **Executive summary** paragraph present
- [ ] **Target selection** table with candidates considered
- [ ] **Baseline measurement** table with method and results
- [ ] **Profiling hotspots** table with rank and evidence
- [ ] **Mermaid chart** for hotspots or before/after comparison
- [ ] **Bottleneck explanation** section present
- [ ] **Code change** with files modified and diff summary
- [ ] **After measurement** comparison table (baseline vs after vs delta)
- [ ] **Before/after bar chart** (Mermaid xychart-beta or equivalent)
- [ ] **Behavior verification** table with output excerpt
- [ ] **Rollback notes** with git or manual undo commands
- [ ] **Additional bottlenecks backlog** in discovery notes

### Markdown spot-check

Grep the report for evidence backing:

```bash
grep -E "\.ts:|\.js:|\.py:|\.go:|\.java:|ms|ops/s|%|PERF-|profile|benchmark" Task/agents/Advanced/A6/proof/performance-optimization-report.md
```

Measurement and hotspot tables should contain numeric values and file path citations.

---

## Website format checks

Deliverable: `{agentDir}/performance-site/`

- [ ] Directory exists; copied from `Task/agents/frontend/` template
- [ ] `Task/agents/frontend/` files were **not** edited
- [ ] `data/performance-report.json` (or equivalent) contains full analysis data
- [ ] `npm install` completed without errors
- [ ] `npm run build` passes
- [ ] `npm run dev` serves on **http://localhost:3000**
- [ ] Overview shows metadata, summary, and improvement stats cards
- [ ] Before/after comparison chart visible with real numbers
- [ ] Baseline and after measurement panels present
- [ ] Profiling hotspot table or chart visible
- [ ] Bottleneck explanation with code citations
- [ ] Code change panel with diff summary
- [ ] Behavior verification panel with pass/fail status
- [ ] Rollback section with copy-to-clipboard commands
- [ ] UI is responsive (mobile + desktop)
- [ ] No default Next.js placeholder content remains

### Website smoke test

1. Open http://localhost:3000
2. Confirm target name and repo match analysis
3. Verify before/after chart shows baseline &gt; after (for latency) or after &gt; baseline (for throughput)
4. Open profiling section — confirm top hotspot matches code change
5. Check behavior verification badge matches report status
6. Copy a rollback command — verify it matches the markdown report

---

## Implementation checks (when `allowCodeChange: true`)

- [ ] Exactly **one** bottleneck was fixed
- [ ] Change is **reversible** and documented in rollback notes
- [ ] Fix touches **≤ 3 files** unless justified in discovery notes
- [ ] At least one **behavior check** passed after the change
- [ ] After measurement shows measurable improvement OR honest failure documented
- [ ] If fix regressed behavior or performance, rollback is recorded

---

## Failure handling

| Failure | Action |
|---------|--------|
| No baseline numbers | Re-run benchmark harness; record method and output |
| No profiling data | Run stack-appropriate profiler; add hotspot table |
| Fix doesn't improve metrics | Rollback; try next minimal fix or report honestly |
| No behavior verification | Run existing tests or add output-equivalence check |
| Placeholder metrics detected | Replace with real benchmark output |
| Different before/after methods | Re-run after with identical harness |
| Website build fails | Fix errors in `performance-site/` only |
| Template was edited | Revert changes to `Task/agents/frontend/` |
| Change too large | Narrow to single hotspot fix; move rest to backlog |

Do not report success until all applicable checks pass.

---

## Completion message

Tell the user:

1. **Report path** — `Task/agents/Advanced/A6/proof/performance-optimization-report.md` or `http://localhost:3000`
2. **Headline stats** — e.g. "export-users.ts: 85% faster (842ms → 126ms); tests pass; 11m 04s"
3. **Bottleneck** — one-line root cause
4. **Files changed** — list with brief summary
5. **Rollback summary** — one-line undo command
6. **How to re-run** — invoke agent again for next backlog item or different repo/format

Example:

> Performance optimization complete. Report: `Task/agents/Advanced/A6/proof/performance-optimization-report.md` — `scripts/export-users.ts` was spending 62% of time in per-row `JSON.parse`; hoisted parse outside loop → **85% faster** mean latency (842ms → 126ms). `npm test` passed (142 tests). Rollback: `git checkout -- scripts/export-users.ts`. Next bottleneck: `writeFile` (~18% profile share). Duration: 11m 04s.
