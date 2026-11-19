import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "RoadGuard AI"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Automated Road Pothole and Asphalt Crack Detection for Smart Maintenance (CSE471)"
    API_PREFIX: str = "/api"
    
    # Paths
    BASE_DIR: Path = BASE_DIR
    MODEL_PATH: str = os.getenv("MODEL_PATH", str(BASE_DIR / "artifacts" / "models" / "best.pt"))
    METRICS_PATH: str = os.getenv("METRICS_PATH", str(BASE_DIR / "artifacts" / "metrics" / "evaluation_metrics.json"))
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/roadguard.db")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads"))
    OUTPUT_DIR: str = os.getenv("OUTPUT_DIR", str(BASE_DIR / "outputs"))
    
    # Upload limits
    MAX_IMAGE_SIZE_MB: int = 20
    MAX_VIDEO_SIZE_MB: int = 100
    
    # Video inference settings
    VIDEO_FRAME_SAMPLE_RATE: int = 5  # Process every 5th frame for fast local CPU inference
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
