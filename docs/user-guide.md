# RoadGuard AI — Practical User Manual

This manual provides a practical, step-by-step walkthrough for operating the RoadGuard AI road inspection web application.

---

## 1. Accessing the Application

Once both the backend and frontend servers are launched (see [setup.md](setup.md)):
1. Open your web browser and navigate to:
   ```text
   http://localhost:5173
   ```
2. Check the header status pills in the top-right corner:
   - **Backend Status:** Should show `Backend 8000` with a green indicator.
   - **Model Status:** Should show `YOLOv8 Online` with a green checkmark.

---

## 2. Navigating the Interface

The left navigation sidebar provides access to all primary application views:

| View | Purpose |
| :--- | :--- |
| **Overview (`/`)** | System landing page summarizing target classes and pipeline architecture. |
| **Dashboard (`/dashboard`)** | Real-time aggregate statistics, defect proportions, and recent activity logs. |
| **Image Inspection (`/detect-image`)** | Upload single road surface images for bounding box defect localization. |
| **Video Inspection (`/detect-video`)** | Upload road survey videos for frame-by-frame defect tracking. |
| **Audit History (`/history`)** | Filterable, paginated database of all historical inspection sessions. |
| **Reports & Analytics (`/reports`)** | Municipal defect breakdown and one-click CSV export. |
| **Methodology & Syllabus (`/methodology`)** | Theoretical computer vision foundations and academic course alignment. |

---

## 3. Running an Image Inspection

1. Navigate to **Image Inspection** (`/detect-image`).
2. **Select Media:** Drag and drop a road photo into the dashed dropzone, or click anywhere inside to browse local files (JPEG, PNG, WebP up to 20 MB).
3. **Adjust Hyperparameters (Optional):**
   - **Confidence Threshold:** Default is `25%`. Increase to filter out weaker candidate boxes; decrease if detecting faint surface cracks.
   - **IoU Threshold:** Default is `45%`. Controls the Non-Maximum Suppression overlap threshold to prevent duplicate boxes on the same defect.
4. **Execute Detection:** Click **Execute YOLOv8 Detection**.
5. **Analyze Results:**
   - **Summary Counter Cards:** Displays total detections, individual counts for potholes, cracks, and manholes, and highest severity level.
   - **Interactive Viewport:** View the annotated image with colored bounding boxes. Click **Show Original** to toggle between the raw uploaded photo and the detection overlay.
   - **Detection Breakdown Table:** Inspect granular details for every identified defect: Class name, Confidence %, Normalized Coordinates $[x_1, y_1, x_2, y_2]$, Pixel Area, Area % of frame, and Assigned Severity.

---

## 4. Running a Video Inspection

1. Navigate to **Video Inspection** (`/detect-video`).
2. **Upload Video:** Drag and drop an MP4, AVI, or MOV road survey video (up to 100 MB).
3. **Configure Settings:** Set confidence and IoU thresholds.
4. **Process Video:** Click **Process Video Stream**. The backend decodes frames via OpenCV, runs YOLO inference sequentially, annotates detections, and re-encodes the stream.
5. **Playback:** Review the annotated video in the embedded video player.

---

## 5. Reviewing Inspection Audit History

1. Navigate to **Audit History** (`/history`).
2. **Filtering Records:**
   - **Severity Filter:** Filter records by `High`, `Moderate`, `Low`, or `All`.
   - **Defect Class Filter:** Filter sessions containing `Potholes`, `Cracks`, or `Manholes`.
3. **Inspect Dossier:** Click on any session row or the **View Details** icon to open the deep inspection modal:
   - Compares the original and annotated images side by side.
   - Lists timestamp, filename, processing latency, and full defect breakdown.
4. **Delete Record:** Click the trash icon to permanently remove an inspection session from the SQLite database.

---

## 6. Exporting Reports & Municipal CSV

1. Navigate to **Reports & Analytics** (`/reports`).
2. Review the class distribution table mapped to municipal maintenance actions:
   - **Potholes:** Asphalt patching and cavity filling.
   - **Cracks:** Bituminous sealing and crack routing.
   - **Manholes:** Utility asset inspection.
3. Click **Export All Detections (.CSV)** in the top-right corner.
4. The browser automatically downloads `roadguard_detections.csv` containing:
   - Session ID and timestamp
   - Media filename
   - Defect Class (Pothole / Crack / Manhole)
   - Confidence score
   - Bounding box coordinates $[x_1, y_1, x_2, y_2]$
   - Area percentage and Severity level.

