import os
import time
import uuid
import datetime
from pathlib import Path
from typing import Dict, Any
import cv2
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.core.model_loader import model_manager
from backend.app.core.security import sanitize_filename, validate_video_upload, MAX_VIDEO_SIZE_BYTES
from backend.app.database.repository import InspectionRepository


class VideoService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = InspectionRepository(db)

    async def process_video_upload(
        self,
        file: UploadFile,
        conf_threshold: float = 0.25,
        iou_threshold: float = 0.45
    ) -> Dict[str, Any]:
        validate_video_upload(file)

        if not model_manager.is_ready():
            raise HTTPException(
                status_code=503,
                detail="Model checkpoint not ready. Please fine-tune YOLOv8-nano via the Google Colab notebook."
            )

        detector = model_manager.get_detector()

        upload_dir = Path(settings.UPLOAD_DIR) / "videos"
        output_dir = Path(settings.OUTPUT_DIR) / "videos"
        upload_dir.mkdir(parents=True, exist_ok=True)
        output_dir.mkdir(parents=True, exist_ok=True)

        safe_name = sanitize_filename(file.filename or "upload.mp4")
        upload_path = upload_dir / safe_name
        output_name = f"annotated_{Path(safe_name).stem}.mp4"
        output_path = output_dir / output_name

        # Save uploaded video
        contents = await file.read()
        if len(contents) > MAX_VIDEO_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"Video exceeds maximum allowed size of {settings.MAX_VIDEO_SIZE_MB} MB."
            )

        with open(upload_path, "wb") as f:
            f.write(contents)

        # OpenCV VideoCapture
        cap = cv2.VideoCapture(str(upload_path))
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open video file. Ensure valid video codec.")

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        # Enforce frame limit to protect local RAM/CPU (max 600 frames = ~24 seconds at 25fps)
        max_frames_to_read = min(total_frames, 600)
        sample_step = max(1, settings.VIDEO_FRAME_SAMPLE_RATE)

        # VideoWriter
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out_writer = cv2.VideoWriter(str(output_path), fourcc, fps / sample_step, (width, height))

        frame_idx = 0
        processed_frames = 0
        total_detections_count = 0
        potholes = 0
        cracks = 0
        manholes = 0
        highest_severity = "none"
        severity_rank = {"none": 0, "low": 1, "moderate": 2, "high": 3, "infrastructure": 0}
        
        all_detections_sample = []
        t0 = time.time()

        try:
            while cap.isOpened() and frame_idx < max_frames_to_read:
                ret, frame = cap.read()
                if not ret:
                    break

                if frame_idx % sample_step == 0:
                    processed_frames += 1
                    pred_res = detector.predict_image(frame, conf_threshold=conf_threshold, iou_threshold=iou_threshold)
                    dets = pred_res["detections"]
                    total_detections_count += len(dets)

                    for d in dets:
                        cid = d["class_id"]
                        if cid == 0:
                            potholes += 1
                        elif cid == 1:
                            cracks += 1
                        elif cid == 2:
                            manholes += 1

                        sev = d["severity"]
                        if severity_rank.get(sev, 0) > severity_rank.get(highest_severity, 0):
                            highest_severity = sev

                    # Keep a sample of detections to record in DB
                    if len(all_detections_sample) < 50:
                        all_detections_sample.extend(dets[:max(1, 50 - len(all_detections_sample))])

                    # Render frame
                    annotated_frame = detector.render_annotations(frame, dets)
                    out_writer.write(annotated_frame)

                frame_idx += 1
        finally:
            cap.release()
            out_writer.release()

        processing_time_ms = round((time.time() - t0) * 1000, 2)
        session_id = str(uuid.uuid4())
        now = datetime.datetime.utcnow().isoformat() + "Z"

        # Record session in SQLite
        self.repo.create_session(
            session_id=session_id,
            filename=file.filename or safe_name,
            file_type="video",
            original_file_path=str(upload_path),
            annotated_file_path=str(output_path),
            detection_count=total_detections_count,
            highest_severity=highest_severity,
            pothole_count=potholes,
            crack_count=cracks,
            manhole_count=manholes,
            processing_time_ms=processing_time_ms
        )

        if all_detections_sample:
            self.repo.add_detections(session_id, all_detections_sample)

        return {
            "session_id": session_id,
            "filename": file.filename or safe_name,
            "file_type": "video",
            "original_video_url": f"/uploads/videos/{upload_path.name}",
            "annotated_video_url": f"/outputs/videos/{output_path.name}",
            "created_at": now,
            "total_frames_sampled": processed_frames,
            "detection_count": total_detections_count,
            "highest_severity": highest_severity,
            "pothole_count": potholes,
            "crack_count": cracks,
            "manhole_count": manholes,
            "processing_time_ms": processing_time_ms
        }

