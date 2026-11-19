from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.database.repository import InspectionRepository
from backend.app.core.model_loader import model_manager
from backend.app.schemas.dashboard import DashboardSummaryResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Returns aggregated summary metrics across all inspections and model status."""
    repo = InspectionRepository(db)
    stats = repo.get_summary_statistics()
    status = model_manager.get_status()

    return {
        **stats,
        "model_ready": status["model_ready"],
        "model_name": status["model_name"]
    }

