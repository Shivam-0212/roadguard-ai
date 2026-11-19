from fastapi import APIRouter
from backend.app.api.routes import health, model, detections, dashboard, history, reports

api_router = APIRouter(prefix="/api")

api_router.include_router(health.router)
api_router.include_router(model.router)
api_router.include_router(detections.router)
api_router.include_router(dashboard.router)
api_router.include_router(history.router)
api_router.include_router(reports.router)

