import React from 'react';

interface SeverityBadgeProps {
  severity: 'low' | 'moderate' | 'high' | 'infrastructure' | 'none' | string;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '' }) => {
  const norm = severity.toLowerCase();

  switch (norm) {
    case 'high':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-red-950/60 text-red-300 border border-red-500/30 ${className}`}>
          High Severity
        </span>
      );
    case 'moderate':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-amber-950/60 text-amber-300 border border-amber-500/30 ${className}`}>
          Moderate
        </span>
      );
    case 'low':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-950/60 text-blue-300 border border-blue-500/30 ${className}`}>
          Low Severity
        </span>
      );
    case 'infrastructure':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 ${className}`}>
          Infrastructure
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700 ${className}`}>
          Clear / None
        </span>
      );
  }
};

