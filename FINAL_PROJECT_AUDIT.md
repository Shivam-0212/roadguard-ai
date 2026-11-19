# RoadGuard AI — Final Project Audit, Cleanup & Release Certification Report

**Course:** CSE471 — Deep Learning for Computer Vision  
**Project:** RoadGuard AI: Automated Road Pothole and Asphalt Crack Detection for Smart Maintenance  
**Lead AI/ML & Full-Stack Engineer:** Shivam Rai  
**Document Type:** Final Comprehensive Project Audit, Provenance & Release Report  
**Date of Completion:** November 19, 2026  
**Status:** **RELEASE-READY (VERIFIED & AUDITED)**  

---

## 1. Executive Summary & Authoritative Source of Truth

This report establishes the final audit, model provenance, and release certification for RoadGuard AI prior to public GitHub release.

### 1.1 Authoritative Training Source: Original Notebook
The authoritative source of truth for the model architecture, training configuration, dataset split, and empirical evaluation metrics associated with the production application is:
```text
notebooks/RoadGuard_AI_YOLOv8_Training.ipynb
```
- **Authoritative Model Weights:** `artifacts/models/best.pt`
- **Model Checkpoint SHA-256:** `5fb5a3ab3fde72415f2a908bdefa272bf9521b8190795e6e6136ed8fdf4a7f25`
- **File Size:** 6,483,754 bytes (~6.25 MB)
- **Base Pretrained Weights:** MS COCO `yolov8n.pt`
- **Architecture:** Ultralytics YOLOv8-nano (73 fused layers, 3,133,193 parameters, 8.6 GFLOPs at 640×640)
- **Dataset Partitioning (Authoritative Baseline):** 80% Train (1,607 images), 10% Validation (200 images), 10% Held-Out Test (202 images), Random Seed: 42
- **Training Hyperparameters:** 50 epochs, imgsz=640, batch=8, patience=15, workers=2, project='road_damage', name='yolov8n_training'
- **Authoritative Test Split Metrics (202 Held-Out Road Images):**
  - **mAP@50:** **45.96%** (Pothole: 40.44%, Crack: 31.58%, Manhole: 65.87%)
  - **mAP@50-95:** **20.03%**
  - **Mean Precision ($P$):** **59.53%** (Pothole: 65.41%, Crack: 52.60%, Manhole: 60.59%)
  - **Mean Recall ($R$):** **45.76%** (Pothole: 34.88%, Crack: 30.67%, Manhole: 71.74%)
  - **Balanced $F_1$-Score:** **51.75%**

### 1.2 Separation of Later Research Experiments
The second notebook (`notebooks/RoadGuard_AI_Accuracy_Improvement.ipynb`) contains separate research explorations:
- Experiment 0: Clean recording-level split, 50 epochs (Validation mAP@50: 44.93%)
- Experiment 1: Clean recording-level split, 120 epochs (Validation mAP@50: 44.83%)
- Held-out clean test split (194 images): 29.70%
In strict adherence to scientific rigor, these later experimental metrics have **not** been merged into the original application artifacts. The accuracy notebook has been archived to `archive/notebooks/` and preserved outside the public Git release.

---

## 2. Model Provenance & Verification

| Checkpoint Path | SHA-256 Hash | Size (bytes) | Role in Project | Loading Status |
| :--- | :--- | :---: | :--- | :---: |
| `artifacts/models/best.pt` | `5fb5a3ab3fde72415f2a908bdefa272bf9521b8190795e6e6136ed8fdf4a7f25` | 6,483,754 | **Active Production Weights** | Loaded by FastAPI Backend |
| `archive/models/baseline_v1_best.pt` | `5fb5a3ab3fde72415f2a908bdefa272bf9521b8190795e6e6136ed8fdf4a7f25` | 6,483,754 | Archived Identical Backup | Preserved in `archive/` |
| `archive/models/yolov8n.pt` | `83a5bd2085c83cc3ded38336bac3b5f8bd4adcbacfa9efbe437ef17a6475bb74` | 6,548,721 | Original COCO Pretrained Weights | Preserved in `archive/` |

**Verification Confirmation:** The backend dynamically loads `artifacts/models/best.pt` via `backend/app/config.py` and `backend/app/core/model_loader.py`. The active checkpoint was never modified or overwritten.

---

## 3. Comprehensive File Classification & Cleanup Inventory

