import React from 'react';
import { TrendAnalysisResult } from '../compute/types';
import { HelpCircle, CheckCircle2, TrendingUp, AlertTriangle, Layers, ShieldCheck } from 'lucide-react';

interface WhyThisResultPanelProps {
  result: TrendAnalysisResult;
  onOpenEvidenceChain?: () => void;
}

export const WhyThisResultPanel: React.FC<WhyThisResultPanelProps> = ({
  result,
  onOpenEvidenceChain,
}) => {
  const { structuredWhyThisResult, robustness, quadrantLabel } = result;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-sm">
            WHY THIS RESULT? <span className="font-normal text-slate-400 text-xs">Structured Explainability</span>
          </h3>
        </div>
        {onOpenEvidenceChain && (
          <button
            onClick={onOpenEvidenceChain}
            className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Trace Evidence Chain →</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            1. Observed Direction & Slope
          </span>
          <p className="text-slate-200 font-medium leading-relaxed">
            {structuredWhyThisResult.direction}
          </p>
          <div className="font-mono text-cyan-300 text-[11px] pt-1">
            {structuredWhyThisResult.rateStatement}
          </div>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            2. Statistical Assessment
          </span>
          <p className="text-slate-200 font-medium leading-relaxed">
            {structuredWhyThisResult.statisticalAssessment}
          </p>
          <div className="text-[11px] text-slate-400 pt-0.5">
            Quadrant: <span className="text-slate-200 font-semibold">{quadrantLabel}</span>
          </div>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            3. Uncertainty & Bounds
          </span>
          <p className="text-slate-300 leading-relaxed font-mono">
            {structuredWhyThisResult.uncertaintyStatement}
          </p>
          <div className="text-[11px] text-slate-400">
            Stability: <strong className="text-cyan-300">{robustness.stabilityLabel}</strong>
          </div>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            4. Data Coverage & Limits
          </span>
          <p className="text-slate-300 leading-relaxed">
            {structuredWhyThisResult.dataCoverageStatement}
          </p>
          <p className="text-[11px] text-amber-300/80 leading-relaxed pt-0.5">
            {structuredWhyThisResult.limitationStatement}
          </p>
        </div>
      </div>
    </div>
  );
};
