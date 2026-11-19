import {
  DashboardSummary,
  ImageInspectionResponse,
  InspectionSessionDetail,
  ModelMetrics,
  ModelStatus,
  PaginatedSessionsResponse,
  VideoInspectionResponse
} from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
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
  async getHealth(): Promise<{ status: string; service: string; version: string; uptime_seconds: number }> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async getModelStatus(): Promise<ModelStatus> {
    const res = await fetch(`${API_BASE}/model/status`);
    return handleResponse(res);
  },

  async getModelMetrics(): Promise<ModelMetrics> {
    const res = await fetch(`${API_BASE}/model/metrics`);
    return handleResponse(res);
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    return handleResponse(res);
  },

  async uploadImage(file: File, conf: number = 0.25, iou: number = 0.45): Promise<ImageInspectionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/detections/image?conf=${conf}&iou=${iou}`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async uploadVideo(file: File, conf: number = 0.25, iou: number = 0.45): Promise<VideoInspectionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/detections/video?conf=${conf}&iou=${iou}`, {
      method: 'POST',
      body: formData,
    });
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

    const res = await fetch(`${API_BASE}/detections?${params.toString()}`);
    return handleResponse(res);
  },

  async getSessionDetail(sessionId: string): Promise<InspectionSessionDetail> {
    const res = await fetch(`${API_BASE}/detections/${sessionId}`);
    return handleResponse(res);
  },

  async deleteSession(sessionId: string): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/detections/${sessionId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  getExportCsvUrl(): string {
    return `${API_BASE}/reports/detections.csv`;
  }
};