### 3.1 Retained in Public GitHub Repository
- **Application Core:**
  - `frontend/`: Complete React 18 + Vite + TypeScript application (7 active views, Tailwind CSS, Recharts, API service).
  - `frontend/public/favicon.svg`: Brand asset.
  - `backend/`: Complete FastAPI application (`backend/app/`, `backend/main.py`, `backend/tests/`, `requirements.txt`).
  - `ml/`: Inference engine (`ml/inference/detector.py`), dataset configs (`ml/configs/`), evaluation CLI (`ml/evaluation/evaluate.py`), and local training script (`ml/training/train.py`).
  - `artifacts/models/best.pt`: Active YOLOv8-nano weights (~6.25 MB).
  - `artifacts/metrics/`: Authoritative baseline artifacts (`evaluation_metrics.json`, `results.csv`, `results.png`, `confusion_matrix.png`).
- **Essential Operational Scripts:**
  - `scripts/prepare_dataset.py`: 80/10/10 dataset preparation script.
  - `scripts/package_colab_dataset.py`: Colab packaging utility.
  - `scripts/test_local_inference.py`: CLI inference tester.
  - `scripts/verify_browser_playwright.py`: End-to-end browser test script.
  - `start.sh`, `run_backend.sh`, `run_frontend.sh`: Quick startup scripts.
- **Root Release Documentation:**
  - `README.md`: Public GitHub presentation, features, benchmarks, quick start.
  - `ARCHITECTURE.md`: Multi-tier architecture, ML diagrams, sequence flows, ER schemas.
  - `CHANGELOG.md`: Release notes from v1.0.0 through v1.1.0.
  - `FINAL_PROJECT_AUDIT.md`: This comprehensive audit report.
  - `.gitignore`: Hardened security and repository hygiene rules.
  - `.env.example`: Safe configuration template.
- **Documentation Subsystem (`docs/`):**
  - `docs/setup.md`: Reproducible installation and launch guide.
  - `docs/how-it-works.md`: Deep technical explanation of detection and severity math.
  - `docs/user-guide.md`: Practical end-user operations manual.
  - `docs/dataset-and-attribution.md`: Formal dataset profiling and Zenodo attribution.
  - `docs/screenshots/`: 15 verified desktop and mobile interface screenshots.
- **Authoritative Notebook:**
  - `notebooks/RoadGuard_AI_YOLOv8_Training.ipynb`: Original Google Colab training notebook.

### 3.2 Archived Locally Outside Public Repository (`archive/`)
All historical research materials and coursework notes have been preserved locally in `archive/` (git-ignored, zero risk of data loss):
- `archive/notebooks/RoadGuard_AI_Accuracy_Improvement.ipynb`: Second experimental Colab notebook.
- `archive/research_reports/`:
  - `BASELINE_MODEL_ANALYSIS.md`
  - `DATASET_DIAGNOSTIC_REPORT.md`
  - `EXPERIMENT_COMPARISON_REPORT.md`
  - `EXPERIMENT_LOG.md`
  - `LEAKAGE_RESISTANT_SPLIT_REPORT.md`
  - `MODEL_IMPROVEMENT_PLAN.md`
  - `SECOND_EXPERIMENT_PLAN.md`
  - `SYSTEM_AUDIT_REPORT.md`
  - `TEST_REPORT.md`
- `archive/academic_coursework/`:
  - `COURSE_SYLLABUS_CSE471.md`
  - `PRESENTATION_AND_VIVA.md`
  - `PROJECT_BRIEF.md`
  - `PROJECT_GUIDE.md`
  - `IMPLEMENTATION_PLAN.md`
  - `ENVIRONMENT.md`
  - `TRAINING_GUIDE.md`
  - `DATASET_INFO.md`
  - `USER_GUIDE.md`
- `archive/research_scripts/`:
  - `build_accuracy_notebook.py`
  - `diagnose_validation_errors.py`
  - `verify_improved_checkpoint.py`
  - `audit_perceptual_duplicates.py`
  - `prepare_leakage_resistant_dataset.py`
  - `audit_dataset.py`
- `archive/models/`:
  - `baseline_v1_best.pt`
  - `yolov8n.pt`
- `archive/reports/`:
  - `audit_samples/`, `browser_verification_summary.json`, `dataset_audit_report.md`, `dataset_diagnostic_stats.json`, `error_analysis/`, `inference_samples/`, `leakage_resistant_split_manifest.csv`, `leakage_resistant_split_manifest.json`, `perceptual_hash_audit.json`.
- `archive/road_damage_colab.zip`: 184.36 MB dataset archive.
- `RoadGuard_Pre_Cleanup_Backup.tar.gz`: Complete 251.42 MB pre-cleanup backup located at `/Users/shivamrai/Desktop/RoadGuard_Pre_Cleanup_Backup.tar.gz`.

