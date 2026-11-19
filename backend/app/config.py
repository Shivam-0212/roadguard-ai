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
    
    # Server Host & Port (Railway / Cloud deployment assigns dynamic PORT)
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # Upload limits
    MAX_IMAGE_SIZE_MB: int = int(os.getenv("MAX_IMAGE_SIZE_MB", "20"))
    MAX_VIDEO_SIZE_MB: int = int(os.getenv("MAX_VIDEO_SIZE_MB", "100"))
    
    # Video inference settings
    VIDEO_FRAME_SAMPLE_RATE: int = int(os.getenv("VIDEO_FRAME_SAMPLE_RATE", "5"))
    
    # CORS
    CORS_ORIGINS: list | str = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    @property
    def cors_origins_list(self) -> list:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return ["*"]

    @property
    def sync_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
