import React from 'react';
import { SignificanceMagnitudeQuadrant } from '../compute/types';
import { Grid, HelpCircle } from 'lucide-react';

interface SignificanceMagnitudeMatrixProps {
  currentQuadrant: SignificanceMagnitudeQuadrant;
  slopePerDecade: number;
  pValue: number;
  units: string;
}

export const SignificanceMagnitudeMatrix: React.FC<SignificanceMagnitudeMatrixProps> = ({
  currentQuadrant,
  slopePerDecade,
  pValue,
  units,
}) => {
  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            INNOVATION FEATURE
          </span>
          <h3 className="text-sm font-bold text-white mt-1">
            Significance vs. Magnitude Matrix
          </h3>
          <p className="text-[11px] text-slate-400">
            Decoupling statistical consistency ($p$-value) from physical effect size ($|\beta|$)
          </p>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">2D Evidence Plane</span>
      </div>

      {/* 2x2 Quadrant Grid */}
      <div className="grid grid-cols-2 gap-3 relative">
        {/* Quadrant 1: Large + Strong */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            currentQuadrant === 'LARGE_STRONG'
              ? 'bg-cyan-950/70 border-cyan-400 shadow-md ring-1 ring-cyan-400'
              : 'bg-slate-950/40 border-slate-800/80 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-white text-xs">Large Rate + Strong Evidence</span>
            {currentQuadrant === 'LARGE_STRONG' && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            High decadal slope with statistically significant monotonic consistency ($p &lt; 0.05$).
          </p>
        </div>

        {/* Quadrant 2: Large + Uncertain */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            currentQuadrant === 'LARGE_UNCERTAIN'
              ? 'bg-amber-950/70 border-amber-400 shadow-md ring-1 ring-amber-400'
              : 'bg-slate-950/40 border-slate-800/80 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-white text-xs">Large Rate + Uncertain</span>
            {currentQuadrant === 'LARGE_UNCERTAIN' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Substantial apparent slope but high interannual noise or insufficient observations ($p \ge 0.05$).
          </p>
        </div>

        {/* Quadrant 3: Small + Strong */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            currentQuadrant === 'SMALL_STRONG'
              ? 'bg-emerald-950/70 border-emerald-400 shadow-md ring-1 ring-emerald-400'
              : 'bg-slate-950/40 border-slate-800/80 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-white text-xs">Small Rate + Strong Evidence</span>
            {currentQuadrant === 'SMALL_STRONG' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Subtle or low absolute change, but highly persistent and statistically verified ($p &lt; 0.05$).
          </p>
        </div>

        {/* Quadrant 4: Small + Uncertain */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            currentQuadrant === 'SMALL_UNCERTAIN'
              ? 'bg-slate-900 border-slate-400 shadow-md ring-1 ring-slate-400'
              : 'bg-slate-950/40 border-slate-800/80 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-white text-xs">Small Rate + Uncertain</span>
            {currentQuadrant === 'SMALL_UNCERTAIN' && (
              <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
            )}
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Negligible drift; indistinguishable from random background fluctuations.
          </p>
        </div>
      </div>

      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between font-mono text-slate-300">
        <span>Current Rate: {slopePerDecade > 0 ? '+' : ''}{slopePerDecade} {units}/decade</span>
        <span>Mann-Kendall p = {pValue < 0.001 ? '<0.001' : pValue.toFixed(3)}</span>
      </div>
    </div>
  );
};
