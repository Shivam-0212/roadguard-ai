from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class BoundingBoxCoordinates(BaseModel):
    x1: float = Field(..., description="Top-left X pixel coordinate")
    y1: float = Field(..., description="Top-left Y pixel coordinate")
    x2: float = Field(..., description="Bottom-right X pixel coordinate")
    y2: float = Field(..., description="Bottom-right Y pixel coordinate")


class DefectDetectionItem(BaseModel):
    id: int
    class_id: int
    class_name: str
    display_name: str
    confidence: float
    bbox: List[float] = Field(..., description="[x1, y1, x2, y2]")
    width: float
    height: float
    bbox_area: float
    area_percentage: float
    center_x: float
    center_y: float
    relative_position: str
    relative_x: str
    relative_y: str
    severity: str
    severity_score: float
    severity_rationale: str


class ImageInspectionResponse(BaseModel):
    session_id: str
    filename: str
    file_type: str = "image"
    original_image_url: str
    annotated_image_url: str
    created_at: str
    detection_count: int
    highest_severity: str
    pothole_count: int
    crack_count: int
    manhole_count: int
    processing_time_ms: float
    image_dimensions: dict
    detections: List[DefectDetectionItem]


class VideoInspectionResponse(BaseModel):
    session_id: str
    filename: str
    file_type: str = "video"
    original_video_url: str
    annotated_video_url: str
    created_at: str
    total_frames_sampled: int
    detection_count: int
    highest_severity: str
    pothole_count: int
    crack_count: int
    manhole_count: int
    processing_time_ms: float


class InspectionSessionSummary(BaseModel):
    id: str
    filename: str
    file_type: str
    original_file_url: str
    annotated_file_url: Optional[str] = None
    created_at: Optional[str] = None
    detection_count: int
    highest_severity: str
    pothole_count: int
    crack_count: int
    manhole_count: int
    processing_time_ms: float


class InspectionSessionDetail(InspectionSessionSummary):
    detections: List[DefectDetectionItem]


class PaginatedSessionsResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    items: List[InspectionSessionSummary]

