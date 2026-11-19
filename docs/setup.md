# RoadGuard AI — Setup & Local Execution Guide

This guide provides step-by-step instructions for installing dependencies, configuring model checkpoints, and launching the full-stack RoadGuard AI application locally.

---

## 1. System Requirements

- **Operating System:** macOS (Apple Silicon M1/M2/M3 or Intel), Linux (Ubuntu 20.04+), or Windows (WSL2 recommended).
- **Python:** Python 3.11.x (Python 3.10+ supported).
- **Node.js:** Node.js v18.x or v20.x with npm.
- **Hardware Acceleration:**
  - Apple Silicon: Metal Performance Shaders (MPS) automatically detected.
  - Linux/Windows: CUDA GPU if available; otherwise runs automatically on CPU.

---

## 2. Quick Start (Automated Launch)

Clone the repository and run the automated startup script:

```bash
git clone https://github.com/Shivam-0212/roadguard-ai.git
cd roadguard-ai

# Make startup scripts executable
chmod +x start.sh run_backend.sh run_frontend.sh

# Launch backend and frontend concurrently
./start.sh
```

The script automatically activates the Python virtual environment, verifies dependencies, starts the FastAPI backend at `http://localhost:8000`, and serves the React Vite frontend at `http://localhost:5173`.

---

## 3. Manual Step-by-Step Installation

If you prefer to configure each subsystem independently:

### Step 3.1: Python Virtual Environment & Backend Setup

```bash
# 1. Create a Python 3.11 virtual environment in the project root
python3.11 -m venv .venv

# 2. Activate the virtual environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows (cmd):
# .venv\Scripts\activate.bat
# On Windows (PowerShell):
# .venv\Scripts\Activate.ps1

# 3. Upgrade pip and install backend requirements
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### Step 3.2: Frontend Dependencies Setup

```bash
# Navigate to the frontend directory and install npm packages
cd frontend
npm install
cd ..
```

---

## 4. Model Checkpoint Setup

RoadGuard AI requires the trained YOLOv8-nano weights checkpoint located at:
```text
artifacts/models/best.pt
```

### Checkpoint Verification
The pre-trained checkpoint is included directly in the repository. Verify its integrity:

- **File Path:** `artifacts/models/best.pt`
- **File Size:** ~6.25 MB (6,483,754 bytes)
- **SHA-256 Hash:** `5fb5a3ab3fde72415f2a908bdefa272bf9521b8190795e6e6136ed8fdf4a7f25`

To verify the hash locally:
```bash
# On macOS:
shasum -a 256 artifacts/models/best.pt

# On Linux:
sha256sum artifacts/models/best.pt
```

*(Optional)* If you wish to retrain YOLOv8-nano on Google Colab from scratch, consult the authoritative training notebook:
```text
notebooks/RoadGuard_AI_YOLOv8_Training.ipynb
```
Upon training completion, download `best.pt` from Colab and place it into `artifacts/models/best.pt`.

---

## 5. Environment Configuration

Copy the example configuration file:
```bash
cp .env.example .env
```

Default `.env` configuration:
```env
# Application Settings
PROJECT_NAME="RoadGuard AI"
VERSION="1.0.0"
API_PREFIX="/api"

# Paths
MODEL_PATH="artifacts/models/best.pt"
METRICS_PATH="artifacts/metrics/evaluation_metrics.json"
DATABASE_URL="sqlite:///roadguard.db"
UPLOAD_DIR="uploads"
OUTPUT_DIR="outputs"

# Inference Parameters
MAX_IMAGE_SIZE_MB=20
MAX_VIDEO_SIZE_MB=100
VIDEO_FRAME_SAMPLE_RATE=5
```

---

## 6. Running the Application

Open two separate terminal windows:

### Terminal 1: FastAPI Backend
```bash
source .venv/bin/activate
./run_backend.sh
```
- **Backend API:** `http://localhost:8000`
- **Interactive Swagger Documentation:** `http://localhost:8000/docs`
- **Health Endpoint:** `http://localhost:8000/api/health`

### Terminal 2: React Vite Frontend
```bash
./run_frontend.sh
```
- **Web Application:** `http://localhost:5173`

---

## 7. Running Automated Tests

Run the backend Pytest test suite:
```bash
source .venv/bin/activate
pytest backend/tests/ -v
```

Run the frontend TypeScript compilation and build verification:
```bash
cd frontend
npm run build
cd ..
```

---

## 8. Troubleshooting

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| `ModelNotReadyError` (503) | Checkpoint `best.pt` missing in `artifacts/models/` | Ensure `artifacts/models/best.pt` exists and matches the verified SHA-256 hash. |
| Port 8000 already in use | Previous backend process still active | Terminate process with `lsof -i :8000` followed by `kill -9 <PID>`. |
| Port 5173 already in use | Vite dev server already running | Vite will automatically switch to `5174` or terminate with `lsof -i :5173`. |
| `ModuleNotFoundError` | Virtual environment not activated | Run `source .venv/bin/activate` before executing backend scripts. |

---

## 9. Production Cloud Deployment (Vercel & Railway)

For instructions on deploying RoadGuard AI to live production (Vercel for React frontend, Railway for FastAPI & YOLOv8 backend, and persistent volume for SQLite), see the comprehensive deployment guide:

👉 **[docs/deployment-guide.md](deployment-guide.md)**


