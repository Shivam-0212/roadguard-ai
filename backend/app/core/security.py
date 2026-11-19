import os
import re
import uuid
from pathlib import Path
from fastapi import HTTPException, UploadFile
from backend.app.config import settings

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv"}

MAX_IMAGE_SIZE_BYTES = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
MAX_VIDEO_SIZE_BYTES = settings.MAX_VIDEO_SIZE_MB * 1024 * 1024


def sanitize_filename(filename: str) -> str:
    """Sanitizes uploaded filename and prepends UUID to prevent collisions and path traversal."""
    clean_name = re.sub(r"[^a-zA-Z0-9_.-]", "_", Path(filename).name)
    prefix = uuid.uuid4().hex[:8]
    return f"{prefix}_{clean_name}"


def validate_image_upload(file: UploadFile):
    """Validates image file extension and content type."""
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image file format '{ext}'. Allowed formats: {', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS))}"
        )


def validate_video_upload(file: UploadFile):
    """Validates video file extension."""
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported video file format '{ext}'. Allowed formats: {', '.join(sorted(ALLOWED_VIDEO_EXTENSIONS))}"
        )

