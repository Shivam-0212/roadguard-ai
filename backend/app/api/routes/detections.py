from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.services.detection_service import DetectionService
from backend.app.services.video_service import VideoService
from backend.app.schemas.detection import ImageInspectionResponse, VideoInspectionResponse

router = APIRouter(prefix="/detections", tags=["Detections"])


@router.post("/image", response_model=ImageInspectionResponse)
async def detect_image(
    file: UploadFile = File(...),
    conf: float = Query(0.25, ge=0.05, le=1.0, description="Confidence threshold"),
    iou: float = Query(0.45, ge=0.1, le=0.9, description="IoU NMS threshold"),
    db: Session = Depends(get_db)
):
    """
    Uploads a road image, runs YOLOv8-nano inference, calculates bounding boxes,
    estimates visual severity, stores the session in SQLite, and returns detections.
    """
    service = DetectionService(db)
    return await service.process_image_upload(file, conf_threshold=conf, iou_threshold=iou)


@router.post("/video", response_model=VideoInspectionResponse)
async def detect_video(
    file: UploadFile = File(...),
    conf: float = Query(0.25, ge=0.05, le=1.0, description="Confidence threshold"),
    iou: float = Query(0.45, ge=0.1, le=0.9, description="IoU NMS threshold"),
    db: Session = Depends(get_db)
):
    """
    Uploads a road video, samples frames for inference, renders bounding boxes,
    generates an annotated output video, and records the session.
    """
    service = VideoService(db)
    return await service.process_video_upload(file, conf_threshold=conf, iou_threshold=iou)

