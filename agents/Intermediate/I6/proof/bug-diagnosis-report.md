# Bug Diagnosis Report

## Metadata

| Field | Value |
|-------|-------|
| **Agent name** | repo-seeded-bug-diagnosis |
| **Started at** | 2026-06-22T10:15:00Z |
| **Completed at** | 2026-06-21T21:22:57Z |
| **Duration** | -46322s |
| **Repository** | Task/medusa |
| **Repo name** | Medusa |
| **Branch** | current branch (uncommitted) |
| **Stack detected** | TypeScript monorepo — Yarn 3 workspaces, Jest, MikroORM, Medusa v2 commerce modules |
| **Symptom** | Order cancel credits wrong total when multiple payments exist (canceled/pending + partial capture) |
| **Root cause file** | `packages/core/core-flows/src/order/workflows/cancel-order.ts` (historical; fixed in current tree) |
| **Fix status** | BLOCKED — bug not reproducible; upstream already contains fix |
| **Verification result** | NOT RUN (deps install failed) |

## Summary

Discovery searched `Task/medusa` for seeded-bug signals (`BUG.md`, `SEEDED BUG`, failing tests). No explicit seed marker was found. The strongest candidate is a **regression integration test** at `integration-tests/http/__tests__/order/admin/order-cancel-credit-line.spec.ts` that documents historical bug behavior: canceling an order with multiple payment sessions incorrectly credited **all payment amounts** instead of **only captured amounts**.

Static code review of `cancel-order.ts` and `refund-captured-payments.ts` shows the current implementation filters to captured payments and computes credit lines from **refund deltas only** — matching expected behavior. **No minimal fix was applied** because the defect is not present in the current source tree.

Automated reproduction was **blocked**: `node_modules` is absent and `yarn install` failed with TLS certificate errors (`UNABLE_TO_GET_ISSUER_CERT_LOCALLY`).

## Expected vs actual

| | Description |
|---|-------------|
| **Expected** | When canceling an order with 1 partial capture ($50) plus canceled/pending payment sessions, credit lines total **50** (captured amount only). |
| **Actual (before fix — documented bug behavior)** | Credit line would sum **all** payment amounts (50 + authorized + canceled + pending) per test comment at `order-cancel-credit-line.spec.ts:153-160`. |
| **Actual (current tree — static analysis)** | `refundCapturedPaymentsWorkflow` refunds only `capturedAmount - refundedAmount` per payment; `creditLineAmount` uses `totalRefundedAfter - totalRefundedBefore` delta — should produce **50** only. |
| **Symptom source** | inferred (integration test regression guard) |

## Reproduction steps

1. `cd Task/medusa`
2. Install dependencies: `yarn install` (requires Node ≥20 per package engines; repo uses Yarn 3.2.1 via Corepack)
3. Run the regression integration test:
   ```bash
   cd integration-tests/http
   yarn test:integration -- __tests__/order/admin/order-cancel-credit-line.spec.ts -t "should only include captured payment amounts"
   ```
4. Prerequisites: PostgreSQL test DB (Medusa integration test runner spins up via `@medusajs/test-utils`), admin user seeding, tax structure fixture.

### Reproduction command

```bash
cd Task/medusa/integration-tests/http && yarn test:integration -- __tests__/order/admin/order-cancel-credit-line.spec.ts -t "should only include captured payment amounts"
```

### Before-fix output

```
➤ YN0001: RequestError: unable to get local issuer certificate
➤ YN0000: Failed with errors in 18s 492ms

(node_modules absent — yarn install could not complete; integration test not executed)
```

### Reproduction result

**blocked** — dependency installation failed (TLS); integration test not run.

## Root cause

### Explanation

The documented defect occurs when order-cancel logic credits customers based on **payment session amounts** (authorized, canceled, or pending) rather than **captured capture amounts**. In a multi-payment-intent checkout flow, failed or pending payment sessions inflate the credit line total on cancel, breaking order summary accounting (`credit_line_total`, `current_order_total`).

The current `cancel-order` workflow delegates refund amounts to `refundCapturedPaymentsWorkflow`, which filters `payments.filter((payment) => payment.captures?.length)` and sums capture records only. Credit lines are then created from the **incremental refund amount** produced during cancel, not from raw payment amounts.

### Primary defect

| Field | Value |
|-------|-------|
| **File** | `packages/core/core-flows/src/order/workflows/cancel-order.ts` |
| **Line(s)** | 206–234 (credit line amount transform); delegates to `refund-captured-payments.ts:59–84` |
| **Defect type** | logic (historical — summing non-captured payment amounts into credit line) |

### Defective code (before — inferred from test comments)

```typescript
// Historical bug pattern (NOT present in current tree):
// creditLineAmount = payments.reduce((sum, p) => sum + p.amount, 0)
// Would include canceled + pending + captured payment session amounts
```

**Source:** `integration-tests/http/__tests__/order/admin/order-cancel-credit-line.spec.ts:151-161`

### Call path

| # | Location | Role |
|---|----------|------|
| 1 | `packages/medusa/src/api/admin/orders/[id]/cancel/route.ts` | POST `/admin/orders/:id/cancel` handler |
| 2 | `packages/core/core-flows/src/order/workflows/cancel-order.ts:133` | `cancelOrderWorkflow` orchestration |
| 3 | `packages/core/core-flows/src/order/workflows/payments/refund-captured-payments.ts:59` | Filter captured payments only |
| 4 | `packages/core/core-flows/src/order/workflows/cancel-order.ts:206` | Compute `creditLineAmount` from refund delta |
| 5 | `packages/core/core-flows/src/order/workflows/payments/create-order-refund-credit-lines.ts:34` | Create credit line order change |

