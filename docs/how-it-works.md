# RoadGuard AI — How It Works: System Workflow & Detection Engine

This document provides a technical walkthrough of how RoadGuard AI processes road media, detects pavement anomalies, evaluates structural severity, and serves real-time insights to the user interface.

---

## 1. High-Level Data Flow

```text
[ User Upload (JPEG/PNG/MP4) ]
             │
             ▼
[ 1. Ingestion & Validation ]
   • MIME type check
   • Size limit verification (20 MB image, 100 MB video)
   • Sanitized UUID naming to prevent path traversal
             │
             ▼
[ 2. Image Preprocessing ]
   • OpenCV image decoding
   • BGR to RGB color conversion
   • Letterbox scaling to 640×640 px
   • Pixel normalization to [0.0, 1.0]
             │
             ▼
[ 3. Deep Learning Inference (YOLOv8-nano) ]
   • Single-stage forward pass via Ultralytics
   • Hardware acceleration (Apple Silicon MPS / CUDA / CPU)
   • Candidate proposals scored across 3 classes:
       0: Pothole, 1: Crack, 2: Manhole
             │
             ▼
[ 4. Non-Maximum Suppression (NMS) & Filtering ]
   • Threshold filtering by user-specified Confidence (e.g. 0.25)
   • Redundant box suppression via IoU threshold (e.g. 0.45)
             │
             ▼
[ 5. Spatial Geometry & Severity Assessment ]
   • Normalized bounding box coordinates: [x1, y1, x2, y2]
   • Area percentage: (BBox_Area / Image_Area) × 100
   • Center coordinates: [Center_X, Center_Y]
   • Rule-based severity rating: Low, Moderate, High, Infrastructure
             │
             ▼
[ 6. Storage & Presentation ]
   • Render annotated overlay image with color-coded bounding boxes
   • Commit session and defect coordinates to SQLite (roadguard.db)
   • Return JSON payload to React frontend for real-time visualization
```

---

## 2. Ingestion & Validation

When a user submits an image or video via the web interface:
1. **MIME Verification:** The backend verifies that uploaded files match allowed MIME types (`image/jpeg`, `image/png`, `image/webp` for images; `video/mp4`, `video/avi`, `video/quicktime` for videos).
2. **Size Enforcement:** Images are restricted to 20 MB; videos are capped at 100 MB to prevent server memory exhaustion.
3. **Safe Storage:** Filenames are sanitized and assigned an 8-character hexadecimal UUID prefix (`uuid4().hex[:8] + "_" + secure_filename`), isolating user uploads and preventing directory traversal attacks.

---

## 3. Deep Learning Architecture: YOLOv8-nano

RoadGuard AI employs a fine-tuned **Ultralytics YOLOv8-nano** model (`yolov8n.pt`):
- **Lightweight Footprint:** 3,133,193 parameters (~6.25 MB weights file), making it fast and memory-efficient for local CPU and edge devices.
- **Backbone (Modified CSPDarknet):** Extracts hierarchical spatial features across multiple receptive fields using C2f (Cross-Stage Partial with 2 Convolutions) bottleneck blocks.
- **Neck (PAN-FPN):** Fuses fine-grained shallow features (essential for hairline asphalt cracks) with deep semantic context.
- **Head (Decoupled Anchor-Free):** Predicts classification logits and bounding box regression coordinates independently using Distribution Focal Loss (DFL) and Task-Aligned Assigner.

### Target Classes:
- **Class 0 (`pothole`):** Structural pavement cavities created by water intrusion and mechanical wear.
- **Class 1 (`crack`):** Longitudinal, transverse, and alligator fatigue asphalt fractures.
- **Class 2 (`manhole`):** Municipal utility access covers. Tracked separately as neutral infrastructure to avoid false-positive maintenance alerts.

---

## 4. Bounding Box Geometry Mathematics

For every detected defect, raw model coordinates $[x_1, y_1, x_2, y_2]$ are transformed into normalized metrics:

$$\text{Width} = x_2 - x_1$$
$$\text{Height} = y_2 - y_1$$
$$\text{BBox Area} = \text{Width} \times \text{Height}$$
$$\text{Area Percentage} = \left( \frac{\text{BBox Area}}{\text{Image Width} \times \text{Image Height}} \right) \times 100$$
$$\text{Center}_X = \frac{(x_1 + x_2) / 2}{\text{Image Width}}, \quad \text{Center}_Y = \frac{(y_1 + y_2) / 2}{\text{Image Height}}$$

---

## 5. Visual Severity Assessment Engine

RoadGuard AI uses a transparent, explainable heuristic engine to assign maintenance priority:

### 1. Potholes (Class 0)
- **High Severity:** $\text{Area Percentage} > 2.5\%$ OR vehicle proximity factor ($\text{Center}_Y > 0.60$, placing the cavity directly in the immediate tire path of an approaching vehicle).
- **Moderate Severity:** $0.8\% \le \text{Area Percentage} \le 2.5\%$.
- **Low Severity:** $\text{Area Percentage} < 0.8\%$.

### 2. Cracks (Class 1)
- **High Severity:** $\text{Area Percentage} > 3.0\%$ OR elongated aspect ratio ($\max(w, h) / \min(w, h) > 3.5$ and $\text{Area Percentage} > 1.0\%$), indicating deep structural propagation.
- **Moderate Severity:** $1.0\% \le \text{Area Percentage} \le 3.0\%$.
- **Low Severity:** $\text{Area Percentage} < 1.0\%$.

### 3. Manholes (Class 2)
- Categorized strictly as **INFRASTRUCTURE** with zero damage escalation score.

---

## 6. Persistence & Real-Time Visualization

1. **Overlay Rendering:** OpenCV renders crisp bounding boxes with class labels and confidence percentages:
   - Red (`#EF4444`) for Potholes
   - Amber (`#F59E0B`) for Cracks
   - Emerald (`#10B981`) for Manholes
2. **Relational Logging:** The inspection session and every individual detection are committed to SQLite (`roadguard.db`).
3. **Frontend Presentation:** The React client updates the visual canvas, renders interactive charts via Recharts, and allows one-click municipal CSV reporting.

