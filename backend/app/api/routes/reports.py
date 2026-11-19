from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/detections.csv")
def export_detections_csv(db: Session = Depends(get_db)):
    """Exports all logged defect detection records as a downloadable CSV."""
    service = ReportService(db)
    csv_data = service.generate_detections_csv()

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=roadguard_detections.csv"
        }
    )

