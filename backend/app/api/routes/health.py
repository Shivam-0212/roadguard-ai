import time
from fastapi import APIRouter
from backend.app.config import settings

router = APIRouter(tags=["Health"])
START_TIME = time.time()


@router.get("/health")
def health_check():
    """Returns application health and uptime."""
    uptime_seconds = round(time.time() - START_TIME, 2)
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "uptime_seconds": uptime_seconds,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

