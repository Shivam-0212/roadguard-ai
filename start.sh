#!/usr/bin/env bash
# RoadGuard AI — Concurrent Startup Script
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "============================================================"
echo " RoadGuard AI: Automated Road Defect Inspection Platform"
echo " Course: CSE471 — Deep Learning for Computer Vision"
echo "============================================================"

# Trap to kill both processes on exit
cleanup() {
    echo ""
    echo "[*] Shutting down RoadGuard AI services..."
    kill $(jobs -p) 2>/dev/null || true
}
trap cleanup EXIT

echo "[1/2] Launching FastAPI Backend on http://localhost:8000..."
./run_backend.sh &

echo "[2/2] Launching React Vite Frontend on http://localhost:5173..."
./run_frontend.sh &

echo ""
echo "[+] Services started successfully!"
echo "    - Frontend: http://localhost:5173"
echo "    - Backend:  http://localhost:8000"
echo "    - API Docs: http://localhost:8000/docs"
echo "    Press CTRL+C to stop all services."
echo "============================================================"

wait

