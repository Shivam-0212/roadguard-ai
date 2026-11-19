import {
  DashboardSummary,
  ImageInspectionResponse,
  InspectionSessionDetail,
  ModelMetrics,
  ModelStatus,
  PaginatedSessionsResponse,
  VideoInspectionResponse
} from '../types';

const BACKEND_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return BACKEND_URL ? `${BACKEND_URL}${cleanPath}` : cleanPath;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 60000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return res;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. The server may be experiencing high load or warming up from a cold start.', 504);
    }
    if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
      throw new ApiError('Unable to connect to the backend server. It may be starting up or temporarily offline.', 503);
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorMessage = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // Use fallback error message
    }
    throw new ApiError(errorMessage, response.status);
  }
  return response.json();
}

export const api = {
  getMediaUrl(path: string | null | undefined): string {
    return getMediaUrl(path);
  },

  async getHealth(): Promise<{ status: string; service: string; version: string; uptime_seconds: number }> {
    const res = await fetchWithTimeout(`${API_BASE}/health`, {}, 10000);
    return handleResponse(res);
  },

  async getModelStatus(): Promise<ModelStatus> {
    const res = await fetchWithTimeout(`${API_BASE}/model/status`, {}, 10000);
    return handleResponse(res);
  },

  async getModelMetrics(): Promise<ModelMetrics> {
    const res = await fetchWithTimeout(`${API_BASE}/model/metrics`, {}, 10000);
    return handleResponse(res);
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetchWithTimeout(`${API_BASE}/dashboard/summary`, {}, 15000);
    return handleResponse(res);
  },

  async uploadImage(file: File, conf: number = 0.25, iou: number = 0.45): Promise<ImageInspectionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetchWithTimeout(`${API_BASE}/detections/image?conf=${conf}&iou=${iou}`, {
      method: 'POST',
      body: formData,
    }, 60000);
    return handleResponse(res);
  },

  async uploadVideo(file: File, conf: number = 0.25, iou: number = 0.45): Promise<VideoInspectionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetchWithTimeout(`${API_BASE}/detections/video?conf=${conf}&iou=${iou}`, {
      method: 'POST',
      body: formData,
    }, 120000);
    return handleResponse(res);
  },

  async getSessions(
    page: number = 1,
    limit: number = 10,
    severity?: string,
    defect?: string
  ): Promise<PaginatedSessionsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (severity && severity !== 'all') params.append('severity', severity);
    if (defect && defect !== 'all') params.append('defect', defect);

    const res = await fetchWithTimeout(`${API_BASE}/detections?${params.toString()}`, {}, 15000);
    return handleResponse(res);
  },

  async getSessionDetail(sessionId: string): Promise<InspectionSessionDetail> {
    const res = await fetchWithTimeout(`${API_BASE}/detections/${sessionId}`, {}, 15000);
    return handleResponse(res);
  },

  async deleteSession(sessionId: string): Promise<{ status: string; message: string }> {
    const res = await fetchWithTimeout(`${API_BASE}/detections/${sessionId}`, {
      method: 'DELETE',
    }, 15000);
    return handleResponse(res);
  },

  getExportCsvUrl(): string {
    return BACKEND_URL ? `${BACKEND_URL}/api/reports/detections.csv` : '/api/reports/detections.csv';
  }
};

