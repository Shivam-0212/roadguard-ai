import React, { useState, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  BarChart3,
  ShieldAlert,
  Activity,
  Layers,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardSummary } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ReportsAnalytics: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.getDashboardSummary();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <LoadingSpinner message="Generating analytics overview..." />;

  const potholePct = data?.total_defects ? ((data.total_potholes / data.total_defects) * 100).toFixed(1) : '0';
  const crackPct = data?.total_defects ? ((data.total_cracks / data.total_defects) * 100).toFixed(1) : '0';
  const manholePct = data?.total_defects ? ((data.total_manholes / data.total_defects) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Reports & Asset Analytics</h1>
          <p className="text-sm text-slate-400">
            Export structured defect logs and review municipal road degradation statistics
          </p>
        </div>

        <a
          href={api.getExportCsvUrl()}
          download="roadguard_detections.csv"
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/10 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export All Detections (.CSV)</span>
        </a>
      </div>

      {/* Aggregate Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Logged Anomalies</span>
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-white">{data?.total_defects || 0}</div>
          <p className="text-xs text-slate-500">Across {data?.total_sessions || 0} inspection sessions</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#111726] border border-red-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-400 uppercase">Critical Priority Count</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-white">{data?.high_severity_defects || 0}</div>
          <p className="text-xs text-red-400/70">Urgent immediate road repaving / patching</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Audit Records Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">SQLite DB</div>
          <p className="text-xs text-slate-500">Zero-loss persistent relational storage</p>
        </div>
      </div>

      {/* Class Distribution Table */}
      <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base">Class Proportions & Maintenance Action Mapping</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/60 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Count</th>
                <th className="px-4 py-3">Share</th>
                <th className="px-4 py-3">Engineering Classification</th>
                <th className="px-4 py-3">Recommended Municipal Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              <tr>
                <td className="px-4 py-3.5 font-bold text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Potholes</span>
                </td>
                <td className="px-4 py-3.5 font-mono text-slate-200">{data?.total_potholes || 0}</td>
                <td className="px-4 py-3.5 font-mono text-slate-300">{potholePct}%</td>
                <td className="px-4 py-3.5 text-slate-400">Pavement Cavity / Void</td>
                <td className="px-4 py-3.5 text-red-300 font-medium">Asphalt cold-mix or hot-mix patch within 48h</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold text-amber-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Asphalt Cracks</span>
                </td>
                <td className="px-4 py-3.5 font-mono text-slate-200">{data?.total_cracks || 0}</td>
                <td className="px-4 py-3.5 font-mono text-slate-300">{crackPct}%</td>
                <td className="px-4 py-3.5 text-slate-400">Structural Surface Fracture</td>
                <td className="px-4 py-3.5 text-amber-300 font-medium">Bituminous crack sealant to prevent moisture entry</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold text-emerald-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Manholes</span>
                </td>
                <td className="px-4 py-3.5 font-mono text-slate-200">{data?.total_manholes || 0}</td>
                <td className="px-4 py-3.5 font-mono text-slate-300">{manholePct}%</td>
                <td className="px-4 py-3.5 text-slate-400">Utility Infrastructure Asset</td>
                <td className="px-4 py-3.5 text-emerald-300 font-medium">GIS inventory indexing; inspect rim flushness</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Export Schema Documentation */}
      <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-3">
        <h4 className="font-bold text-white text-sm">Exported CSV Schema Documentation</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          The generated CSV format adheres to municipal open data standards and can be directly imported into QGIS, ArcGIS, or civil maintenance spreadsheets. Columns include:
        </p>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-amber-400 overflow-x-auto">
          Detection_ID, Session_ID, File_Name, File_Type, Timestamp_UTC, Class_ID, Class_Name, Confidence, BBox_X1, BBox_Y1, BBox_X2, BBox_Y2, BBox_Area_Pixels, Area_Percentage, Center_X_Normalized, Center_Y_Normalized, Relative_X_Region, Relative_Y_Region, Visual_Severity, Severity_Score, Severity_Rationale
        </div>
      </div>
    </div>
  );
};

