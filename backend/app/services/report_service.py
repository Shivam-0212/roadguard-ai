import csv
import io
from typing import List
from sqlalchemy.orm import Session
from backend.app.database.repository import InspectionRepository


class ReportService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = InspectionRepository(db)

    def generate_detections_csv(self) -> str:
        """Generates a CSV string containing all logged road defect detections."""
        detections = self.repo.get_all_detections_for_export()

        output = io.StringIO()
        writer = csv.writer(output)

        # Write CSV Header
        writer.writerow([
            "Detection_ID",
            "Session_ID",
            "File_Name",
            "File_Type",
            "Timestamp_UTC",
            "Class_ID",
            "Class_Name",
            "Confidence",
            "BBox_X1",
            "BBox_Y1",
            "BBox_X2",
            "BBox_Y2",
            "BBox_Area_Pixels",
            "Area_Percentage",
            "Center_X_Normalized",
            "Center_Y_Normalized",
            "Relative_X_Region",
            "Relative_Y_Region",
            "Visual_Severity",
            "Severity_Score",
            "Severity_Rationale"
        ])

        for d in detections:
            sess = d.session
            writer.writerow([
                d.id,
                d.session_id,
                sess.filename if sess else "N/A",
                sess.file_type if sess else "N/A",
                sess.created_at.isoformat() if sess and sess.created_at else "N/A",
                d.class_id,
                d.class_name,
                f"{d.confidence:.4f}",
                f"{d.bbox_x1:.1f}",
                f"{d.bbox_y1:.1f}",
                f"{d.bbox_x2:.1f}",
                f"{d.bbox_y2:.1f}",
                f"{d.bbox_area:.1f}",
                f"{d.area_percentage:.3f}%",
                f"{d.center_x:.4f}",
                f"{d.center_y:.4f}",
                d.relative_x,
                d.relative_y,
                d.severity.upper(),
                f"{d.severity_score:.1f}",
                d.severity_rationale or ""
            ])

        return output.getvalue()

