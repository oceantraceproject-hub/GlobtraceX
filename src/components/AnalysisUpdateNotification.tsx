import React, { useEffect, useState } from 'react';
import { CheckCircle2, X, RefreshCw } from 'lucide-react';

interface AnalysisUpdateNotificationProps {
  regionName: string;
  variableName: string;
  updateKey: string | number;
}

export const AnalysisUpdateNotification: React.FC<AnalysisUpdateNotificationProps> = ({
  regionName,
  variableName,
  updateKey,
}) => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3200);

    return () => clearTimeout(timer);
  }, [updateKey]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out transform translate-y-0 opacity-100"
    >
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800 text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <p className="truncate max-w-[280px] sm:max-w-md">
          <span className="text-purple-300 font-bold">Analysis updated:</span>{' '}
          <span className="text-slate-100">{regionName}</span> •{' '}
          <span className="text-slate-300">{variableName}</span>
        </p>
        <button
          onClick={() => setVisible(false)}
          className="ml-1 p-0.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
