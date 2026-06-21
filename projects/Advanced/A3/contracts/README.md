# Data contract — A3 fraud score system

All three components exchange JSON matching these schemas.

## Flow

```
Client  ──POST /transactions──►  FastAPI (pending)
                                      │
Node worker ◄──GET /transactions/pending──┘
     │
     ├── stdin JSON ──►  Rust CLI (fraud-scorer)
     │                        │
     │◄── stdout JSON ────────┘
     │
     └──POST /transactions/{id}/score──►  FastAPI (scored)
```

## Transaction ingest (`TransactionIngest`)

Used by: FastAPI request body, Rust CLI stdin, worker pipe.

```json
{
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-42",
  "amount": 12500.0,
  "currency": "USD",
  "merchant_category": "crypto",
  "country_code": "NG",
  "device_id": "device-abc123",
  "timestamp": "2026-06-21T12:00:00Z"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `transaction_id` | UUID string | Client-generated or server-assigned |
| `user_id` | string | Account identifier |
| `amount` | number | Must be > 0 |
| `currency` | string | ISO 4217 (3 letters) |
| `merchant_category` | enum | See schema |
| `country_code` | string | ISO 3166-1 alpha-2 |
| `device_id` | string | Device fingerprint |
| `timestamp` | ISO 8601 | UTC recommended |

## Score result (`FraudScoreResult`)

Used by: Rust CLI stdout, worker → API `POST .../score`.

```json
{
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
  "risk_score": 90.0,
  "risk_level": "high",
  "reasons": ["high_amount", "high_risk_category", "high_risk_country"]
}
```

| Field | Type | Notes |
|-------|------|-------|
| `risk_score` | 0–100 | Sum of rule weights, capped |
| `risk_level` | `low` / `medium` / `high` | 0–33 / 34–66 / 67–100 |
| `reasons` | string[] | Rule codes that fired |

## Scoring rules (Rust)

| Rule code | Condition | Points |
|-----------|-----------|--------|
| `high_amount` | amount ≥ 10,000 | +30 |
| `elevated_amount` | amount ≥ 5,000 | +15 |
| `high_risk_category` | gambling, crypto, wire_transfer | +35 |
| `high_risk_country` | country ∉ {US, CA, GB, DE, FR, AU} | +25 |
