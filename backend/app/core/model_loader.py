import os
from pathlib import Path
from typing import Optional, Dict, Any
from backend.app.config import settings
from ml.inference.detector import RoadDefectDetector, CLASS_MAPPING, ModelNotReadyError


class ModelManager:
    """Thread-safe Singleton Model Manager for FastAPI."""
    _instance: Optional['ModelManager'] = None

    def __init__(self):
        self.detector: Optional[RoadDefectDetector] = None
        self.model_path: str = settings.MODEL_PATH
        self.model_loaded: bool = False
        self.device_used: str = "cpu"
        self.init_error: Optional[str] = None
        self.load_model()

    @classmethod
    def get_instance(cls) -> 'ModelManager':
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_model(self, custom_path: Optional[str] = None):
        target_path = custom_path or self.model_path
        if not os.path.exists(target_path):
            self.model_loaded = False
            self.init_error = f"Checkpoint not found at: {target_path}. Run Google Colab training first."
            print(f"[!] ModelManager Notice: {self.init_error}")
            return

        try:
            self.detector = RoadDefectDetector(target_path)
            self.model_loaded = self.detector.is_ready()
            self.device_used = self.detector.device
            self.model_path = target_path
            self.init_error = None
            print(f"[+] ModelManager: Successfully loaded YOLOv8 checkpoint ({target_path}) on {self.device_used}")
        except Exception as e:
            self.model_loaded = False
            self.init_error = str(e)
            print(f"[!] ModelManager Load Error: {e}")

    def is_ready(self) -> bool:
        return self.model_loaded and self.detector is not None

    def get_detector(self) -> RoadDefectDetector:
        if not self.is_ready():
            raise ModelNotReadyError(
                self.init_error or "Model weights are not loaded. Run Colab training first."
            )
        return self.detector

    def get_status(self) -> Dict[str, Any]:
        return {
            "model_ready": self.is_ready(),
            "model_name": "YOLOv8-nano (RoadGuard AI)",
            "checkpoint_path": self.model_path,
            "device": self.device_used if self.is_ready() else "N/A",
            "classes": CLASS_MAPPING,
            "message": "Model loaded and ready for inference" if self.is_ready() else (
                self.init_error or "Model checkpoint not found. Execute Colab notebook to generate best.pt"
            )
        }


model_manager = ModelManager.get_instance()

