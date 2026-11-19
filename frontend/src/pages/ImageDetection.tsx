import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Camera,
  Download,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
  ShieldAlert,
  Eye,
  EyeOff
} from 'lucide-react';
import { api, ApiError } from '../services/api';
import { ImageInspectionResponse } from '../types';
import { ClassBadge } from '../components/ClassBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ImageDetection: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [confThreshold, setConfThreshold] = useState<number>(0.25);
  const [iouThreshold, setIouThreshold] = useState<number>(0.45);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageInspectionResponse | null>(null);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setResult(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRunInference = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.uploadImage(selectedFile, confThreshold, iouThreshold);
      setResult(res);
      setShowOriginal(false);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 503) {
        setError(
          'Model checkpoint best.pt is not loaded. Train YOLOv8-nano using the Google Colab notebook (notebooks/RoadGuard_AI_YOLOv8_Training.ipynb) and place best.pt into artifacts/models/.'
        );
      } else {
        setError(err.message || 'Detection failed. Please verify image file format.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Road Image Inspection</h1>
        <p className="text-sm text-slate-400">
          Upload road surface images to detect potholes, cracks, and manholes with spatial localization
        </p>
      </div>

      {/* Control & Upload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dropzone */}
        <div className="lg:col-span-2 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-[#111726]/60 cursor-pointer transition-all group min-h-[220px]"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-colors mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              Drag & drop road image or <span className="text-amber-400">browse file</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP up to 20 MB</p>

            {selectedFile && (
              <div className="mt-4 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        </div>

        {/* Hyperparameter Settings */}
        <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Detection Thresholds</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Confidence Threshold:</span>
              <span className="text-amber-400 font-mono font-bold">{(confThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.95"
              step="0.05"
              value={confThreshold}
              onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 block">Filters weak candidate proposals</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">IoU NMS Threshold:</span>
              <span className="text-amber-400 font-mono font-bold">{(iouThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={iouThreshold}
              onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 block">Non-Maximum Suppression overlap limit</span>
          </div>

          <button
            onClick={handleRunInference}
            disabled={!selectedFile || loading}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              selectedFile && !loading
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{loading ? 'Analyzing Surface...' : 'Execute YOLOv8 Detection'}</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && <LoadingSpinner message="Executing YOLOv8-nano inference and bounding box calculations..." />}

      {/* Error / Model Not Ready Warning */}
      {error && (
        <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3.5 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-white">Inference Notice</h4>
            <p className="text-xs text-amber-300 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Detection Results */}
      {result && (
        <div className="space-y-8 animate-fadeIn">
          {/* Summary Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-[#111726] border border-slate-800">
              <span className="text-[11px] text-slate-400">Total Detections</span>
              <p className="text-xl font-black text-white mt-1">{result.detection_count}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111726] border border-red-500/20">
              <span className="text-[11px] text-red-400">Potholes</span>
              <p className="text-xl font-black text-white mt-1">{result.pothole_count}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111726] border border-amber-500/20">
              <span className="text-[11px] text-amber-400">Cracks</span>
              <p className="text-xl font-black text-white mt-1">{result.crack_count}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111726] border border-emerald-500/20">
              <span className="text-[11px] text-emerald-400">Manholes</span>
              <p className="text-xl font-black text-white mt-1">{result.manhole_count}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111726] border border-slate-800">
              <span className="text-[11px] text-slate-400">Highest Severity</span>
              <div className="mt-1">
                <SeverityBadge severity={result.highest_severity} />
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111726] border border-slate-800">
              <span className="text-[11px] text-slate-400">Latency</span>
              <p className="text-xl font-black text-white mt-1 font-mono">{result.processing_time_ms} ms</p>
            </div>
          </div>

          {/* Image Viewer with Toggle */}
          <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Visual Inspection Display</h3>
                <span className="text-xs text-slate-400 font-mono">
                  ({result.image_dimensions.width} × {result.image_dimensions.height} px)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  {showOriginal ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{showOriginal ? 'Show Detections' : 'Show Original'}</span>
                </button>

                <a
                  href={api.getMediaUrl(result.annotated_image_url)}
                  download={`annotated_${result.filename}`}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </a>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 max-h-[550px]">
              <img
                src={api.getMediaUrl(showOriginal ? result.original_image_url : result.annotated_image_url)}
                alt="Inspection Output"
                className="max-h-[550px] w-auto object-contain"
              />
            </div>
          </div>

          {/* Detections Detail Table */}
          <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-base">Detected Objects Specification</h3>

            {result.detections.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-900/60 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3">Confidence</th>
                      <th className="px-4 py-3">Bounding Box [x1, y1, x2, y2]</th>
                      <th className="px-4 py-3">Area (px²)</th>
                      <th className="px-4 py-3">Area %</th>
                      <th className="px-4 py-3">Center (Norm)</th>
                      <th className="px-4 py-3">Region</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-xs">
                    {result.detections.map((det) => (
                      <tr key={det.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 text-slate-400">{det.id}</td>
                        <td className="px-4 py-3 font-sans">
                          <ClassBadge classNameString={det.class_name} />
                        </td>
                        <td className="px-4 py-3 text-slate-200">{(det.confidence * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-slate-400">
                          [{det.bbox.map((v) => v.toFixed(0)).join(', ')}]
                        </td>
                        <td className="px-4 py-3 text-slate-300">{det.bbox_area.toLocaleString()}</td>
                        <td className="px-4 py-3 text-amber-400 font-bold">{det.area_percentage.toFixed(2)}%</td>
                        <td className="px-4 py-3 text-slate-400">
                          ({det.center_x.toFixed(2)}, {det.center_y.toFixed(2)})
                        </td>
                        <td className="px-4 py-3 text-slate-300 uppercase">{det.relative_position}</td>
                        <td className="px-4 py-3 font-sans">
                          <SeverityBadge severity={det.severity} />
                        </td>
                        <td className="px-4 py-3 font-sans text-slate-400 max-w-xs truncate" title={det.severity_rationale}>
                          {det.severity_rationale}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">
                No defect objects detected at confidence threshold {(confThreshold * 100).toFixed(0)}%.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

