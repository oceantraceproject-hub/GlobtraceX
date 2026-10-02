import React, { useState } from 'react';
import { RobustnessAssessment } from '../compute/types';
import { Layers, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface StabilityExplorerProps {
  robustness: RobustnessAssessment;
  units: string;
}

export const StabilityExplorer: React.FC<StabilityExplorerProps> = ({ robustness, units }) => {
  const [selectedWindow, setSelectedWindow] = useState<'full' | 'early' | 'recent'>('full');

  const activeSlope =
    selectedWindow === 'full'
      ? robustness.fullPeriodSlope
      : selectedWindow === 'early'
      ? robustness.earlyPeriodSlope
      : robustness.recentPeriodSlope;

  const activeP =
    selectedWindow === 'full'
      ? robustness.fullPeriodP
      : selectedWindow === 'early'
      ? robustness.earlyPeriodP
      : robustness.recentPeriodP;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            INNOVATION FEATURE
          </span>
          <h3 className="text-sm font-bold text-white mt-1">
            Trend Stability Explorer
          </h3>
          <p className="text-[11px] text-slate-400">
            Tests whether the observed direction persists across different evaluation windows
          </p>
        </div>

        {/* Window Selector Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedWindow('full')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              selectedWindow === 'full' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Full Record
          </button>
          <button
            onClick={() => setSelectedWindow('early')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              selectedWindow === 'early' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Early Period
          </button>
          <button
            onClick={() => setSelectedWindow('recent')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              selectedWindow === 'recent' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Recent Period
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Metric 1 */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Selected Window Rate</span>
          <div className="text-xl font-bold font-mono text-white">
            {activeSlope > 0 ? '+' : ''}
            {activeSlope} <span className="text-xs font-normal text-slate-400">{units}/dec</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Theil-Sen slope</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Statistical Significance</span>
          <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-1">
            <span className={`w-2 h-2 rounded-full ${activeP <= 0.05 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{activeP <= 0.05 ? 'Significant (p < 0.05)' : 'Uncertain (p ≥ 0.05)'}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">p = {activeP < 0.001 ? '<0.001' : activeP.toFixed(3)}</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Overall Robustness</span>
          <div className="text-sm font-bold text-cyan-300 mt-1">
            {robustness.stabilityLabel}
          </div>
          <span className="text-[10px] text-slate-400">Autocorrelation: {robustness.autocorrelationRisk}</span>
        </div>
      </div>

      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
        <strong>Sensitivity Assessment:</strong> {robustness.windowSensitivityExplanation}
      </div>
    </div>
  );
};
