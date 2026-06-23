#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:8000}"

echo "Verifying container at ${BASE_URL}"

health=$(curl -sf "${BASE_URL}/health")
echo "GET /health -> ${health}"
test "${health}" = '{"status":"ok"}'

rates=$(curl -sf "${BASE_URL}/rates")
echo "GET /rates -> OK (${#rates} bytes)"

convert=$(curl -sf -X POST "${BASE_URL}/convert" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from_currency": "USD", "to_currency": "EUR"}')
echo "POST /convert -> ${convert}"
echo "${convert}" | grep -q '"converted_amount":92.0'

echo "All Docker verification checks passed."
