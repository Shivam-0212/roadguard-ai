from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class SeverityDistribution(BaseModel):
    high: int
    moderate: int
    low: int
    infrastructure: int


class RecentActivityItem(BaseModel):
    id: str
    filename: str
    file_type: str
    created_at: Optional[str]
    detection_count: int
    highest_severity: str
    potholes: int
    cracks: int
    manholes: int


class DashboardSummaryResponse(BaseModel):
    total_sessions: int
    total_defects: int
    total_potholes: int
    total_cracks: int
    total_manholes: int
    high_severity_defects: int
    model_ready: bool
    model_name: str
    severity_distribution: SeverityDistribution
    recent_sessions: List[RecentActivityItem]

