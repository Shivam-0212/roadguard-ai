"""
RoadGuard AI - Inference Engine
Loads YOLOv8-nano model, executes object detection on images,
extracts bounding boxes, calculates normalized spatial metrics,
and calls the severity assessment module.
"""

import os
import time
from typing import List, Dict, Any, Optional, Tuple, Union
from pathlib import Path
import numpy as np

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    from ultralytics import YOLO
    import torch
    ULTRALYTICS_AVAILABLE = True
except ImportError:
    ULTRALYTICS_AVAILABLE = False


CLASS_MAPPING = {
    0: "pothole",
    1: "crack",
    2: "manhole"
}

CLASS_DISPLAY = {
    0: "Pothole",
    1: "Crack",
    2: "Manhole"
}

# Hex and BGR colors
CLASS_COLORS_RGB = {
    0: (239, 68, 68),    # Red - Pothole
    1: (245, 158, 11),   # Amber - Crack
    2: (16, 185, 129)    # Emerald - Manhole
}

CLASS_COLORS_BGR = {
    0: (68, 68, 239),
    1: (11, 158, 245),
    2: (129, 185, 16)
}


class ModelNotReadyError(Exception):
    """Raised when inference is attempted but no valid model weights are loaded."""
    pass


def compute_relative_position(center_x: float, center_y: float) -> Tuple[str, str]:
    """
    Computes human-readable relative position from normalized coordinates [0, 1].
    X: Left (<0.33), Center (0.33-0.66), Right (>0.66)
    Y: Upper (<0.33), Middle (0.33-0.66), Lower (>0.66)
    """
    if center_x < 0.333:
        x_pos = "left"
    elif center_x < 0.666:
        x_pos = "center"
    else:
        x_pos = "right"

    if center_y < 0.333:
        y_pos = "upper"
    elif center_y < 0.666:
        y_pos = "middle"
    else:
        y_pos = "lower"

    return x_pos, y_pos


def estimate_visual_severity(
    class_id: int,
    area_percentage: float,
    box_width: float,
    box_height: float,
    center_y: float
) -> Tuple[str, float, str]:
    """
    Rule-based visual severity heuristic (CSE471).
    Distinguishes Potholes (Class 0), Cracks (Class 1), and Manholes (Class 2).
    
    Returns: (severity_label, severity_score, rationale)
    Labels: 'low', 'moderate', 'high', 'infrastructure' (for manholes)
    """
    aspect_ratio = max(box_width, box_height) / max(1.0, min(box_width, box_height))

    # Manholes: Road infrastructure asset, not surface degradation
    if class_id == 2:
        return "infrastructure", 0.0, "Manhole detected (road infrastructure feature, neutral surface condition)"

    # Pothole (Class 0): Highly dangerous cavity defect
    if class_id == 0:
        # Potholes occupying > 2.5% of road frame or near the vehicle (lower half) are critical
        base_score = min(100.0, (area_percentage / 3.0) * 80.0)
        # Location weighting: defect closer to vehicle (center_y > 0.6) increases immediate risk
        if center_y > 0.6:
            base_score = min(100.0, base_score * 1.25)

        if base_score >= 65.0 or area_percentage >= 2.5:
            return "high", round(base_score, 1), f"Critical cavity defect (Area: {area_percentage:.2f}%, Proximity factor applied)"
        elif base_score >= 35.0 or area_percentage >= 1.0:
            return "moderate", round(base_score, 1), f"Moderate cavity defect (Area: {area_percentage:.2f}%)"
        else:
            return "low", round(base_score, 1), f"Minor pothole or surface indentation (Area: {area_percentage:.2f}%)"

    # Crack (Class 1): Linear or alligator pavement fracture
    if class_id == 1:
        # High aspect ratio indicates elongated structural longitudinal/transverse crack
        base_score = min(100.0, (area_percentage / 2.0) * 60.0)
        if aspect_ratio > 3.0:
            base_score = min(100.0, base_score + 20.0)

        if base_score >= 60.0 or area_percentage >= 2.0:
            return "high", round(base_score, 1), f"Severe extensive asphalt crack (Area: {area_percentage:.2f}%, Aspect Ratio: {aspect_ratio:.1f})"
        elif base_score >= 30.0 or area_percentage >= 0.7:
            return "moderate", round(base_score, 1), f"Moderate fissure (Area: {area_percentage:.2f}%)"
        else:
            return "low", round(base_score, 1), f"Hairline or superficial surface crack (Area: {area_percentage:.2f}%)"

    return "low", 10.0, "Unclassified surface anomaly"


