# Currency Converter API (Docker)

Containerized FastAPI currency converter. Multi-stage Docker image with `docker compose` orchestration and built-in health checks.

Based on the currency converter from `Task/Intermediate/I4`, packaged for production-style deployment.

## Layout

```
Task/Intermediate/I5/
├── README.md
├── docker-compose.yml
└── service/
    ├── Dockerfile          # multi-stage build
    ├── requirements.txt
    ├── app/
    └── tests/
```

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/currencies` | List supported currency codes |
| `POST` | `/convert` | Convert an amount between currencies |

Supported currencies: `USD`, `EUR`, `GBP`, `INR`, `JPY`.

---

## Docker (recommended)

### Build and run with Compose

```bash
cd Task/Intermediate/I5
docker compose up --build -d
```

### Build image only

```bash
cd Task/Intermediate/I5/service
docker build -t currency-converter-api .
```

### Run container manually

```bash
docker run --rm -p 8000:8000 --name currency-api currency-converter-api
```

### Health check and API proof

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/currencies
curl -X POST http://127.0.0.1:8000/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from": "USD", "to": "EUR"}'
```

Expected health response:

```json
{"status":"ok"}
```

Expected convert response:

```json
{"amount":100,"from":"USD","to":"EUR","result":92.0,"rate":0.92}
```

### Inspect container health

```bash
docker compose ps
docker inspect --format='{{json .State.Health}}' i5-currency-api-1
```

Compose and the image `HEALTHCHECK` both poll `GET /health` every 10 seconds.

### Stop

```bash
docker compose down
```

Automated verification (requires Docker):

```bash
./scripts/docker-verify.sh
```

---

## Local development (without Docker)

```bash
cd Task/Intermediate/I5/service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Tests

```bash
cd Task/Intermediate/I5/service
source .venv/bin/activate
pytest -v
```
