# RoadGuard AI - Production Dockerfile for Railway / Cloud Deployment
FROM python:3.11-slim

# Prevent Python from writing .pyc and buffer stdout/stderr
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    DATABASE_URL=sqlite:////app/data/roadguard.db \
    UPLOAD_DIR=/app/uploads \
    OUTPUT_DIR=/app/outputs \
    MODEL_PATH=/app/artifacts/models/best.pt \
    METRICS_PATH=/app/artifacts/metrics/evaluation_metrics.json

# Install minimal OS dependencies for OpenCV, FFmpeg, and health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip and install CPU-only PyTorch to minimize container size and memory footprint
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Copy and install application Python requirements
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy backend code, ML inference module, and trained model artifacts
COPY backend /app/backend
COPY ml /app/ml
COPY artifacts/models/best.pt /app/artifacts/models/best.pt
COPY artifacts/metrics/evaluation_metrics.json /app/artifacts/metrics/evaluation_metrics.json

# Create directories for persistent storage and uploads/outputs
RUN mkdir -p /app/data /app/uploads/images /app/uploads/videos /app/outputs/images /app/outputs/videos

EXPOSE 8000

# Docker healthcheck querying FastAPI health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/health || exit 1

# Start Uvicorn server binding to cloud-assigned PORT
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

