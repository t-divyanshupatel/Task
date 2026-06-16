# Transaction Ledger API (Node.js)

Small Express service that records deposits and withdrawals and exposes the current balance. Node.js counterpart to the FastAPI version in `Task/Basics/B4`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/transactions` | Create a deposit or withdrawal |
| `GET` | `/transactions` | List all transactions |
| `GET` | `/balance` | Current balance and transaction count |
| `GET` | `/health` | Health check for Docker and load balancers |

### Example

```bash
curl -X POST http://127.0.0.1:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "type": "deposit", "description": "Initial funding"}'

curl http://127.0.0.1:3000/transactions
curl http://127.0.0.1:3000/balance
```

## Install

```bash
cd Task/Basics/B5
npm install
```

## Run

```bash
npm start
```

For auto-reload during development:

```bash
npm run dev
```

The server listens on http://127.0.0.1:3000 by default. Override with `PORT` and `HOST` env vars.

## Test

```bash
npm test
```

## Docker

Build the image:

```bash
cd Task/Basics/B5
docker build -t transaction-ledger-api .
```

Run the container (maps host port 3000 to the API):

```bash
docker run --rm -p 3000:3000 --name ledger-api transaction-ledger-api
```

Health check and sample API calls:

```bash
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:3000/balance
curl -X POST http://127.0.0.1:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "type": "deposit", "description": "Docker test"}'
```

The image sets `HOST=0.0.0.0` so the server accepts connections from outside the container. Docker `HEALTHCHECK` polls `GET /health` every 10 seconds.

Automated verification (requires Docker):

```bash
./scripts/docker-verify.sh
```
