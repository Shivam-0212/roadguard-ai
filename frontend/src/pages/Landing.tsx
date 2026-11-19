import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Camera,
  LayoutDashboard,
  BrainCircuit,
  ArrowRight,
  Layers,
  Sparkles,
  Database,
  BarChart2,
  CheckCircle2,
  Activity,
  Cpu
} from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#161F33] via-[#111726] to-[#0B0F17] border border-slate-800 p-8 md:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CSE471 — Deep Learning for Computer Vision</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Automated Road Pothole & Asphalt Crack Detection
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed font-normal">
            An intelligent computer vision inspection system powered by a fine-tuned <strong className="text-amber-400">YOLOv8-nano</strong> model. Detects road cavities, asphalt fractures, and municipal manholes in real-time, estimates visual severity, and maintains automated maintenance audit logs.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/detect-image"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              <Camera className="w-4 h-4" />
              <span>Start Image Inspection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Open Dashboard</span>
            </Link>

            <Link
              to="/methodology"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-transparent hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all"
            >
              <span>Methodology & Syllabus</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Target Defect Classes */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-white">Target Detection Categories</h2>
          <p className="text-sm text-slate-400">
            Fine-tuned on 2,009 real-world road inspection images across three distinct classes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pothole */}
          <div className="p-6 rounded-2xl bg-[#111726] border border-red-500/20 relative overflow-hidden group hover:border-red-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-white">Class 0: Pothole</h3>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-red-500/10 text-red-400">1,261 instances</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Cavities and structural pavement depressions created by water infiltration and vehicular stress. Rated with prioritized visual severity based on area and camera proximity.
            </p>
          </div>

          {/* Crack */}
          <div className="p-6 rounded-2xl bg-[#111726] border border-amber-500/20 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-white">Class 1: Crack</h3>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">2,519 instances</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Longitudinal, transverse, and alligator fatigue cracking across asphalt layers. Severity heuristics evaluate aspect ratio and pixel area percentage.
            </p>
          </div>

          {/* Manhole */}
          <div className="p-6 rounded-2xl bg-[#111726] border border-emerald-500/20 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-white">Class 2: Manhole</h3>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">957 instances</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Subsurface utility access covers. Identified separately as legitimate road infrastructure assets, preventing false positive damage reports.
            </p>
          </div>
        </div>
      </section>

      {/* System Pipeline Architecture */}
      <section className="p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-amber-400" />
          <span>End-to-End System Architecture</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#161F33] border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-amber-400">01. INGESTION</span>
            <h4 className="font-semibold text-white text-sm">Media Validation</h4>
            <p className="text-xs text-slate-400">
              Accepts road images (JPEG/PNG) and videos. Enforces size limits, formats, and sanitizes filenames.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#161F33] border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-amber-400">02. DEEP INFERENCE</span>
            <h4 className="font-semibold text-white text-sm">YOLOv8-nano Model</h4>
            <p className="text-xs text-slate-400">
              Single-stage object detector running locally on Apple Silicon MPS or CPU with zero cloud inference cost.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#161F33] border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-amber-400">03. GEOMETRY & SEVERITY</span>
            <h4 className="font-semibold text-white text-sm">Severity Engine</h4>
            <p className="text-xs text-slate-400">
              Calculates bounding box area %, normalized center coordinates, and assigns Low/Moderate/High severity.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#161F33] border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-amber-400">04. PERSISTENCE</span>
            <h4 className="font-semibold text-white text-sm">SQLite Audit & CSV</h4>
            <p className="text-xs text-slate-400">
              Logs inspection sessions, defect coordinates, and supports historical query and CSV export.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Stack Grid */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider text-center">
          Open-Source Technology Stack
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            'Python 3.11',
            'Ultralytics YOLOv8n',
            'PyTorch',
            'OpenCV',
            'FastAPI',
            'React 18',
            'Vite',
            'TypeScript',
            'Tailwind CSS',
            'SQLite',
            'Google Colab'
          ].map((tech) => (
            <span
              key={tech}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};

