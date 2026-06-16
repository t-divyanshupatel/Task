# Currency Converter (FastAPI + Node CLI)

A two-component currency converter: a **FastAPI service** with hardcoded exchange rates and a **Node.js CLI** that calls it.

Supported currencies: `USD`, `EUR`, `GBP`, `INR`, `JPY`.

## Layout

```
Task/Intermediate/I4/
├── README.md
├── service/          # FastAPI API
│   ├── app/
│   └── tests/
└── client/           # Node.js CLI
    ├── src/
    ├── tests/
    └── scripts/
```

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/currencies` | List supported currency codes |
| `POST` | `/convert` | Convert an amount between currencies |

### Convert request

```json
{
  "amount": 100,
  "from": "USD",
  "to": "EUR"
}
```

### Convert response

```json
{
  "amount": 100,
  "from": "USD",
  "to": "EUR",
  "result": 92.0,
  "rate": 0.92
}
```

Rates are hardcoded in `service/app/rates.py` (USD is the base).

---

## Two-terminal run instructions

Use **two terminals** — one for the API, one for the CLI.

### Terminal 1 — start the FastAPI service

```bash
cd Task/Intermediate/I4/service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Leave this running. Docs: http://127.0.0.1:8000/docs

Quick check:

```bash
curl -X POST http://127.0.0.1:8000/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from": "USD", "to": "EUR"}'
```

### Terminal 2 — run the Node.js CLI

```bash
cd Task/Intermediate/I4/client
npm install
npm run convert -- 100 USD EUR
```

Other examples:

```bash
npm run convert -- --amount 50 --from GBP --to INR
npm run convert -- 1000 usd jpy
```

Override the API URL if needed:

```bash
CONVERT_API_URL=http://127.0.0.1:8000 npm run convert -- 25 EUR USD
```

Expected output:

```
100 USD = 92 EUR (rate: 0.92)
```

---

## Tests

### Service (pytest)

```bash
cd Task/Intermediate/I4/service
source .venv/bin/activate
pytest -v
```

### Client (vitest — unit tests with mocked HTTP)

```bash
cd Task/Intermediate/I4/client
npm test
```

### Client live verification (requires API running in Terminal 1)

```bash
cd Task/Intermediate/I4/client
npm run verify
```

---

## Input validation

**Service (Pydantic + domain checks)**

- `amount` must be greater than 0
- `from` and `to` must be 3-letter codes (case-insensitive)
- Unknown currencies return `400` with a clear error message

**CLI (pre-flight checks)**

- Validates positive numeric `amount`
- Validates `from` / `to` against the same supported currency set
- Prints usage help on validation or API errors
