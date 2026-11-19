import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Activity,
  Layers,
  AlertTriangle,
  Camera,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { DashboardSummary } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading road inspection metrics..." />;
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-300">
        <h3 className="font-bold mb-1">Failed to Load Dashboard</h3>
        <p className="text-sm text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchSummary}
          className="px-4 py-2 rounded-lg bg-red-500 text-slate-950 font-semibold text-xs"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const classData = [
    { name: 'Potholes', count: data.total_potholes, fill: '#EF4444' },
    { name: 'Cracks', count: data.total_cracks, fill: '#F59E0B' },
    { name: 'Manholes', count: data.total_manholes, fill: '#10B981' },
  ];

  const severityData = [
    { name: 'High Severity', count: data.severity_distribution.high, fill: '#EF4444' },
    { name: 'Moderate', count: data.severity_distribution.moderate, fill: '#F59E0B' },
    { name: 'Low Severity', count: data.severity_distribution.low, fill: '#3B82F6' },
    { name: 'Infrastructure', count: data.severity_distribution.infrastructure, fill: '#10B981' },
  ].filter((d) => d.count > 0);

  return (
    <div className="space-y-8">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-slate-400">Real-time road surface defect intelligence & statistics</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSummary}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <Link
            to="/detect-image"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>New Inspection</span>
          </Link>
        </div>
      </div>

      {/* Model Readiness Notice */}
      {!data.model_ready && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold">YOLOv8-nano Weights Pending Colab Execution: </span>
            Trained checkpoint <code className="bg-amber-950/60 px-1 py-0.5 rounded text-xs font-mono">artifacts/models/best.pt</code> has not been populated. Run the Google Colab training notebook to enable live deep learning detection.
          </div>
        </div>
      )}

      {/* Top Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Sessions */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total Inspections</span>
          <div className="text-2xl font-black text-white mt-2">{data.total_sessions}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Stored audit sessions</span>
        </div>

        {/* Potholes */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-red-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-400">Potholes</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{data.total_potholes}</div>
          <span className="text-[11px] text-red-400/70 mt-1 block">Cavity damage</span>
        </div>

        {/* Cracks */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Asphalt Cracks</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{data.total_cracks}</div>
          <span className="text-[11px] text-amber-400/70 mt-1 block">Pavement fissures</span>
        </div>

        {/* Manholes */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Manholes</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{data.total_manholes}</div>
          <span className="text-[11px] text-emerald-400/70 mt-1 block">Utility infrastructure</span>
        </div>

        {/* High Severity */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-red-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-400">High Severity</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{data.high_severity_defects}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Urgent municipal actions</span>
        </div>
      </div>

      {/* Visual Charts */}
      {data.total_defects > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class Distribution Chart */}
          <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white">Defect Class Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#161F33', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#F1F5F9' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {classData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Severity Distribution Pie Chart */}
          <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white">Severity Level Proportions</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`sev-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#161F33', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#F1F5F9' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Inspection Records Yet"
          description="Upload a road image or video to run YOLOv8 defect detection. Your real inspection statistics and severity charts will automatically populate here."
          actionText="Run First Image Inspection"
          onAction={() => window.location.href = '/detect-image'}
        />
      )}

      {/* Recent Inspection Activity */}
      {data.recent_sessions.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Recent Inspection Activity</h3>
            <Link to="/history" className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Detections</th>
                  <th className="px-4 py-3">Potholes</th>
                  <th className="px-4 py-3">Cracks</th>
                  <th className="px-4 py-3">Highest Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.recent_sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-200">{sess.filename}</td>
                    <td className="px-4 py-3 uppercase text-xs font-mono text-slate-400">{sess.file_type}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                      {sess.created_at ? new Date(sess.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-200">{sess.detection_count}</td>
                    <td className="px-4 py-3 text-red-400 font-semibold">{sess.potholes}</td>
                    <td className="px-4 py-3 text-amber-400 font-semibold">{sess.cracks}</td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={sess.highest_severity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

