# A6 — Performance Bottleneck Optimizer

**Agent name:** `perf-bottleneck-optimizer`  
**Tier:** Advanced (**modifies repo**)  
**Entry point:** [`agent/agent.md`](./agent/agent.md)

---

## Purpose

Finds a **real, measurable performance bottleneck** in a small service or script and applies a **minimal targeted fix**:

1. **Baseline** — documented method + numbers
2. **Profile** — hot path evidence (`path:line`)
3. **Explain** — why it's slow
4. **Fix** — one surgical change (no rewrite)
5. **Re-measure** — same harness, show delta
6. **Behavior check** — tests must still pass

---

## When to use

- Script or API endpoint is noticeably slow
- Optimize one hot path without architecture change
- Before/after benchmark evidence needed
- Agent evaluation for performance skills

**Example invocation:**

```
/advance-perf-optimizer on Task/medusa — markdown output
```

---

## How to run in Cursor

```
/advance-perf-optimizer

Analyze Task/medusa. Output format: markdown.
```

### Phase 1 — Planning ([`agent/planning.md`](./agent/planning.md))

| Question | Options |
|----------|---------|
| Repository path | Workspace **or** custom |
| Output format | **Markdown** or **Website** |

Optional: hint at slow module/script.

### Phase 2 — Execute ([`agent/execute.md`](./agent/execute.md))

1. Pick small runnable target with measurable cost
2. Baseline benchmark (repeatable command)
3. Profile (CPU, flame, timing logs, loop count)
4. Identify #1 hotspot
5. Minimal code fix (≤3 files ideal)
6. Re-measure with **identical** harness
7. Run tests / equivalence checks
8. Write report with improvement %

### Phase 3 — Verify ([`agent/verify.md`](./agent/verify.md))

Same measurement method before/after; behavior preserved; one bottleneck only.

---

## Outputs

| Format | Path |
|--------|------|
| **Markdown** | `Task/agents/Advanced/A6/proof/performance-optimization-report.md` |
| **Website** | `Task/agents/Advanced/A6/agent/performance-site/` → http://localhost:3000 |

### Report includes

- Target description (file, function)
- Baseline numbers (latency, throughput, iterations)
- Profiling method and findings
- Bottleneck explanation
- Diff summary
- After numbers + improvement delta
- Test/command proving behavior unchanged
- Rollback steps
- Mermaid: before/after bar chart

---

## Constraints

- **One bottleneck, one fix** per run
- **Same benchmark harness** for before and after
- **No broad rewrites**
- **Behavior preservation required**
- **Do not commit** unless user asks
- Report in `proof/`

---

## Cursor skill

| Slash command | Skill file |
|---------------|------------|
| `/advance-perf-optimizer` | `.cursor/skills/advance-perf-optimizer/SKILL.md` |

---

## File layout

```
Advanced/A6/
├── README.md
├── agent/
│   ├── agent.md
│   ├── planning.md
│   ├── execute.md
│   └── verify.md
└── proof/
    └── performance-optimization-report.md
```

---

## Benchmark examples

| Target type | Baseline method |
|-------------|-----------------|
| Node script | `time node script.js` or autocannon |
| SQL-heavy service | Query count + timed integration test |
| Pure function | Loop N iterations with `performance.now()` |
| API route | autocannon / k6 against local server |

---

## Good vs bad scope

| Good | Bad |
|------|-----|
| O(n²) loop → O(n) with Map | Rewrite entire module |
| Cache repeated DB lookup | Switch ORM |
| Batch inserts | Micro-optimize without measurement |
