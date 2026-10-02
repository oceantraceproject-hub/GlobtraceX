import React, { useState } from 'react';
import { VariableType, VariableDomain } from '../compute/types';
import { Sparkles, ArrowRight, Compass, Search, CheckCircle2 } from 'lucide-react';

interface AskOceanTraceProps {
  onExecuteQuery: (regionId: string, variable: VariableType, domain: VariableDomain) => void;
}

export const AskOceanTrace: React.FC<AskOceanTraceProps> = ({ onExecuteQuery }) => {
  const [query, setQuery] = useState('');
  const [interpreted, setInterpreted] = useState<{
    variable: VariableType;
    variableLabel: string;
    regionId: string;
    regionLabel: string;
    domain: VariableDomain;
    period: string;
    method: string;
  } | null>(null);

  const sampleQueries = [
    'What changed in the Bay of Bengal?',
    'Has land surface temperature increased in Dhaka?',
    'How is monsoon rainfall changing in Sylhet?',
    'Is the Mediterranean warming statistically significant?',
    'What are the vegetation trends in the Sundarbans (Khulna)?',
  ];

  const handleInterpret = (q: string) => {
    setQuery(q);
    const low = q.toLowerCase();

    let regionId = 'bay-of-bengal';
    let regionLabel = 'Bay of Bengal';
    let domain: VariableDomain = 'ocean';
    let variable: VariableType = 'sst';
    let variableLabel = 'Sea Surface Temperature';

    if (low.includes('dhaka')) {
      regionId = 'dhaka';
      regionLabel = 'Dhaka';
      domain = 'bangladesh';
      variable = 'lst';
      variableLabel = 'Land Surface Temperature';
    } else if (low.includes('sylhet') || low.includes('rain')) {
      regionId = 'sylhet';
      regionLabel = 'Sylhet';
      domain = 'bangladesh';
      variable = 'rainfall';
      variableLabel = 'Monthly Precipitation';
    } else if (low.includes('khulna') || low.includes('sundarban') || low.includes('vegetation') || low.includes('ndvi')) {
      regionId = 'khulna';
      regionLabel = 'Khulna (Sundarbans)';
      domain = 'bangladesh';
      variable = 'vegetation';
      variableLabel = 'Vegetation Index (NDVI)';
    } else if (low.includes('mediterranean')) {
      regionId = 'western-mediterranean';
      regionLabel = 'Western Mediterranean Sea';
      domain = 'ocean';
      variable = 'sst';
      variableLabel = 'Sea Surface Temperature';
    } else if (low.includes('chlorophyll') || low.includes('algae') || low.includes('color')) {
      regionId = 'bay-of-bengal';
      regionLabel = 'Bay of Bengal';
      domain = 'ocean';
      variable = 'chlorophyll';
      variableLabel = 'Chlorophyll-a Concentration';
    }

    setInterpreted({
      variable,
      variableLabel,
      regionId,
      regionLabel,
      domain,
      period: '2002–2026 (288 monthly observations)',
      method: 'Theil-Sen slope + Mann-Kendall rank test',
    });
  };

  const handleRun = () => {
    if (interpreted) {
      onExecuteQuery(interpreted.regionId, interpreted.variable, interpreted.domain);
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl text-xs">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-cyan-400" />
        <div>
          <h3 className="font-bold text-white text-sm">
            Ask Ocean Trace <span className="font-normal text-slate-400 text-xs">— Scientific Query Interface</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Translates natural queries into deterministic NASA satellite observation requests.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInterpret(e.target.value)}
          placeholder="Ask a trend question (e.g. 'What changed in the Bay of Bengal?')..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
        />
        <button
          onClick={() => handleInterpret(query || sampleQueries[0])}
          className="px-4 py-2.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors"
        >
          <span>Interpret</span>
        </button>
      </div>

      {/* Sample Query Suggestions */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] text-slate-500 font-mono">Suggested:</span>
        {sampleQueries.slice(0, 3).map((sq) => (
          <button
            key={sq}
            onClick={() => handleInterpret(sq)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Interpreted Structured Request Card */}
      {interpreted && (
        <div className="bg-slate-950 p-4 rounded-xl border border-cyan-800/60 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
              STRUCTURED ANALYSIS REQUEST
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Deterministic Engine</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">VARIABLE</span>
              <span className="text-white font-bold">{interpreted.variableLabel}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">REGION</span>
              <span className="text-cyan-300 font-bold">{interpreted.regionLabel}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">EVALUATION PERIOD</span>
              <span className="text-slate-300">{interpreted.period}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">STATISTICAL METHOD</span>
              <span className="text-slate-300">{interpreted.method}</span>
            </div>
          </div>

          <button
            onClick={handleRun}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>Execute Deterministic Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
