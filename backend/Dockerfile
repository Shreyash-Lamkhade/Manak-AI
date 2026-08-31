FROM python:3.11-slim

WORKDIR /backend

# System libraries required by torch / sentence-transformers at runtime.
RUN apt-get update && apt-get install -y --no-install-recommends \
        libgomp1 \
        libopenblas0 \
        gcc \
        g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY scripts ./scripts
COPY data ./data

# Wait for postgres to be ready, then start uvicorn
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000"]
