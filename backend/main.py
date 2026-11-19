"""
RoadGuard AI - Backend Application Entrypoint
Exposes the FastAPI application instance for uvicorn execution.
"""
from backend.app.main import app

__all__ = ["app"]

if __name__ == "__main__":
    import uvicorn
    from backend.app.config import settings

    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=False)


