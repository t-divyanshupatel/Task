# A5 — PR Review

**Agent name:** `pr-review`  
**Tier:** Advanced (read-only by default)  
**Entry point:** [`agent/agent.md`](./agent/agent.md)

---

## Purpose

Structured review of a **pull request** (especially agent-generated PRs) across five dimensions:

1. **Correctness** — logic, edge cases, error handling
2. **Security** — injection, auth, secrets, OWASP
3. **Tests** — coverage of changed behavior, missing cases
4. **Performance** — N+1, unnecessary allocations, hot paths
5. **Maintainability** — naming, scope, duplication

Each issue gets **severity**, **blocking vs non-blocking**, **suggested fix**, and **verification steps**. Final **merge verdict**: APPROVE / REQUEST CHANGES / COMMENT.

---

## When to use

- Review AI-generated PR before merge
- Second opinion on a large diff
- Security-focused pass on a feature branch
- Standardize review output for team process

**Example invocation:**

```
/advance-pr-review
Review branch feature/auth-fix vs main in Task/medusa
```

---

## How to run in Cursor

```
/advance-pr-review

Review branch feature/auth-fix vs main in Task/medusa. Markdown output.
```

### Phase 1 — Planning ([`agent/planning.md`](./agent/planning.md))

| Question | Options |
|----------|---------|
| Review target | PR URL, branch name, or uncommitted diff |
| Repository path | Workspace **or** custom |
| Output format | **Markdown** or **Website** |

Optional: focus (security-only), ticket/PRD link.

### Phase 2 — Execute ([`agent/execute.md`](./agent/execute.md))

1. Acquire full diff (`git diff`, `gh pr diff`)
2. Read PR metadata, commits, changed files
3. Review each hunk against five dimensions
4. Assign issue IDs (REV-001, …)
5. Verdict + merge readiness summary
6. Write report

### Phase 3 — Verify ([`agent/verify.md`](./agent/verify.md))

Every issue cites diff hunk or `path:line`; secrets redacted; verdict present.

---

## Outputs

| Format | Path |
|--------|------|
| **Markdown** | `Task/agents/Advanced/A5/proof/pr-review-report.md` |
| **Website** | `Task/agents/Advanced/A5/agent/pr-review-site/` → http://localhost:3000 |

### Report includes

- PR metadata (author, files changed, lines +/-)
- Executive summary + verdict
- Issue list table (ID, severity, blocking, category)
- Per-issue: evidence, suggested fix, verification steps
- Must-fix vs nice-to-have counts
- Mermaid: issues by severity/category

---

## Severity levels

| Level | Meaning |
|-------|---------|
| **Critical** | Security exploit, data loss, production break |
| **High** | Incorrect behavior, missing auth |
| **Medium** | Edge case, weak test coverage |
| **Low** | Style, minor maintainability |
| **Info** | Suggestion, not required |

**Blocking** = must fix before merge.

---

## Constraints

- **Read-only by default** — no code edits unless user asks to apply fixes
- **Redact secrets** — report location only, never paste values
- Evidence from diff only — no invented issues
- Report in `proof/`

---

## Cursor skill

| Slash command | Skill file |
|---------------|------------|
| `/advance-pr-review` | `.cursor/skills/advance-pr-review/SKILL.md` |

Use `gh pr view` / `gh pr diff` when a PR URL is provided.

---

## File layout

```
Advanced/A5/
├── README.md
├── agent/
│   ├── agent.md
│   ├── planning.md
│   ├── execute.md
│   └── verify.md
└── proof/
    └── pr-review-report.md
```

---

## Example verdict block

> **Verdict: REQUEST CHANGES** — 2 blocking (REV-001 missing null check, REV-004 secret in diff), 5 non-blocking. Re-run auth integration tests after fixes.
