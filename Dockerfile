FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /code

COPY backend/ .
RUN pip install --no-cache-dir -r requirements.txt
RUN echo "--- Checking structure ---" && ls -la app/ && ls -la app/models/ && echo "--- Done ---"

CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
