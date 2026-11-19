#!/usr/bin/env bash
# RoadGuard AI — Frontend Startup Script
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/frontend"

echo "[+] Starting RoadGuard AI React Vite Frontend on http://localhost:5173..."
exec npm run dev -- --host 127.0.0.1 --port 5173

