export interface DefectDetectionItem {
  id: number;
  class_id: number;
  class_name: 'pothole' | 'crack' | 'manhole' | string;
  display_name: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  width: number;
  height: number;
  bbox_area: number;
  area_percentage: number;
  center_x: number;
  center_y: number;
  relative_position: string;
  relative_x: 'left' | 'center' | 'right';
  relative_y: 'upper' | 'middle' | 'lower';
  severity: 'low' | 'moderate' | 'high' | 'infrastructure';
  severity_score: number;
  severity_rationale: string;
}

export interface ImageInspectionResponse {
  session_id: string;
  filename: string;
  file_type: 'image';
  original_image_url: string;
  annotated_image_url: string;
  created_at: string;
  detection_count: number;
  highest_severity: 'none' | 'low' | 'moderate' | 'high';
  pothole_count: number;
  crack_count: number;
  manhole_count: number;
  processing_time_ms: number;
  image_dimensions: {
    width: number;
    height: number;
    total_pixels: number;
  };
  detections: DefectDetectionItem[];
}

export interface VideoInspectionResponse {
  session_id: string;
  filename: string;
  file_type: 'video';
  original_video_url: string;
  annotated_video_url: string;
  created_at: string;
  total_frames_sampled: number;
  detection_count: number;
  highest_severity: 'none' | 'low' | 'moderate' | 'high';
  pothole_count: number;
  crack_count: number;
  manhole_count: number;
  processing_time_ms: number;
}

export interface InspectionSessionSummary {
  id: string;
  filename: string;
  file_type: 'image' | 'video';
  original_file_url: string;
  annotated_file_url?: string | null;
  created_at?: string;
  detection_count: number;
  highest_severity: 'none' | 'low' | 'moderate' | 'high';
  pothole_count: number;
  crack_count: number;
  manhole_count: number;
  processing_time_ms: number;
}

export interface InspectionSessionDetail extends InspectionSessionSummary {
  detections: DefectDetectionItem[];
}

export interface PaginatedSessionsResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  items: InspectionSessionSummary[];
}

export interface DashboardSummary {
  total_sessions: number;
  total_defects: number;
  total_potholes: number;
  total_cracks: number;
  total_manholes: number;
  high_severity_defects: number;
  model_ready: boolean;
  model_name: string;
  severity_distribution: {
    high: number;
    moderate: number;
    low: number;
    infrastructure: number;
  };
  recent_sessions: {
    id: string;
    filename: string;
    file_type: string;
    created_at: string;
    detection_count: number;
    highest_severity: string;
    potholes: number;
    cracks: number;
    manholes: number;
  }[];
}

export interface ModelStatus {
  model_ready: boolean;
  model_name: string;
  checkpoint_path: string;
  device: string;
  classes: Record<string | number, string>;
  message: string;
}

export interface ModelMetrics {
  status: 'completed' | 'pending_training' | string;
  message?: string;
  timestamp?: string | null;
  model_path?: string | null;
  metrics: {
    precision: number | null;
    recall: number | null;
    f1_score: number | null;
    map50: number | null;
    map50_95: number | null;
    inference_latency_ms: number | null;
  };
  per_class: {
    pothole: { precision: number | null; recall: number | null; map50: number | null; map50_95?: number | null };
    crack: { precision: number | null; recall: number | null; map50: number | null; map50_95?: number | null };
    manhole: { precision: number | null; recall: number | null; map50: number | null; map50_95?: number | null };
  };
}

