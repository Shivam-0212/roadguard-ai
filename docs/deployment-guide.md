# RoadGuard AI — Live Production Deployment Guide

This guide provides end-to-end instructions for deploying RoadGuard AI to production:
- **Frontend**: Hosted on [Vercel](https://vercel.com) (React 18 + TypeScript + Vite SPA).
- **Backend & ML Inference**: Hosted on [Railway](https://railway.app) (FastAPI + YOLOv8-nano CPU inference).
- **Database & Storage**: SQLite with a Railway Persistent Volume mounted at `/data` to preserve inspection history and uploaded/annotated media across container restarts.

---

## Architecture Overview

```
+----------------------------------------------------------------+
|                        USER BROWSER                            |
|               (https://roadguard-ai.vercel.app)                |
+-------------------------------+--------------------------------+
                                |
             HTTPS API Requests | Dynamic Media Links
                                v
+----------------------------------------------------------------+
|                   RAILWAY BACKEND CONTAINER                    |
|      (https://roadguard-ai-production.up.railway.app)          |
|                                                                |
|  +--------------------+   +---------------------------------+  |
|  | FastAPI (Port $PORT)|   | YOLOv8-nano PyTorch CPU Runtime |  |
|  +--------------------+   +---------------------------------+  |
|            |                                |                  |
|            v                                v                  |
|  +----------------------------------------------------------+  |
|  |         Persistent Storage Volume (Mount: /data)         |  |
|  |  - /data/roadguard.db (SQLite Database)                  |  |
|  |  - /data/uploads/     (Raw uploaded images & videos)     |  |
|  |  - /data/outputs/     (Annotated inspection results)     |  |
|  +----------------------------------------------------------+  |
+----------------------------------------------------------------+
```

---

## Part 1: Deploy Backend to Railway

Railway provides containerized hosting with dynamic port mapping, health checks, and persistent volumes.

### Step 1: Create a New Project on Railway
1. Log in to your [Railway Dashboard](https://railway.app).
2. Click **+ New Project** -> **Deploy from GitHub repo**.
3. Select your repository: `Shivam-0212/roadguard-ai`.
4. Railway will automatically detect the root `Dockerfile` and `railway.json`.

### Step 2: Attach a Persistent Volume for SQLite & Media
To ensure your SQLite database (`roadguard.db`) and uploaded/annotated media files persist across redeployments:
1. In your Railway service view, navigate to the **Volumes** tab (or click **+ New** -> **Volume**).
2. Set the **Mount Path** to:
   ```
   /data
   ```
3. Click **Add Volume**.

### Step 3: Configure Environment Variables
Navigate to the **Variables** tab of your Railway service and add the following:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite:////data/roadguard.db` | Points SQLite to the persistent volume |
| `UPLOAD_DIR` | `/data/uploads` | Stores raw uploaded media on persistent volume |
| `OUTPUT_DIR` | `/data/outputs` | Stores annotated media on persistent volume |
| `MODEL_PATH` | `/app/artifacts/models/best.pt` | Path to trained YOLOv8-nano checkpoint |
| `METRICS_PATH` | `/app/artifacts/metrics/evaluation_metrics.json` | Path to evaluation metrics |
| `MAX_IMAGE_SIZE_MB` | `20` | Max allowed image upload size |
| `MAX_VIDEO_SIZE_MB` | `100` | Max allowed video upload size |
| `VIDEO_FRAME_SAMPLE_RATE` | `5` | Sample every 5th frame for fast CPU inference |
| `CORS_ORIGINS` | `https://roadguard-ai.vercel.app,http://localhost:5173` | Allowed frontend origins |

> [!NOTE]
> `PORT` is automatically injected by Railway into the container. Uvicorn binds automatically to `0.0.0.0:$PORT`.
> The backend strictly allows only explicitly configured origins specified in `CORS_ORIGINS` (along with standard localhost origins for development). Wildcards and broad subdomain patterns are disabled for production security.

### Step 4: Generate a Public Domain
1. In the service view, navigate to **Settings** -> **Networking** -> **Public Networking**.
2. Click **Generate Domain**.
3. Note the generated HTTPS domain, for example:
   `https://roadguard-ai-production.up.railway.app`

### Step 5: Verify Backend Health
Test the live backend endpoints from your terminal:
```bash
# Verify health check
curl https://<your-railway-domain>.up.railway.app/api/health

# Verify model readiness on Linux CPU
curl https://<your-railway-domain>.up.railway.app/api/model/status
```
Expected output:
```json
{"status":"healthy","service":"RoadGuard AI","version":"1.0.0"}
{"model_ready":true,"model_name":"YOLOv8-nano","device":"cpu",...}
```

---

## Part 2: Deploy Frontend to Vercel

Vercel hosts the React + Vite single-page application with global edge CDN distribution and automatic SPA routing.

### Step 1: Import Project into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `Shivam-0212/roadguard-ai`.

### Step 2: Configure Project Settings
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend` *(Click Edit and choose `frontend`)*
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables
In the **Environment Variables** section, add:

| Key | Value | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Your Railway public domain (without trailing slash) | `https://roadguard-ai-production.up.railway.app` |

### Step 4: Deploy
Click **Deploy**. Vercel will build and deploy the frontend in under a minute.
Once deployed, Vercel provides a live URL (e.g., `https://roadguard-ai.vercel.app`).

> [!TIP]
> Both `vercel.json` (at root) and `frontend/vercel.json` include SPA rewrites (`/(.*) -> /index.html`), ensuring page refreshes on subroutes like `/detect-image`, `/history`, and `/reports` will not return 404 errors.

---

## Part 3: End-to-End Verification Checklist

Once both services are deployed, perform the following verification steps in your browser:

1. **Header Status Badges**:
   - Open your deployed frontend URL.
   - Verify the top-right status pill shows **Backend Online** with a green dot.
   - Verify the model pill shows **YOLOv8 Online**.

2. **Image Inspection**:
   - Go to `/detect-image`.
   - Upload a test road image (`.jpg` or `.png`).
   - Adjust confidence threshold to `0.25`.
   - Click **Execute YOLOv8 Detection**.
   - Verify bounding boxes appear on screen and that **Download Image** downloads the annotated result.

3. **Video Inspection**:
   - Go to `/detect-video`.
   - Upload a short MP4 road video (under 100 MB).
   - Click **Execute YOLOv8 Video Inspection**.
   - Verify that processed frames render with bounding boxes and the annotated video plays smoothly.

4. **Audit History & SQLite Persistence**:
   - Go to `/history`.
   - Verify your recent image and video inspection sessions are listed.
   - Click the eye icon to view detailed bounding box coordinates and severity rationale.
   - Test session deletion: verify deleting a session safely cleans up the associated files.

5. **Reports & CSV Export**:
   - Go to `/reports`.
   - Click **Export Detections CSV**.
   - Verify the CSV downloads directly from the backend with full bounding box and severity columns.

---

## Part 4: Operational Best Practices & Troubleshooting

### Cold Starts
If deployed on Railway's free/starter tier, containers may sleep after inactivity.
- On cold start, the first request may take 10-20 seconds to spin up the container and load YOLO weights into RAM.
- The frontend includes built-in timeout handling (60s for images, 120s for videos) and displays a clear message if the server is warming up:
  `"Backend is temporarily unreachable or warming up (cold start). Please wait a moment and try again."`

### CORS Errors
If you see CORS errors in your browser DevTools:
1. Ensure your Render / Railway `CORS_ORIGINS` environment variable includes your exact deployed frontend domain (e.g. `https://<your-app>.vercel.app`).
2. Multiple domains can be provided as a comma-separated list (e.g. `https://roadguard-ai.vercel.app,http://localhost:5173`). Wildcard `*` is disallowed for security.

### Storage Management
- The persistent volume at `/data` retains SQLite data and inspection media.
- Deleting a session from the Audit History UI or via `DELETE /api/detections/{session_id}` automatically deletes the associated raw and annotated media files from disk.
- You can monitor volume usage directly in the Railway dashboard under the **Volumes** tab.

