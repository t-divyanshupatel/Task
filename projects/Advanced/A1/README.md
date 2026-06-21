# A1 — Multi-Worktree Parallel Plan

## Goal

Demonstrate **parallel agent supervision** for a **Student Enrollment REST API**: decompose work into isolated git worktrees, assign agent prompts with file ownership, merge in dependency order, and verify without merge chaos.

## Example feature

FastAPI + SQLite service with:

| Method | Route               | Purpose                               |
| ------ | ------------------- | ------------------------------------- |
| POST   | `/students`         | Register a student                    |
| GET    | `/students`         | List students                         |
| POST   | `/enrollments`      | Enroll a student in a course          |
| GET    | `/enrollments`      | List enrollments                      |
| GET    | `/registry/summary` | `{ student_count, enrollment_count }` |

## Requirements checklist

| Requirement             | Location                                                         |
| ----------------------- | ---------------------------------------------------------------- |
| Task decomposition      | [proof/parallel-work-plan.md](proof/parallel-work-plan.md) §1    |
| Worktree / branch names | [proof/parallel-work-plan.md](proof/parallel-work-plan.md) §2    |
| Agent prompt per lane   | [proof/parallel-work-plan.md](proof/parallel-work-plan.md) §3    |
| Shared constraints      | [proof/parallel-work-plan.md](proof/parallel-work-plan.md) §4    |
| Merge order             | [proof/parallel-work-plan.md](proof/parallel-work-plan.md) §5    |
| Conflict / risk plan    | [proof/parallel-work-plan.md](proof/parallel-work-plan.md) §6    |
| Verification plan       | [proof/parallel-work-plan.md](proof/parallel-work-plan.md) §7    |
| Frozen contract         | [proof/enrollment-contract.md](proof/enrollment-contract.md)     |
| 45-min runbook          | [proof/orchestration-runbook.md](proof/orchestration-runbook.md) |

## Project layout

```
A1/
├── proof/
│   ├── enrollment-contract.md      # Frozen API + model contract
│   ├── parallel-work-plan.md       # Full 7-section parallel plan
│   ├── orchestration-runbook.md    # Timed supervisor checklist
│   └── plan-execution-log.txt      # Generated plan validation log
├── scripts/
│   └── capture-proof.sh            # Validate + tee plan proof
└── README.md
```

## Supervisor flow

```
ENROLLMENT_CONTRACT on main
        │
        ├── worktree: feat/student-models   (persistence)
        ├── worktree: feat/enrollment-routes (HTTP)
        └── worktree: feat/enrollment-tests  (QA)
                │
                ▼
        merge: persistence → http → qa
                │
                ▼
        pytest + curl verification
```

## Three parallel lanes

| Worktree dir                  | Branch                   | Owns                                                       |
| ----------------------------- | ------------------------ | ---------------------------------------------------------- |
| `enrollment-api-persistence/` | `feat/student-models`    | `app/models.py`, `database.py`, `config.py`                |
| `enrollment-api-http/`        | `feat/enrollment-routes` | `app/routes/`, `main.py`, `schemas.py`, `requirements.txt` |
| `enrollment-api-qa/`          | `feat/enrollment-tests`  | `tests/`                                                   |

## Regenerate proof

```bash
cd Task/projects/Advanced/A1
chmod +x scripts/capture-proof.sh
./scripts/capture-proof.sh
```

## Proof it works (planning deliverables)

| File                                                             | Contents                                                                         |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [proof/enrollment-contract.md](proof/enrollment-contract.md)     | Frozen Student + Enrollment models and five HTTP routes                          |
| [proof/parallel-work-plan.md](proof/parallel-work-plan.md)       | Decomposition, worktrees, prompts, constraints, merge order, risks, verification |
| [proof/orchestration-runbook.md](proof/orchestration-runbook.md) | 45-minute phased supervisor checklist                                            |
| [proof/plan-execution-log.txt](proof/plan-execution-log.txt)     | Output of `./scripts/capture-proof.sh`                                           |

## Related

- **A2** — executes a **two-lane** worktree merge and ships the merged app under [../A2/sandbox/enrollment-api](../A2/sandbox/enrollment-api/)
- **A3** — polyglot fraud scoring pipeline
