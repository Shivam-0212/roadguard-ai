import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings
from backend.app.database.database import init_db
from backend.app.core.model_loader import model_manager
from backend.app.api.api_router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure storage folders exist
    upload_path = Path(settings.UPLOAD_DIR)
    output_path = Path(settings.OUTPUT_DIR)
    (upload_path / "images").mkdir(parents=True, exist_ok=True)
    (upload_path / "videos").mkdir(parents=True, exist_ok=True)
    (output_path / "images").mkdir(parents=True, exist_ok=True)
    (output_path / "videos").mkdir(parents=True, exist_ok=True)
    
    # Initialize SQLite schema
    init_db()
    print("[+] Database tables initialized.")
    print(f"[*] Model status: {'Ready' if model_manager.is_ready() else 'Not ready (pending training)'}")
    
    yield
    print("[*] RoadGuard AI Backend shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads and outputs
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.mount("/outputs", StaticFiles(directory=settings.OUTPUT_DIR), name="outputs")

# Include API Router
app.include_router(api_router)


@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "documentation": "/docs",
        "api_status": "/api/health",
        "model_status": "/api/model/status"
    }