### Current fixed code (after — present in tree)

```typescript
const capturedPayments = payments.filter(
  (payment) => payment.captures?.length
)
// ... amountToRefund = capturedAmount - refundedAmount per payment

const creditLineAmount = transform(
  { order, refundedPaymentIds, refundedPaymentRefundsQuery },
  ({ order, refundedPaymentIds, refundedPaymentRefundsQuery }) => {
    // ...
    return MathBN.sub(totalRefundedAfter, totalRefundedBefore)
  }
)
```

**Source:** `packages/core/core-flows/src/order/workflows/payments/refund-captured-payments.ts:59-84`, `packages/core/core-flows/src/order/workflows/cancel-order.ts:206-234`

## Minimal fix

### Rationale

No fix applied — current source already implements captured-only refund and delta-based credit line calculation. Applying a change would be unnecessary and risk regressions.

### Files changed

| # | File | Change |
|---|------|--------|
| — | — | No changes (bug not present in current tree) |

### Diff

```diff
(no diff — fix already present)
```

## Verification

### Command

```bash
cd Task/medusa/integration-tests/http && yarn test:integration -- __tests__/order/admin/order-cancel-credit-line.spec.ts
```

### Exit code

Not run (blocked)

### After-fix output

```
Verification not executed — yarn install failed:
  RequestError: unable to get local issuer certificate
Static code review indicates fix is present; human should run integration test after successful yarn install.
```

### Before vs after

| Check | Before (historical bug) | After (current tree — static) |
|-------|-------------------------|-------------------------------|
| Credit line on multi-payment cancel | Would credit all payment amounts | Should credit captured-only refund delta |
| Integration test | Would FAIL if bug present | Expected PASS (not run) |
| Exit code | unknown | NOT RUN |

### Interpretation

Static analysis supports that the documented bug is **already fixed** in this tree. Automated verification requires `yarn install` + PostgreSQL integration test environment.

## Agent suggested vs manually verified

| Item | Agent suggested / verified | Manually verified |
|------|---------------------------|-------------------|
| Bug is reproduced | no — blocked by deps install | pending |
| Root cause is correct | yes — static trace + test documentation (`order-cancel-credit-line.spec.ts:160`) | pending |
| Fix is minimal and targeted | n/a — no fix needed in current tree | pending |
| Verification command proves fix | no — command not run (TLS blocked install) | pending |
| No unrelated files changed | yes — zero files modified | pending |
| Safe to merge | n/a — no changes made | pending |

### What the agent verified

- Searched repo for `SEEDED BUG`, `BUG.md`, `KNOWN_ISSUES`, `.only` tests — none found
- Located regression test documenting bug behavior at `integration-tests/http/__tests__/order/admin/order-cancel-credit-line.spec.ts`
- Traced cancel flow through `cancel-order.ts` → `refund-captured-payments.ts` → `create-order-refund-credit-lines.ts`
- Confirmed `refundCapturedPaymentsWorkflow` filters to payments with captures only
- Attempted `yarn install` — failed with TLS certificate error

### What requires human verification

- Run `yarn install` successfully (fix TLS / corporate proxy if needed)
- Execute `order-cancel-credit-line.spec.ts` integration suite against PostgreSQL
- Confirm all 3 test cases pass (captured-only, no double-count refunds, zero credit when all canceled)
- Review git history for when credit-line delta logic was introduced

## Risk assessment

| Dimension | Rating | Rationale |
|-----------|--------|-----------|
| Blast radius | medium | Order cancel + payment credit lines affect accounting totals |
| Fix confidence | medium | Static analysis only; integration test not run |
| Test confidence | low | Regression test exists but was not executed |
| Regression risk | low | No code changes made |

**Overall risk:** low for this run (no edits) — medium for production if bug were still present in a fork without the fix.

## Discovery notes

### Files examined

- `README.md` — Medusa commerce platform overview
- `package.json` — workspace layout, `test:integration:http` script
- `integration-tests/http/__tests__/order/admin/order-cancel-credit-line.spec.ts` — regression test with bug behavior comments
- `packages/core/core-flows/src/order/workflows/cancel-order.ts` — cancel orchestration + credit line amount
- `packages/core/core-flows/src/order/workflows/payments/refund-captured-payments.ts` — captured-only refund logic
- `packages/core/core-flows/src/order/workflows/payments/create-order-refund-credit-lines.ts` — credit line creation workflow
- `packages/modules/order/package.json` — test scripts, Node ≥20 requirement

### Secondary issues (not fixed)

- `yarn install` TLS failure blocks all automated testing in this environment
- Full Medusa monorepo requires Node ≥20; environment had Node v18.20.8 via nvm

### Ambiguities

- No explicit `SEEDED BUG` marker — symptom inferred from regression test comments
- Unclear if `Task/medusa` was intended to contain an intentionally broken fork vs upstream Medusa (which appears already fixed)

## Known limitations

- `node_modules` absent; `yarn install` failed (`UNABLE_TO_GET_ISSUER_CERT_LOCALLY`)
- Integration tests require PostgreSQL + Medusa test runner — not attempted
- Node v18 detected; Medusa packages require Node ≥20

## Blocked

**Reproduction and verification blocked** by dependency installation failure. No code fix applied because static analysis indicates the documented defect is already resolved in the current source tree.

**Unblock steps for human:**
1. Use Node ≥20
2. Resolve TLS/proxy for `yarn install`
3. Run integration test command above
4. If test fails, inspect `cancel-order.ts` credit line calculation against captured-only filter
