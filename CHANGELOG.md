# RoadGuard AI — Changelog & Implementation History

All notable changes, architectural decisions, and release milestones are documented in this file.

---

## [1.1.0] - 2026-11-19

### Final GitHub Release Preparation & Interface Streamlining

#### Frontend Finalization
- Decommissioned the dedicated Model Evaluation dashboard (`/evaluation`, `ModelEvaluation.tsx`) to prioritize real-time road inspection operations.
- Cleaned up routing in `App.tsx` and removed evaluation links from desktop and mobile navigation in `Layout.tsx`.
- Streamlined interface to 7 production-focused views: Overview, Executive Dashboard, Image Inspection, Video Inspection, Audit History, Reports & Analytics, and Methodology.
- Re-verified production build (`tsc && vite build`) with zero compilation errors.

#### Repository Architecture & Cleanup
- Standardized public repository structure into `frontend/`, `backend/`, `ml/`, `artifacts/`, `scripts/`, `docs/`, and `notebooks/`.
- Archived internal research reports, coursework notes, duplicate models, and experimental scripts into local `archive/` (git-ignored to protect repository hygiene).
- Established `notebooks/RoadGuard_AI_YOLOv8_Training.ipynb` as the authoritative source of truth for the working model checkpoint.
- Verified and whitelisted primary model weights (`artifacts/models/best.pt`, SHA-256: `5fb5a3ab3fde72415f2a908bdefa272bf9521b8190795e6e6136ed8fdf4a7f25`).
- Created standardized entrypoints `backend/main.py` and `frontend/public/favicon.svg`.
- Authored modular technical documentation: `docs/setup.md`, `docs/how-it-works.md`, `docs/user-guide.md`, and `docs/dataset-and-attribution.md`.

#### Automated Quality Assurance
- Pytest backend test suite executed: 15/15 unit and integration tests passing.
- Verified live end-to-end inference on Apple Silicon MPS with real road sample media.
- Created pre-cleanup recoverable archive (`RoadGuard_Pre_Cleanup_Backup.tar.gz`).

---

## [1.0.0] - 2026-11-18

### Initial Release — CSE471 Academic Full-Stack Vision System

#### Machine Learning & Data Pipeline
- Implemented comprehensive dataset audit script (`scripts/audit_dataset.py`) analyzing 2,009 road images, 4,737 annotations, image resolutions, file hashes, and duplicates.
- Generated visual audit verification samples in `artifacts/reports/audit_samples/`.
- Implemented reproducible 80/10/10 train/validation/test splitting pipeline (`scripts/prepare_dataset.py`) with fixed seed 42.
- Created Ultralytics dataset configuration (`ml/configs/road_damage.yaml`).
- Implemented headless YOLOv8-nano fine-tuning script (`ml/training/train.py`) with early stopping (`patience=15`).
- Implemented model evaluation and benchmark script (`ml/evaluation/evaluate.py`).
- Implemented reusable inference engine (`ml/inference/detector.py`) with support for Apple Silicon MPS, CUDA, and CPU fallback.
- Generated interactive Google Colab training notebook (`notebooks/RoadGuard_AI_YOLOv8_Training.ipynb`) with GPU auto-detection and Google Drive integration.
- Created cloud dataset packaging utility (`scripts/package_colab_dataset.py`).

#### Backend Application (FastAPI + SQLite)
- Engineered asynchronous FastAPI application with OpenAPI/Swagger documentation at `/docs`.
- Built SQLite persistence layer with SQLAlchemy ORM models (`InspectionSession` and `DefectDetection`).
- Implemented repository layer with CRUD, pagination, class filtering, and summary statistics.
- Developed explainable visual severity heuristic engine separating Potholes, Cracks, and Manholes.
- Developed frame-by-frame memory-safe video inspection service with configurable frame sampling.
- Implemented CSV export streaming endpoint (`/api/reports/detections.csv`).
- Created automated test suite (`backend/tests/`) with 14 unit and integration tests covering health, model status, coordinates, severity, database, and error responses.

#### Frontend Application (React 18 + Vite + TypeScript)
- Built modern dark-themed infrastructure user interface using Tailwind CSS and Lucide React.
- Created centralized, strictly-typed API client in `frontend/src/services/api.ts`.
- Implemented 8 distinct pages:
  - Page 1: Landing / Project Overview (`Landing.tsx`).
  - Page 2: Executive Dashboard (`Dashboard.tsx`) with Recharts bar and pie visualizations.
  - Page 3: Image Inspection (`ImageDetection.tsx`) with confidence/IoU sliders and before/after toggle.
  - Page 4: Video Stream Inspection (`VideoDetection.tsx`) with frame sampling details.
  - Page 5: Inspection Audit History (`DetectionHistory.tsx`) with multi-criteria filtering and detail modal.
  - Page 6: Reports & Analytics (`ReportsAnalytics.tsx`) with municipal maintenance mapping.
  - Page 7: Model Evaluation Dashboard (`ModelEvaluation.tsx`) with transparent pending states and mathematical formulations.
  - Page 8: Methodology & Syllabus Alignment (`Methodology.tsx`) mapping CSE471 Units I–VI and CO1–CO6.
- Verified zero-error production build (`npm run build`).

#### Technical Documentation
- Authored professional GitHub `README.md`.
- Authored 13-section `PROJECT_GUIDE.md` for student learning and professor explanations.
- Authored `TRAINING_GUIDE.md` detailing Google Colab execution and artifact migration.
- Authored `ARCHITECTURE.md` with system, ML, data flow, and ER diagrams.
- Authored `PRESENTATION_AND_VIVA.md` with 2–3 minute spoken presentation script and 80 graded viva questions.
- Authored comprehensive `TEST_REPORT.md`.

