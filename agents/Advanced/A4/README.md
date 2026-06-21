# A4 — Repo Modernizer

**Agent name:** `repo-modernizer`  
**Tier:** Advanced (**modifies repo** — one step)  
**Entry point:** [`agent/agent.md`](./agent/agent.md)

---

## Purpose

Analyzes a repository for **modernization opportunities**, prioritizes them, and **implements exactly one** highest-value, lowest-risk first step:

| Category | Examples |
|----------|----------|
| Dependencies | Outdated packages, security advisories |
| Security | Hardcoded secrets, weak configs |
| CI/CD | Missing caches, slow pipelines |
| Code quality | Lint gaps, dead code |
| Type safety | Strict mode, missing types |
| Testing | Coverage holes, flaky patterns |
| Architecture | God classes, circular deps |
| Performance | Obvious hot paths |
| Documentation | Stale README, missing ADRs |
| Tooling | Build tool upgrades |

Delivers full findings backlog + implemented step + verification + rollback notes.

---

## When to use

- Technical debt assessment with actionable first step
- Dependency upgrade planning
- "What should we modernize first?"
- Safe incremental improvement (one PR-sized change)

**Example invocation:**

```
/advance-repo-modernizer on Task/medusa — markdown output
```

---

## How to run in Cursor

```
/advance-repo-modernizer

Analyze Task/medusa. Output format: markdown.
```

### Phase 1 — Planning ([`agent/planning.md`](./agent/planning.md))

| Question | Options |
|----------|---------|
| Repository path | Workspace **or** custom |
| Output format | **Markdown** or **Website** |

Optional: focus area (deps, CI, security only).

### Phase 2 — Execute ([`agent/execute.md`](./agent/execute.md))

1. Recon stack, CI, dependency files
2. Scan for opportunities (evidence: `path:line`, config keys)
3. Score and rank findings (value × risk)
4. Implement **#1 only** — minimal reversible change
5. Verify (build, test, or lint)
6. Document rollback
7. Write report

### Phase 3 — Verify ([`agent/verify.md`](./agent/verify.md))

One implementation only; verification output attached; rollback documented.

---

## Outputs

| Format | Path |
|--------|------|
| **Markdown** | `Task/agents/Advanced/A4/proof/modernization-report.md` |
| **Website** | `Task/agents/Advanced/A4/agent/modernization-site/` → http://localhost:3000 |

### Report includes

- Findings table with evidence citations
- Prioritized plan (ranked + Mermaid chart)
- First step implemented (diff summary, why this one)
- Verification command output
- Rollback procedure
- Backlog for remaining items

---

## Constraints

- **One implementation per run** — rest go to backlog
- **Surgical, reversible** changes only
- **Do not commit** unless user asks
- Every finding must cite file/config — no invented CVEs
- Report in `proof/`

---

## Cursor skill

| Slash command | Skill file |
|---------------|------------|
| `/advance-repo-modernizer` | `.cursor/skills/advance-repo-modernizer/SKILL.md` |

---

## File layout

```
Advanced/A4/
├── README.md
├── agent/
│   ├── agent.md
│   ├── planning.md
│   ├── execute.md
│   └── verify.md
└── proof/
    └── modernization-report.md
```

---

## Scoring rubric (typical)

| Priority | Value | Risk | Example |
|----------|-------|------|---------|
| P0 | High | Low | Pin vulnerable dep with patch release |
| P1 | High | Medium | Enable strict TypeScript in one package |
| P2 | Medium | Low | Add missing CI cache |
| Defer | Low | High | Major framework migration |