class RoadDefectDetector:
    """Singleton-friendly detector wrapper around YOLOv8."""

    def __init__(self, model_path: Optional[str] = None):
        self.model = None
        self.model_path = None
        self.device = "cpu"
        if model_path and os.path.exists(model_path):
            self.load(model_path)

    def load(self, model_path: str):
        if not ULTRALYTICS_AVAILABLE:
            raise RuntimeError("Ultralytics library is not installed.")

        # Determine best available device
        if torch.cuda.is_available():
            self.device = "0"
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            self.device = "mps"
        else:
            self.device = "cpu"

        self.model = YOLO(model_path)
        self.model_path = model_path
        print(f"[*] RoadDefectDetector loaded checkpoint: {model_path} on device: {self.device}")

    def is_ready(self) -> bool:
        return self.model is not None

    def predict_image(
        self,
        image_input: Union[str, np.ndarray, Path],
        conf_threshold: float = 0.25,
        iou_threshold: float = 0.45
    ) -> Dict[str, Any]:
        """
        Executes inference on an image and returns formatted inspection results.
        """
        if not self.is_ready():
            raise ModelNotReadyError("YOLOv8 model checkpoint is not loaded. Run Colab training first.")

        # Read image to obtain width and height
        if isinstance(image_input, (str, Path)):
            img = cv2.imread(str(image_input))
            if img is None:
                raise ValueError(f"Could not read image at {image_input}")
            orig_h, orig_w = img.shape[:2]
        elif isinstance(image_input, np.ndarray):
            img = image_input
            orig_h, orig_w = img.shape[:2]
        else:
            raise TypeError("Unsupported image input format")

        image_area = orig_w * orig_h

        # Run inference
        t0 = time.time()
        results = self.model.predict(
            source=img,
            conf=conf_threshold,
            iou=iou_threshold,
            device=self.device,
            verbose=False
        )
        inference_time_ms = round((time.time() - t0) * 1000, 2)

        detections = []
        highest_severity = "none"
        severity_rank = {"none": 0, "low": 1, "moderate": 2, "high": 3, "infrastructure": 0}

        if len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes
            for i in range(len(boxes)):
                xyxy = boxes.xyxy[i].cpu().numpy().tolist()
                x1, y1, x2, y2 = float(xyxy[0]), float(xyxy[1]), float(xyxy[2]), float(xyxy[3])
                confidence = float(boxes.conf[i].cpu().numpy())
                class_id = int(boxes.cls[i].cpu().numpy())

                class_name = CLASS_MAPPING.get(class_id, f"class_{class_id}")
                display_name = CLASS_DISPLAY.get(class_id, class_name.title())

                # Spatial calculations
                box_w = max(0.0, x2 - x1)
                box_h = max(0.0, y2 - y1)
                bbox_area = box_w * box_h
                area_pct = round((bbox_area / image_area) * 100.0, 3)

                center_x_norm = round(((x1 + x2) / 2.0) / orig_w, 4)
                center_y_norm = round(((y1 + y2) / 2.0) / orig_h, 4)

                rel_x, rel_y = compute_relative_position(center_x_norm, center_y_norm)

                # Severity estimation
                severity, sev_score, rationale = estimate_visual_severity(
                    class_id, area_pct, box_w, box_h, center_y_norm
                )

                if severity_rank.get(severity, 0) > severity_rank.get(highest_severity, 0):
                    highest_severity = severity

                detections.append({
                    "id": i + 1,
                    "class_id": class_id,
                    "class_name": class_name,
                    "display_name": display_name,
                    "confidence": round(confidence, 4),
                    "bbox": [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)],
                    "width": round(box_w, 1),
                    "height": round(box_h, 1),
                    "bbox_area": round(bbox_area, 1),
                    "area_percentage": area_pct,
                    "center_x": center_x_norm,
                    "center_y": center_y_norm,
                    "relative_position": f"{rel_y}-{rel_x}",
                    "relative_x": rel_x,
                    "relative_y": rel_y,
                    "severity": severity,
                    "severity_score": sev_score,
                    "severity_rationale": rationale
                })

        return {
            "image_dimensions": {"width": orig_w, "height": orig_h, "total_pixels": image_area},
            "detection_count": len(detections),
            "highest_severity": highest_severity,
            "inference_time_ms": inference_time_ms,
            "device_used": self.device,
            "detections": detections
        }

    def render_annotations(
        self,
        image_input: Union[str, np.ndarray, Path],
        detections: List[Dict[str, Any]],
        output_path: Optional[str] = None
    ) -> np.ndarray:
        """
        Draws professional bounding boxes, class banners, and severity tags.
        """
        if isinstance(image_input, (str, Path)):
            img = cv2.imread(str(image_input))
        else:
            img = image_input.copy()

        h, w = img.shape[:2]

        for det in detections:
            cid = det["class_id"]
            x1, y1, x2, y2 = map(int, det["bbox"])
            conf = det["confidence"]
            display = det["display_name"]
            severity = det["severity"].upper()

            color = CLASS_COLORS_BGR.get(cid, (0, 255, 0))

            # Bounding box
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

            # Label banner
            label_text = f"{display} {conf*100:.1f}% [{severity}]"
            (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)

            banner_y1 = max(0, y1 - th - 8)
            banner_y2 = y1
            cv2.rectangle(img, (x1, banner_y1), (x1 + tw + 8, banner_y2), color, -1)
            cv2.putText(
                img,
                label_text,
                (x1 + 4, banner_y2 - 4),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                (255, 255, 255),
                1,
                cv2.LINE_AA
            )

        if output_path:
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            cv2.imwrite(output_path, img)

        return img

