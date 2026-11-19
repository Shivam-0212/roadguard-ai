import React from 'react';

interface ClassBadgeProps {
  classNameString: string;
  className?: string;
}

export const ClassBadge: React.FC<ClassBadgeProps> = ({ classNameString, className = '' }) => {
  const norm = classNameString.toLowerCase();

  if (norm === 'pothole' || norm === '0') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
        Pothole
      </span>
    );
  }

  if (norm === 'crack' || norm === '1') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Crack
      </span>
    );
  }

  if (norm === 'manhole' || norm === '2') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Manhole (Asset)
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 ${className}`}>
      {classNameString}
    </span>
  );
};

