# Container image for the I4 Currency Converter FastAPI service.
# Build from the Intermediate directory (parent of I4 and I5):
#   docker build -f I5/Dockerfile -t currency-converter-api:i5 .

FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

COPY I5/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

COPY I4/service/app ./app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
