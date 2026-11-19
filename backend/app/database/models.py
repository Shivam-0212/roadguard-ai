import datetime
import uuid
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database.database import Base


class InspectionSession(Base):
    __tablename__ = "inspection_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # "image" or "video"
    original_file_path = Column(String(500), nullable=False)
    annotated_file_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    detection_count = Column(Integer, default=0)
    highest_severity = Column(String(50), default="none")  # "none", "low", "moderate", "high"
    pothole_count = Column(Integer, default=0)
    crack_count = Column(Integer, default=0)
    manhole_count = Column(Integer, default=0)
    processing_time_ms = Column(Float, default=0.0)

    detections = relationship("DefectDetection", back_populates="session", cascade="all, delete-orphan")


class DefectDetection(Base):
    __tablename__ = "defect_detections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("inspection_sessions.id", ondelete="CASCADE"), nullable=False)
    
    class_id = Column(Integer, nullable=False)  # 0, 1, 2
    class_name = Column(String(50), nullable=False)  # pothole, crack, manhole
    confidence = Column(Float, nullable=False)
    
    bbox_x1 = Column(Float, nullable=False)
    bbox_y1 = Column(Float, nullable=False)
    bbox_x2 = Column(Float, nullable=False)
    bbox_y2 = Column(Float, nullable=False)
    bbox_area = Column(Float, nullable=False)
    area_percentage = Column(Float, nullable=False)
    
    center_x = Column(Float, nullable=False)
    center_y = Column(Float, nullable=False)
    relative_x = Column(String(20), nullable=False)  # left, center, right
    relative_y = Column(String(20), nullable=False)  # upper, middle, lower
    
    severity = Column(String(50), nullable=False)  # low, moderate, high, infrastructure
    severity_score = Column(Float, default=0.0)
    severity_rationale = Column(Text, nullable=True)

    session = relationship("InspectionSession", back_populates="detections")

