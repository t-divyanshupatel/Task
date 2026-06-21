# I6 — Repo Seeded Bug Diagnosis

**Agent name:** `repo-seeded-bug-diagnosis`  
**Tier:** Intermediate (**modifies repo**)  
**Entry point:** [`agent/agent.md`](./agent/agent.md)

---

## Purpose

Behaves like **on-call debugging** for an unfamiliar repo with a known or suspected bug:

1. **Reproduce** — exact steps + captured failure output
2. **Root cause** — file paths and line citations (not guesses)
3. **Minimal fix** — smallest correct diff
4. **Verify** — before/after command output
5. **Report** — agent verified vs human must confirm

Designed for evaluation scenarios where a bug was intentionally seeded, but works for real symptoms too.

---

## When to use

- "This test fails — find and fix it"
- Seeded bug exercises for agent evaluation
- Production-like incident with a symptom description
- Regression after a merge

**Example invocation:**

```
/intermediate-seeded-bug-diagnosis on Task/medusa
Symptom: verification token hash accepts empty string
```

---

## How to run in Cursor

```
/intermediate-seeded-bug-diagnosis

Analyze Task/medusa. Symptom: verification token hash accepts empty string. Markdown output.
```

### Phase 1 — Planning ([`agent/planning.md`](./agent/planning.md))

| Question | Options |
|----------|---------|
| Repository path | Workspace **or** custom |
| **Symptom / hint** | Description of failure (required) |
| Output format | **Markdown** or **Website** |

### Phase 2 — Execute ([`agent/execute.md`](./agent/execute.md))

1. Recon stack and test layout
2. Reproduce bug — **no fixes until reproduced** (or document blocker)
3. Trace root cause with citations
4. Apply minimal fix
5. Re-run verification command
6. Write report

### Phase 3 — Verify ([`agent/verify.md`](./agent/verify.md))

Reproduction documented; fix tied to root cause; verification output included.

---

## Outputs

| Format | Path |
|--------|------|
| **Markdown** | `Task/agents/Intermediate/I6/proof/bug-diagnosis-report.md` |
| **Website** | `Task/agents/Intermediate/I6/agent/bug-diagnosis-site/` → http://localhost:3000 |

### Report includes

- Reproduction steps + before-fix output
- Root cause analysis (file:line)
- Diff / patch summary
- Verification command — before vs after
- Classification (assertion, env, dependency, logic)
- Agent vs manual verification split
- Recommended next steps

---

## Constraints

- **Reproduce before fixing**
- **Minimal fix** — no unrelated changes
- **Do not commit** unless user asks
- Report in `proof/`; fixes in target repo
- Honest about blocked reproduction (missing deps, env)

---

## Cursor skill

| Slash command | Skill file |
|---------------|------------|
| `/intermediate-seeded-bug-diagnosis` | `.cursor/skills/intermediate-seeded-bug-diagnosis/SKILL.md` |

---

## File layout

```
Intermediate/I6/
├── README.md
├── agent/
│   ├── agent.md
│   ├── planning.md
│   ├── execute.md
│   └── verify.md
└── proof/
    └── bug-diagnosis-report.md
```

---

## vs I3 (Focused Module Change)

| | I3 | I6 |
|---|----|----|
| Trigger | Agent picks improvement | Symptom / seeded bug |
| First step | Define change | Reproduce failure |
| Goal | Small feature/fix + test | Root cause + fix |
| Evaluation | Unfamiliar module exploration | Debugging skill |
