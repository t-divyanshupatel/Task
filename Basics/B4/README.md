# Transaction Ledger API

Small FastAPI service that records deposits and withdrawals and exposes the current balance.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/transactions` | Create a deposit or withdrawal |
| `GET` | `/transactions` | List all transactions |
| `GET` | `/balance` | Current balance and transaction count |

### Example

```bash
curl -X POST http://127.0.0.1:8000/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "type": "deposit", "description": "Initial funding"}'

curl http://127.0.0.1:8000/transactions
curl http://127.0.0.1:8000/balance
```

## Install

```bash
cd Task/Basics/B4
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open interactive docs at http://127.0.0.1:8000/docs

## Test

```bash
pytest -v
```
