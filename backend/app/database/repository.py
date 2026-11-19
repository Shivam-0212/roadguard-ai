from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from backend.app.database.models import InspectionSession, DefectDetection


class InspectionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_session(
        self,
        session_id: str,
        filename: str,
        file_type: str,
        original_file_path: str,
        annotated_file_path: str,
        detection_count: int,
        highest_severity: str,
        pothole_count: int,
        crack_count: int,
        manhole_count: int,
        processing_time_ms: float
    ) -> InspectionSession:
        session = InspectionSession(
            id=session_id,
            filename=filename,
            file_type=file_type,
            original_file_path=original_file_path,
            annotated_file_path=annotated_file_path,
            detection_count=detection_count,
            highest_severity=highest_severity,
            pothole_count=pothole_count,
            crack_count=crack_count,
            manhole_count=manhole_count,
            processing_time_ms=processing_time_ms
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def add_detections(self, session_id: str, detections: List[Dict[str, Any]]):
        db_records = []
        for d in detections:
            bbox = d.get("bbox", [0, 0, 0, 0])
            record = DefectDetection(
                session_id=session_id,
                class_id=d["class_id"],
                class_name=d["class_name"],
                confidence=d["confidence"],
                bbox_x1=bbox[0],
                bbox_y1=bbox[1],
                bbox_x2=bbox[2],
                bbox_y2=bbox[3],
                bbox_area=d.get("bbox_area", 0.0),
                area_percentage=d.get("area_percentage", 0.0),
                center_x=d.get("center_x", 0.0),
                center_y=d.get("center_y", 0.0),
                relative_x=d.get("relative_x", "center"),
                relative_y=d.get("relative_y", "middle"),
                severity=d.get("severity", "low"),
                severity_score=d.get("severity_score", 0.0),
                severity_rationale=d.get("severity_rationale", "")
            )
            db_records.append(record)
        self.db.add_all(db_records)
        self.db.commit()

    def get_session(self, session_id: str) -> Optional[InspectionSession]:
        return self.db.query(InspectionSession).filter(InspectionSession.id == session_id).first()

    def delete_session(self, session_id: str) -> bool:
        session = self.get_session(session_id)
        if session:
            self.db.delete(session)
            self.db.commit()
            return True
        return False

    def list_sessions(
        self,
        skip: int = 0,
        limit: int = 20,
        severity_filter: Optional[str] = None,
        defect_type_filter: Optional[str] = None
    ) -> Tuple[List[InspectionSession], int]:
        query = self.db.query(InspectionSession)

        if severity_filter and severity_filter.lower() != "all":
            query = query.filter(InspectionSession.highest_severity == severity_filter.lower())

        if defect_type_filter and defect_type_filter.lower() != "all":
            dtype = defect_type_filter.lower()
            if dtype == "pothole":
                query = query.filter(InspectionSession.pothole_count > 0)
            elif dtype == "crack":
                query = query.filter(InspectionSession.crack_count > 0)
            elif dtype == "manhole":
                query = query.filter(InspectionSession.manhole_count > 0)

        total = query.count()
        sessions = query.order_by(desc(InspectionSession.created_at)).offset(skip).limit(limit).all()
        return sessions, total

    def get_summary_statistics(self) -> Dict[str, Any]:
        total_sessions = self.db.query(func.count(InspectionSession.id)).scalar() or 0
        total_potholes = self.db.query(func.sum(InspectionSession.pothole_count)).scalar() or 0
        total_cracks = self.db.query(func.sum(InspectionSession.crack_count)).scalar() or 0
        total_manholes = self.db.query(func.sum(InspectionSession.manhole_count)).scalar() or 0
        total_defects = total_potholes + total_cracks + total_manholes

        high_severity_count = self.db.query(func.count(InspectionSession.id)).filter(
            InspectionSession.highest_severity == "high"
        ).scalar() or 0

        # Severity breakdown across individual detections
        sev_counts = self.db.query(
            DefectDetection.severity,
            func.count(DefectDetection.id)
        ).group_by(DefectDetection.severity).all()
        severity_distribution = {s: c for s, c in sev_counts}

        # Recent 5 sessions
        recent = self.db.query(InspectionSession).order_by(desc(InspectionSession.created_at)).limit(5).all()

        return {
            "total_sessions": total_sessions,
            "total_defects": total_defects,
            "total_potholes": int(total_potholes),
            "total_cracks": int(total_cracks),
            "total_manholes": int(total_manholes),
            "high_severity_defects": high_severity_count,
            "severity_distribution": {
                "high": severity_distribution.get("high", 0),
                "moderate": severity_distribution.get("moderate", 0),
                "low": severity_distribution.get("low", 0),
                "infrastructure": severity_distribution.get("infrastructure", 0)
            },
            "recent_sessions": [
                {
                    "id": s.id,
                    "filename": s.filename,
                    "file_type": s.file_type,
                    "created_at": s.created_at.isoformat() if s.created_at else None,
                    "detection_count": s.detection_count,
                    "highest_severity": s.highest_severity,
                    "potholes": s.pothole_count,
                    "cracks": s.crack_count,
                    "manholes": s.manhole_count
                }
                for s in recent
            ]
        }

    def get_all_detections_for_export(self) -> List[DefectDetection]:
        return self.db.query(DefectDetection).join(InspectionSession).order_by(desc(InspectionSession.created_at)).all()

