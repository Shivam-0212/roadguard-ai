import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Filter,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Activity,
  Layers,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { InspectionSessionSummary, InspectionSessionDetail } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { ClassBadge } from '../components/ClassBadge';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const DetectionHistory: React.FC = () => {
  const [sessions, setSessions] = useState<InspectionSessionSummary[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [defectFilter, setDefectFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<InspectionSessionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getSessions(page, 10, severityFilter, defectFilter);
      setSessions(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, severityFilter, defectFilter]);

  const handleOpenDetail = async (id: string) => {
    setSelectedSessionId(id);
    setDetailLoading(true);
    try {
      const detail = await api.getSessionDetail(id);
      setSessionDetail(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this inspection session permanently?')) return;
    try {
      await api.deleteSession(id);
      fetchHistory();
      if (selectedSessionId === id) {
        setSelectedSessionId(null);
        setSessionDetail(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Inspection Audit History</h1>
          <p className="text-sm text-slate-400">
            Persistent records of all processed road inspections ({total} total records)
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111726] border border-slate-800 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="high">High Severity</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low Severity</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#111726] border border-slate-800 rounded-xl px-3 py-1.5">
            <select
              value={defectFilter}
              onChange={(e) => {
                setDefectFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">All Defect Classes</option>
              <option value="pothole">Has Potholes</option>
              <option value="crack">Has Cracks</option>
              <option value="manhole">Has Manholes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner message="Fetching inspection records..." />
      ) : sessions.length === 0 ? (
        <EmptyState
          title="No Matching Audit Records"
          description="No road inspection sessions match the selected filter criteria. Upload road images or videos to populate inspection logs."
          icon={HistoryIcon}
          actionText="Run Image Inspection"
          onAction={() => (window.location.href = '/detect-image')}
        />
      ) : (
        <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/60 border-b border-slate-800 font-mono">
                <tr>
                  <th className="px-4 py-3">File / ID</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Recorded At</th>
                  <th className="px-4 py-3">Detections</th>
                  <th className="px-4 py-3">Potholes</th>
                  <th className="px-4 py-3">Cracks</th>
                  <th className="px-4 py-3">Manholes</th>
                  <th className="px-4 py-3">Highest Severity</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sessions.map((sess) => (
                  <tr
                    key={sess.id}
                    onClick={() => handleOpenDetail(sess.id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-200">{sess.filename}</div>
                      <div className="text-[11px] font-mono text-slate-500">{sess.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-4 py-3.5 uppercase text-xs font-mono text-slate-400">{sess.file_type}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">
                      {sess.created_at ? new Date(sess.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-100">{sess.detection_count}</td>
                    <td className="px-4 py-3.5 text-red-400 font-semibold">{sess.pothole_count}</td>
                    <td className="px-4 py-3.5 text-amber-400 font-semibold">{sess.crack_count}</td>
                    <td className="px-4 py-3.5 text-emerald-400 font-semibold">{sess.manhole_count}</td>
                    <td className="px-4 py-3.5">
                      <SeverityBadge severity={sess.highest_severity} />
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(sess.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSession(sess.id, e)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
            <span>
              Page {page} of {totalPages} ({total} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSessionId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Session Inspection Specification</h3>
                <p className="text-xs font-mono text-slate-400">{selectedSessionId}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedSessionId(null);
                  setSessionDetail(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading || !sessionDetail ? (
                <LoadingSpinner message="Loading inspection details..." />
              ) : (
                <>
                  {/* Image View */}
                  {sessionDetail.annotated_file_url && (
                    <div className="rounded-xl overflow-hidden bg-black border border-slate-800 flex justify-center max-h-[360px]">
                      {sessionDetail.file_type === 'image' ? (
                        <img
                          src={api.getMediaUrl(sessionDetail.annotated_file_url)}
                          alt="Annotated Inspection"
                          className="max-h-[360px] w-auto object-contain"
                        />
                      ) : (
                        <video
                          src={api.getMediaUrl(sessionDetail.annotated_file_url)}
                          controls
                          className="max-h-[360px] w-auto"
                        />
                      )}
                    </div>
                  )}

                  {/* Summary row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Total Detections</span>
                      <p className="text-lg font-bold text-white mt-1">{sessionDetail.detection_count}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-red-500/20">
                      <span className="text-red-400">Potholes</span>
                      <p className="text-lg font-bold text-white mt-1">{sessionDetail.pothole_count}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/20">
                      <span className="text-amber-400">Cracks</span>
                      <p className="text-lg font-bold text-white mt-1">{sessionDetail.crack_count}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Severity</span>
                      <div className="mt-1">
                        <SeverityBadge severity={sessionDetail.highest_severity} />
                      </div>
                    </div>
                  </div>

                  {/* Detections list */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-white">Defect Coordinates & Rationale</h4>
                    {sessionDetail.detections.length > 0 ? (
                      <div className="space-y-2">
                        {sessionDetail.detections.map((d) => (
                          <div
                            key={d.id}
                            className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <ClassBadge classNameString={d.class_name} />
                              <span className="font-mono text-slate-300">
                                Conf: {(d.confidence * 100).toFixed(1)}%
                              </span>
                              <span className="font-mono text-slate-400">
                                Box: [{d.bbox.map((v) => v.toFixed(0)).join(', ')}]
                              </span>
                              <span className="font-mono text-amber-400">
                                Area: {d.area_percentage.toFixed(2)}%
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <SeverityBadge severity={d.severity} />
                              <span className="text-slate-400 italic max-w-xs truncate" title={d.severity_rationale}>
                                {d.severity_rationale}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No defect bounding boxes recorded.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

