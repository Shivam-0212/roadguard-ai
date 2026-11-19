from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class ModelStatusResponse(BaseModel):
    model_ready: bool
    model_name: str
    checkpoint_path: str
    device: str
    classes: Dict[int, str]
    message: str


class MetricValues(BaseModel):
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    map50: Optional[float] = None
    map50_95: Optional[float] = None
    inference_latency_ms: Optional[float] = None


class ClassMetrics(BaseModel):
    precision: Optional[float] = None
    recall: Optional[float] = None
    map50: Optional[float] = None
    map50_95: Optional[float] = None


class ModelMetricsResponse(BaseModel):
    status: str
    message: Optional[str] = None
    timestamp: Optional[str] = None
    model_path: Optional[str] = None
    metrics: MetricValues
    per_class: Dict[str, ClassMetrics]