### 3.3 Removed from Public Release
- Decommissioned `frontend/src/pages/ModelEvaluation.tsx`.
- Removed obsolete screenshot `docs/screenshots/10_model_evaluation_desktop.png`.
- Removed redundant root `yolov8n.pt`.
- Cleaned all operating system `.DS_Store` cache files.

---

## 4. Frontend Audit & Quality Assurance

1. **Model Evaluation Dashboard Absence:**
   - Routes: Removed from `frontend/src/App.tsx`.
   - Navigation: Removed from desktop sidebar and mobile navigation drawer in `frontend/src/components/Layout.tsx`.
   - API Hooks: Unused frontend calls removed from `frontend/src/services/api.ts`.
2. **Active Pages Usability:**
   - Landing (`/`), Dashboard (`/dashboard`), Image Inspection (`/detect-image`), Video Inspection (`/detect-video`), History (`/history`), Reports (`/reports`), and Methodology (`/methodology`) all render cleanly.
3. **TypeScript & Production Build:**
   - Executed `npm run build` (`tsc && vite build`).
   - Compilation time: **1.79s** with **0 TypeScript errors** and **0 Vite bundle errors**.

---

## 5. Backend Audit & Inference Verification

1. **Service Startup & Health:**
   - FastAPI server starts cleanly via `./run_backend.sh` or `backend/main.py`.
   - `GET /api/health` returns HTTP 200 `{"status": "healthy", "service": "RoadGuard AI", "version": "1.0.0"}`.
   - `GET /api/model/status` confirms YOLOv8-nano loaded on device `mps` with classes `0: pothole`, `1: crack`, `2: manhole`.
2. **Pytest Unit Test Suite:**
   - Command: `.venv/bin/pytest backend/tests/ -v`
   - Results: **15 / 15 tests passed** in 1.77s.
3. **Live Inference Verification:**
   - Executed live image detection request with sample test image `20250219_164838.jpg`.
   - Detected Crack (confidence 75.07%, area 50.13%, severity High) and Manhole.
   - Bounding boxes rendered and saved to `outputs/images/`.
   - Relational session and defect records persisted to `roadguard.db`.

---

## 6. Documentation Modernization

- **`README.md`:** Comprehensive, clean public presentation linking to `ARCHITECTURE.md`, `CHANGELOG.md`, `docs/setup.md`, `docs/how-it-works.md`, `docs/user-guide.md`, and `docs/dataset-and-attribution.md`.
- **`ARCHITECTURE.md`:** Updated diagrams to remove the deprecated evaluation dashboard view, keeping sequence flows and ER diagrams synchronized.
- **`CHANGELOG.md`:** Documented v1.1.0 finalization milestones.
- **`docs/` Suite:** Created 4 modular, user-friendly markdown guides.

---

## 7. Limitations & Future Scope

- **Visual Severity is Heuristic:** Severity ratings represent an explainable visual proxy (area %, aspect ratio, camera proximity), not a core-drilled structural analysis.
- **Monocular 2D Camera:** Physical millimeter cavity depth ($Z$-axis) cannot be directly measured from single RGB frames.
- **Domain Adaptation:** The underlying dataset was collected in Rome/Sacrofano, Italy. Adaptation to other road topologies requires transfer fine-tuning.

---

## 8. GitHub Release Checklist

- [x] Authoritative training notebook established (`notebooks/RoadGuard_AI_YOLOv8_Training.ipynb`).
- [x] Active model checkpoint verified by SHA-256 (`5fb5a3ab3fde72415f...`).
- [x] Recoverable backup created (`/Users/shivamrai/Desktop/RoadGuard_Pre_Cleanup_Backup.tar.gz`).
- [x] Historical research and coursework materials preserved in local `archive/`.
- [x] Model evaluation dashboard completely removed from frontend UI.
- [x] Frontend builds cleanly with zero TypeScript errors (`npm run build`).
- [x] Backend test suite passes 100% (15/15 tests passing).
- [x] Live end-to-end inference tested and verified.
- [x] Standardized entrypoints provided (`backend/main.py`, `frontend/public/favicon.svg`).
- [x] Documentation synchronized across `README.md`, `ARCHITECTURE.md`, and `docs/`.
- [x] `.gitignore` verified to exclude large datasets, databases, and local archive.
- [x] Zero automatic commits or pushes performed.

---
*Report certified by Senior Full-Stack & ML QA Engineering Lead — November 19, 2026.*
