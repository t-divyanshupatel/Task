# I3 — Focused Module Change

**Agent name:** `focused-module-change`  
**Tier:** Intermediate (**modifies repo**)  
**Entry point:** [`agent/agent.md`](./agent/agent.md)

---

## Purpose

Makes a **small, focused change** in an **unfamiliar module**:

1. Pick a module not yet deeply explored
2. Define one minimal behavior change or fix
3. Add or update a **relevant test**
4. Keep diff surgical (≤3 prod files, ≤50 lines ideal)
5. Run narrowest real test command
6. Document diff, risk, agent vs manual verification

Unlike Basics agents, I3 **edits production and test code** in the target repo (does not commit unless asked).

---

## When to use

- Prove agent can make safe, tested changes in unknown code
- Small bug fix or guard in one package
- Add missing test coverage for one function
- Training / evaluation scenarios

**Example invocation:**

```
/intermediate-focused-module-change on Task/medusa — markdown output
```

---

## How to run in Cursor

```
/intermediate-focused-module-change

Analyze Task/medusa. Output format: markdown.
```

### Phase 1 — Planning ([`agent/planning.md`](./agent/planning.md))

| Question | Options |
|----------|---------|
| Repository path | Workspace **or** custom |
| Change scope | User-specified **or** agent selects |
| Output format | **Markdown** or **Website** |

### Phase 2 — Execute ([`agent/execute.md`](./agent/execute.md))

1. Recon repo; pick unfamiliar module
2. Document module map and entry points
3. Define change + acceptance criteria
4. Write/update test (TDD when practical)
5. Implement minimal production diff
6. Run test command; capture output
7. Risk assessment + rollback notes
8. Write report to `proof/`

### Phase 3 — Verify ([`agent/verify.md`](./agent/verify.md))

Test required; real command output; diff scope justified if large.

---

## Outputs

| Format | Path |
|--------|------|
| **Markdown** | `Task/agents/Intermediate/I3/proof/focused-module-change-report.md` |
| **Website** | `Task/agents/Intermediate/I3/agent/focused-change-site/` → http://localhost:3000 |

### Report includes

- Module selection rationale ("unfamiliar")
- Files changed + diff stats
- Why each file was touched
- Test command and PASS/FAIL output
- Risk assessment (low/medium/high)
- Agent verified vs manual verification checklist
- Rollback instructions

---

## Constraints

- **Minimal diff** — no drive-by refactors
- **Test required** every run
- **Do not commit** unless user asks
- Report in `proof/`; code changes in target repo
- Mark gaps as `[NEEDS CLARIFICATION]`

---

## Cursor skill

| Slash command | Skill file |
|---------------|------------|
| `/intermediate-focused-module-change` | `.cursor/skills/intermediate-focused-module-change/SKILL.md` |

---

## File layout

```
Intermediate/I3/
├── README.md
├── agent/
│   ├── agent.md
│   ├── planning.md
│   ├── execute.md
│   └── verify.md
└── proof/
    └── focused-module-change-report.md    ← sample (auth utils)
```

---

## Sample outcome

> Module: `packages/modules/auth/src/utils/`. Change: reject empty verification tokens in `hashVerificationToken`. Test: expanded `verification-token.spec.ts`. Result: PASS via tsx harness (Jest blocked — no node_modules).
