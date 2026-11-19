import os
import json
from pathlib import Path
from fastapi import APIRouter
from backend.app.config import settings
from backend.app.core.model_loader import model_manager
from backend.app.schemas.model import ModelStatusResponse, ModelMetricsResponse

router = APIRouter(prefix="/model", tags=["Model"])


@router.get("/status", response_model=ModelStatusResponse)
def get_model_status():
    """Returns current YOLOv8-nano model loading and device status."""
    return model_manager.get_status()


@router.get("/metrics", response_model=ModelMetricsResponse)
def get_model_metrics():
    """Returns evaluation metrics from artifacts/metrics/evaluation_metrics.json."""
    metrics_file = Path(settings.METRICS_PATH)
    if metrics_file.exists():
        try:
            with open(metrics_file, "r") as f:
                data = json.load(f)
                return data
        except Exception:
            pass

    # Fallback to pending representation
    return {
        "status": "pending_training",
        "message": "Training/evaluation results not available yet. Execute the Google Colab training notebook to populate this section.",
        "timestamp": None,
        "model_path": None,
        "metrics": {
            "precision": None,
            "recall": None,
            "f1_score": None,
            "map50": None,
            "map50_95": None,
            "inference_latency_ms": None
        },
        "per_class": {
            "pothole": {"precision": None, "recall": None, "map50": None, "map50_95": None},
            "crack": {"precision": None, "recall": None, "map50": None, "map50_95": None},
            "manhole": {"precision": None, "recall": None, "map50": None, "map50_95": None}
        }
    }

