import os
import time
import uuid
import datetime
from pathlib import Path
from typing import Dict, Any
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.core.model_loader import model_manager
from backend.app.core.security import sanitize_filename, validate_image_upload, MAX_IMAGE_SIZE_BYTES
from backend.app.database.repository import InspectionRepository
from ml.inference.detector import ModelNotReadyError


class DetectionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = InspectionRepository(db)

    async def process_image_upload(
        self,
        file: UploadFile,
        conf_threshold: float = 0.25,
        iou_threshold: float = 0.45
    ) -> Dict[str, Any]:
        validate_image_upload(file)

        # Ensure model is ready
        if not model_manager.is_ready():
            raise HTTPException(
                status_code=503,
                detail="Model checkpoint not ready. Please fine-tune YOLOv8-nano via the Google Colab notebook and save best.pt to artifacts/models/."
            )

        detector = model_manager.get_detector()

        # Create storage directories
        upload_dir = Path(settings.UPLOAD_DIR) / "images"
        output_dir = Path(settings.OUTPUT_DIR) / "images"
        upload_dir.mkdir(parents=True, exist_ok=True)
        output_dir.mkdir(parents=True, exist_ok=True)

        safe_name = sanitize_filename(file.filename or "upload.jpg")
        upload_path = upload_dir / safe_name
        output_name = f"annotated_{safe_name}"
        output_path = output_dir / output_name

        # Read contents with size limit
        contents = await file.read()
        if len(contents) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"File exceeds maximum allowed size of {settings.MAX_IMAGE_SIZE_MB} MB."
            )

        with open(upload_path, "wb") as f:
            f.write(contents)

        # Run inference
        try:
            results = detector.predict_image(
                upload_path,
                conf_threshold=conf_threshold,
                iou_threshold=iou_threshold
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

        # Draw and save annotated image
        detector.render_annotations(upload_path, results["detections"], str(output_path))

        # Class counts
        detections = results["detections"]
        potholes = sum(1 for d in detections if d["class_id"] == 0)
        cracks = sum(1 for d in detections if d["class_id"] == 1)
        manholes = sum(1 for d in detections if d["class_id"] == 2)

        session_id = str(uuid.uuid4())
        now = datetime.datetime.utcnow().isoformat() + "Z"

        # Save to database
        self.repo.create_session(
            session_id=session_id,
            filename=file.filename or safe_name,
            file_type="image",
            original_file_path=str(upload_path),
            annotated_file_path=str(output_path),
            detection_count=len(detections),
            highest_severity=results["highest_severity"],
            pothole_count=potholes,
            crack_count=cracks,
            manhole_count=manholes,
            processing_time_ms=results["inference_time_ms"]
        )

        self.repo.add_detections(session_id, detections)

        return {
            "session_id": session_id,
            "filename": file.filename or safe_name,
            "file_type": "image",
            "original_image_url": f"/uploads/images/{upload_path.name}",
            "annotated_image_url": f"/outputs/images/{output_path.name}",
            "created_at": now,
            "detection_count": len(detections),
            "highest_severity": results["highest_severity"],
            "pothole_count": potholes,
            "crack_count": cracks,
            "manhole_count": manholes,
            "processing_time_ms": results["inference_time_ms"],
            "image_dimensions": results["image_dimensions"],
            "detections": detections
        }

