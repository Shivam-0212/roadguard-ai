import React, { useState, useRef } from 'react';
import {
  Video as VideoIcon,
  UploadCloud,
  Sliders,
  Download,
  AlertTriangle,
  Play,
  Clock,
  Layers,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { api, ApiError } from '../services/api';
import { VideoInspectionResponse } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const VideoDetection: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confThreshold, setConfThreshold] = useState<number>(0.25);
  const [iouThreshold, setIouThreshold] = useState<number>(0.45);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VideoInspectionResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setResult(null);
  };

  const handleRunInference = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.uploadVideo(selectedFile, confThreshold, iouThreshold);
      setResult(res);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 503) {
        setError(
          'Model checkpoint best.pt is not loaded. Train YOLOv8-nano using the Google Colab notebook and place best.pt into artifacts/models/.'
        );
      } else {
        setError(err.message || 'Video processing failed. Verify video format and codec.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Road Video Inspection</h1>
        <p className="text-sm text-slate-400">
          Streamlined frame-by-frame video processing optimized for local CPU and Apple Silicon MPS
        </p>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Upload Dropzone */}
        <div className="lg:col-span-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-[#111726]/60 cursor-pointer transition-all group min-h-[220px]"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              accept="video/mp4,video/avi,video/quicktime,video/x-matroska"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-colors mb-3">
              <VideoIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              Select or drop road video for analysis
            </p>
            <p className="text-xs text-slate-500 mt-1">MP4, AVI, MOV up to 100 MB</p>

            {selectedFile && (
              <div className="mt-4 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
              </div>
            )}
          </div>
        </div>

        {/* Hyperparameters */}
        <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Video Inference Config</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Confidence Threshold:</span>
              <span className="text-amber-400 font-mono font-bold">{(confThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={confThreshold}
              onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300">Frame Sampling:</span>
            <p>Every 5th frame is processed to maintain high frame-rate throughput on MacBook Air M2 without memory exhaustion.</p>
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
            <Play className="w-4 h-4" />
            <span>{loading ? 'Processing Video...' : 'Process Video'}</span>
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner message="Extracting frames, running YOLOv8 detection, and encoding output video..." />}

      {error && (
        <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3.5 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">Video Inference Notice</h4>
            <p className="text-xs text-amber-300 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Video Output Display */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-[#111726] border border-slate-800">
              <span className="text-[11px] text-slate-400">Sampled Frames</span>
              <p className="text-xl font-black text-white mt-1 font-mono">{result.total_frames_sampled}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111726] border border-slate-800">
              <span className="text-[11px] text-slate-400">Total Detections</span>
              <p className="text-xl font-black text-white mt-1 font-mono">{result.detection_count}</p>
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
          </div>

          {/* Video Player */}
          <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Processed Output Video</h3>
              <a
                href={result.annotated_video_url}
                download={result.filename}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Video</span>
              </a>
            </div>

            <div className="rounded-xl overflow-hidden bg-black border border-slate-800 flex justify-center max-h-[500px]">
              <video
                src={result.annotated_video_url}
                controls
                className="max-h-[500px] w-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

