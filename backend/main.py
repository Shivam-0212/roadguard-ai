"""
RoadGuard AI - Backend Application Entrypoint
Exposes the FastAPI application instance for uvicorn execution.
"""
from backend.app.main import app

__all__ = ["app"]

