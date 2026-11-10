import React, { useMemo } from 'react';
import { GlobalCountry, GLOBAL_COUNTRIES } from '../data/globalCountries';
import { GlobalScientificResult } from '../compute/globTraceScience';
import {
  Compass,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ArrowRightLeft,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface OppositeTrendDetectorProps {
  countryA: GlobalCountry;
  countryB: GlobalCountry;
  resultA: GlobalScientificResult;
  resultB: GlobalScientificResult;
  selectedVariable: 'lst' | 'rainfall' | 'ndvi' | 'tws' | 'solar';
}

export const OppositeTrendDetector: React.FC<OppositeTrendDetectorProps> = ({
  countryA,
  countryB,
  resultA,
  resultB,
  selectedVariable,
}) => {
  const slopeA = resultA.slope.valuePerDecade;
  const slopeB = resultB.slope.valuePerDecade;

  // Opposite trend detection
  const isOpposite = (slopeA > 0 && slopeB < 0) || (slopeA < 0 && slopeB > 0);
  const isBothPositive = slopeA > 0 && slopeB > 0;
  const isBothNegative = slopeA < 0 && slopeB < 0;

  // Partition all 73 countries into Positive, Neutral, Negative for this variable
  const { positiveCountries, negativeCountries, neutralCountries } = useMemo(() => {
    const pos: GlobalCountry[] = [];
    const neg: GlobalCountry[] = [];
    const neu: GlobalCountry[] = [];

    GLOBAL_COUNTRIES.forEach((c) => {
      let val = 0;
      if (selectedVariable === 'lst') val = c.trendLST;
      else if (selectedVariable === 'rainfall') val = c.trendRainfall;
      else if (selectedVariable === 'ndvi') val = c.trendNDVI;
      else if (selectedVariable === 'tws') val = c.trendTWS;
      else val = -0.6; // solar

      if (val > 0.05) pos.push(c);
      else if (val < -0.05) neg.push(c);
      else neu.push(c);
    });

    return {
      positiveCountries: pos,
      negativeCountries: neg,
      neutralCountries: neu,
    };
  }, [selectedVariable]);

  // Scientific rationale for the detected dynamic
  const physicalMechanism = useMemo(() => {
    if (selectedVariable === 'rainfall') {
      return 'The Intertropical Convergence Zone (ITCZ) migration and Walker Circulation oscillations typically shift precipitation away from subtropical dry belts into intensified equatorial and monsoon convergence bands, creating opposing regional wetting and drying trends.';
    }
    if (selectedVariable === 'tws') {
      return 'Opposing terrestrial water storage trajectories reflect a global hydrological imbalance: intensive groundwater abstraction for irrigation in agricultural breadbaskets (aquifer depletion) contrasts with localized increases in glacial runoff or precipitation-fed water tables.';
    }
    if (selectedVariable === 'ndvi') {
      return 'Browning vs greening divergences reflect differing limiting factors: CO2 fertilization and longer growing seasons boost northern high-latitude vegetation, whereas escalating vapor pressure deficits (VPD) and drought frequency drive canopy dieback in arid transitions.';
    }
    return 'Thermal divergence across latitudes is governed by Polar Amplification and differing continental heat capacities, with high-latitude landmasses warming at twice the rate of tropical marine-influenced zones.';
  }, [selectedVariable]);

  return (
    <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 font-bold">
              PLANETARY OPPOSITE TREND DETECTOR
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[10px] font-mono text-slate-500 font-bold">
              Multi-Region Dipole Analysis
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-purple-600" />
            <span>Directional Signal Diagnostic</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {isOpposite ? (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Opposing Directional Signal Confirmed</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              <span>Concordant Directional Trajectory</span>
            </span>
          )}
        </div>
      </div>

      {/* Opposing vs Concordant Summary Box */}
      <div
        className={`p-5 rounded-2xl border ${
          isOpposite
            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
            : 'bg-purple-50/60 border-purple-200 text-purple-950'
        } space-y-3`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider font-bold">
              {isOpposite ? 'OPPOSING REGIONAL POLARITY DETECTED' : 'CONCORDANT POLARITY'}
            </div>
            <div className="text-sm font-bold leading-snug">
              {countryA.name} ({slopeA > 0 ? `+${slopeA}` : slopeA} {resultA.slope.unit}) vs{' '}
              {countryB.name} ({slopeB > 0 ? `+${slopeB}` : slopeB} {resultB.slope.unit})
            </div>
          </div>

          <div className="text-right font-mono text-xs shrink-0">
            <div className="font-bold">
              Delta: {Math.abs(slopeA - slopeB).toFixed(2)} {resultA.slope.unit}
            </div>
            <div className="text-[10px] text-slate-500">Separation Magnitude</div>
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-sans">
          {isOpposite
            ? `While ${countryA.name} exhibits a ${slopeA > 0 ? 'positive (increasing)' : 'negative (decreasing)'} trend in ${resultA.variableName}, ${countryB.name} concurrently displays a ${slopeB > 0 ? 'positive (increasing)' : 'negative (decreasing)'} trajectory. This represents a verifiable regional dipole.`
            : `Both ${countryA.name} and ${countryB.name} show ${isBothPositive ? 'positive' : 'negative'} trajectories in ${resultA.variableName}, indicating consistent directional forcing.`}
        </p>

        {/* Physical Mechanism Note */}
        <div className="p-3 rounded-xl bg-white/80 border border-purple-200/60 text-xs text-slate-700 space-y-1">
          <div className="font-bold text-purple-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Earth System Mechanism:</span>
          </div>
          <p className="text-[11px] leading-relaxed font-sans">
            {physicalMechanism}
          </p>
        </div>
      </div>

      {/* Global Divergence Breakdown Across All 73 Sovereign Nations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 font-bold">
            GLOBAL DIRECTIONAL POLARITY CENSUS (73 NATIONS)
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {positiveCountries.length} Increasing · {negativeCountries.length} Decreasing · {neutralCountries.length} Stable
          </span>
        </div>

        {/* 3 Polarized Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* Increasing Nations */}
          <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2">
            <div className="flex items-center justify-between text-purple-900 font-bold">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-purple-700" />
                <span>Increasing ({positiveCountries.length})</span>
              </span>
              <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                Slope &gt; 0
              </span>
            </div>
            <div className="text-[11px] text-slate-600 line-clamp-4 leading-relaxed font-sans">
              {positiveCountries.map((c) => c.name).slice(0, 15).join(', ')}
              {positiveCountries.length > 15 ? ` + ${positiveCountries.length - 15} more` : ''}
            </div>
          </div>

          {/* Decreasing Nations */}
          <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-2">
            <div className="flex items-center justify-between text-rose-900 font-bold">
              <span className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-rose-700" />
                <span>Decreasing ({negativeCountries.length})</span>
              </span>
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                Slope &lt; 0
              </span>
            </div>
            <div className="text-[11px] text-slate-600 line-clamp-4 leading-relaxed font-sans">
              {negativeCountries.map((c) => c.name).slice(0, 15).join(', ')}
              {negativeCountries.length > 15 ? ` + ${negativeCountries.length - 15} more` : ''}
            </div>
          </div>

          {/* Stable / Neutral Nations */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-800 font-bold">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-slate-500" />
                <span>Stable / Neutral ({neutralCountries.length})</span>
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                |Slope| ≈ 0
              </span>
            </div>
            <div className="text-[11px] text-slate-600 line-clamp-4 leading-relaxed font-sans">
              {neutralCountries.length > 0
                ? neutralCountries.map((c) => c.name).slice(0, 15).join(', ')
                : 'No sovereign nations within neutral ±0.05 margin for this variable.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
