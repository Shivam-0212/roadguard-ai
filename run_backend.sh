#!/usr/bin/env bash
# RoadGuard AI — Backend Startup Script
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

if [ -d ".venv" ]; then
    echo "[*] Activating virtual environment (.venv)..."
    source .venv/bin/activate
else
    echo "[!] Virtual environment .venv not found. Run 'python3.11 -m venv .venv && source .venv/bin/activate && pip install -r backend/requirements.txt' first."
    exit 1
fi

echo "[+] Starting RoadGuard AI FastAPI Backend on http://localhost:8000..."
exec python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

