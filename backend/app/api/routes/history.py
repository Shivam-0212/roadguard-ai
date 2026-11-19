from typing import Optional
from pathlib import Path
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.database.repository import InspectionRepository
from backend.app.schemas.detection import (
    PaginatedSessionsResponse,
    InspectionSessionSummary,
    InspectionSessionDetail,
    DefectDetectionItem
)

router = APIRouter(prefix="/detections", tags=["History"])


@router.get("", response_model=PaginatedSessionsResponse)
def list_detections(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    severity: Optional[str] = Query(None, description="Filter by highest severity: all, low, moderate, high"),
    defect: Optional[str] = Query(None, description="Filter by defect type: all, pothole, crack, manhole"),
    db: Session = Depends(get_db)
):
    """Returns a paginated list of past inspection sessions."""
    repo = InspectionRepository(db)
    skip = (page - 1) * limit
    sessions, total = repo.list_sessions(
        skip=skip,
        limit=limit,
        severity_filter=severity,
        defect_type_filter=defect
    )

    items = []
    for s in sessions:
        orig_url = f"/uploads/{'images' if s.file_type == 'image' else 'videos'}/{Path(s.original_file_path).name}"
        annot_url = f"/outputs/{'images' if s.file_type == 'image' else 'videos'}/{Path(s.annotated_file_path).name}" if s.annotated_file_path else None
        items.append(
            InspectionSessionSummary(
                id=s.id,
                filename=s.filename,
                file_type=s.file_type,
                original_file_url=orig_url,
                annotated_file_url=annot_url,
                created_at=s.created_at.isoformat() if s.created_at else None,
                detection_count=s.detection_count,
                highest_severity=s.highest_severity,
                pothole_count=s.pothole_count,
                crack_count=s.crack_count,
                manhole_count=s.manhole_count,
                processing_time_ms=s.processing_time_ms
            )
        )

    total_pages = max(1, (total + limit - 1) // limit)
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": items
    }


@router.get("/{session_id}", response_model=InspectionSessionDetail)
def get_session_detail(session_id: str, db: Session = Depends(get_db)):
    """Returns detailed session record including individual bounding boxes and severity."""
    repo = InspectionRepository(db)
    session = repo.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Inspection session not found")

    orig_url = f"/uploads/{'images' if session.file_type == 'image' else 'videos'}/{Path(session.original_file_path).name}"
    annot_url = f"/outputs/{'images' if session.file_type == 'image' else 'videos'}/{Path(session.annotated_file_path).name}" if session.annotated_file_path else None

    detections = []
    for idx, d in enumerate(session.detections, 1):
        detections.append(
            DefectDetectionItem(
                id=idx,
                class_id=d.class_id,
                class_name=d.class_name,
                display_name=d.class_name.title(),
                confidence=d.confidence,
                bbox=[d.bbox_x1, d.bbox_y1, d.bbox_x2, d.bbox_y2],
                width=max(0.0, d.bbox_x2 - d.bbox_x1),
                height=max(0.0, d.bbox_y2 - d.bbox_y1),
                bbox_area=d.bbox_area,
                area_percentage=d.area_percentage,
                center_x=d.center_x,
                center_y=d.center_y,
                relative_position=f"{d.relative_y}-{d.relative_x}",
                relative_x=d.relative_x,
                relative_y=d.relative_y,
                severity=d.severity,
                severity_score=d.severity_score,
                severity_rationale=d.severity_rationale or ""
            )
        )

    return InspectionSessionDetail(
        id=session.id,
        filename=session.filename,
        file_type=session.file_type,
        original_file_url=orig_url,
        annotated_file_url=annot_url,
        created_at=session.created_at.isoformat() if session.created_at else None,
        detection_count=session.detection_count,
        highest_severity=session.highest_severity,
        pothole_count=session.pothole_count,
        crack_count=session.crack_count,
        manhole_count=session.manhole_count,
        processing_time_ms=session.processing_time_ms,
        detections=detections
    )


@router.delete("/{session_id}")
def delete_session(session_id: str, db: Session = Depends(get_db)):
    """Deletes an inspection session and its defect records."""
    repo = InspectionRepository(db)
    success = repo.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Inspection session not found")
    return {"status": "success", "message": f"Session {session_id} deleted"}

