import React, { useState, useMemo } from 'react';
import { ScientificObservation, StructuredScientificResult } from '../compute/globTraceScience';

interface GlobTraceChartProps {
  observations: ScientificObservation[];
  result: StructuredScientificResult;
  useAnomalies: boolean;
  onToggleAnomaly: () => void;
  height?: number;
}

export const GlobTraceChart: React.FC<GlobTraceChartProps> = ({
  observations,
  result,
  useAnomalies,
  onToggleAnomaly,
  height = 320,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const n = observations.length;
  const validObs = useMemo(() => observations.filter((o) => o.isValid), [observations]);

  // Value boundaries
  const { minVal, maxVal, dataPoints, trendStart, trendEnd, ciLowStart, ciLowEnd, ciHighStart, ciHighEnd } =
    useMemo(() => {
      if (validObs.length === 0) {
        return {
          minVal: 0,
          maxVal: 1,
          dataPoints: [],
          trendStart: 0,
          trendEnd: 0,
          ciLowStart: 0,
          ciLowEnd: 0,
          ciHighStart: 0,
          ciHighEnd: 0,
        };
      }

      const vals = validObs.map((o) => (useAnomalies ? o.anomaly : o.rawValue));
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const padding = (max - min) * 0.15 || 1;

      const yMin = min - padding;
      const yMax = max + padding;

      // Coordinate scaling
      const width = 800;
      const h = height - 50;

      const pts = observations.map((o, i) => {
        const x = (i / (n - 1)) * (width - 80) + 50;
        const val = useAnomalies ? o.anomaly : o.rawValue;
        const y = h - ((val - yMin) / (yMax - yMin)) * (h - 40) + 15;
        return { x, y, val, obs: o };
      });

      // Theil-Sen regression line start and end values
      const startT = 0;
      const endT = (validObs[validObs.length - 1].year - validObs[0].year) + 0.5;
      const intercept = vals[0];
      const slopePerYear = result.slope.value;

      const tStartVal = useAnomalies ? -slopePerYear * (endT / 2) : vals[0];
      const tEndVal = useAnomalies ? slopePerYear * (endT / 2) : vals[0] + slopePerYear * endT;

      const yTrendStart = h - ((tStartVal - yMin) / (yMax - yMin)) * (h - 40) + 15;
      const yTrendEnd = h - ((tEndVal - yMin) / (yMax - yMin)) * (h - 40) + 15;

      // 95% CI envelope
      const ciSlopeLow = (result.slope.ci_low / 10);
      const ciSlopeHigh = (result.slope.ci_high / 10);

      const yCiLowStart = h - (((tStartVal - 0.25) - yMin) / (yMax - yMin)) * (h - 40) + 15;
      const yCiLowEnd = h - (((tStartVal + ciSlopeLow * endT) - yMin) / (yMax - yMin)) * (h - 40) + 15;
      const yCiHighStart = h - (((tStartVal + 0.25) - yMin) / (yMax - yMin)) * (h - 40) + 15;
      const yCiHighEnd = h - (((tStartVal + ciSlopeHigh * endT) - yMin) / (yMax - yMin)) * (h - 40) + 15;

      return {
        minVal: yMin,
        maxVal: yMax,
        dataPoints: pts,
        trendStart: yTrendStart,
        trendEnd: yTrendEnd,
        ciLowStart: yCiLowStart,
        ciLowEnd: yCiLowEnd,
        ciHighStart: yCiHighStart,
        ciHighEnd: yCiHighEnd,
      };
    }, [validObs, observations, useAnomalies, result, height, n]);

  const activePoint = hoverIndex !== null ? dataPoints[hoverIndex] : null;

  return (
    <div className="w-full bg-white rounded-2xl p-5 border border-purple-100 shadow-sm space-y-4">
      {/* Chart Control & Legend Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span>Observed ({result.provenance.dataset_id})</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-purple-700 font-bold">
            <span className="w-4 h-0.5 bg-purple-700" />
            <span>Theil-Sen Trend Line</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-purple-400">
            <span className="w-3 h-2 rounded bg-purple-100 border border-purple-200" />
            <span>95% Confidence Interval</span>
          </div>
        </div>

        <button
          onClick={onToggleAnomaly}
          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition-all ${
            useAnomalies
              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
              : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
          }`}
        >
          {useAnomalies ? 'ANOMALIES (CLIMATOLOGY DETRENDED)' : 'RAW VALUES'}
        </button>
      </div>

      {/* SVG Time-Series Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg viewBox="0 0 800 320" className="w-full h-auto overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = 20 + pct * 240;
            const val = maxVal - pct * (maxVal - minVal);
            return (
              <g key={idx}>
                <line x1="50" y1={y} x2="770" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x="42" y={y + 3} fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="end">
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* 95% Confidence Interval Shaded Area */}
          <polygon
            points={`50,${ciLowStart} 770,${ciLowEnd} 770,${ciHighEnd} 50,${ciHighStart}`}
            fill="#ede9fe"
            opacity="0.55"
          />

          {/* Theil-Sen Robust Median Trend Line */}
          <line
            x1="50"
            y1={trendStart}
            x2="770"
            y2={trendEnd}
            stroke="#6d28d9"
            strokeWidth="2.5"
            strokeDasharray="4,2"
          />

          {/* Observed Monthly Line */}
          <path
            d={dataPoints
              .filter((p) => p.obs.isValid)
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
              .join(' ')}
            fill="none"
            stroke="#a78bfa"
            strokeWidth="1.5"
          />

          {/* Observed Data Points */}
          {dataPoints.map((p, i) => {
            if (!p.obs.isValid) {
              // Missing observation mark
              return (
                <line
                  key={i}
                  x1={p.x}
                  y1={260}
                  x2={p.x}
                  y2={270}
                  stroke="#fda4af"
                  strokeWidth="2"
                >
                  <title>Missing Observation</title>
                </line>
              );
            }

            const isHovered = hoverIndex === i;
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={isHovered ? 5.5 : 2}
                fill={isHovered ? '#7c3aed' : '#8b5cf6'}
                stroke="#ffffff"
                strokeWidth={isHovered ? 2 : 0.8}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer transition-all"
              />
            );
          })}

          {/* Year Markers on X-Axis */}
          {[2000, 2005, 2010, 2015, 2020, 2025].map((yr) => {
            const idx = observations.findIndex((o) => o.year === yr && o.month === 1);
            if (idx === -1) return null;
            const x = (idx / (n - 1)) * (800 - 80) + 50;
            return (
              <g key={yr}>
                <line x1={x} y1="270" x2={x} y2="276" stroke="#cbd5e1" strokeWidth="1" />
                <text x={x} y="290" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  {yr}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {activePoint && (
          <div
            className="absolute top-2 right-4 p-3 rounded-xl bg-purple-950 text-white text-xs font-mono shadow-xl border border-purple-800 space-y-1 z-20 pointer-events-none"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-purple-300 font-bold">{activePoint.obs.date}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-800 text-purple-200">
                {result.provenance.mission}
              </span>
            </div>
            <div>
              Value: <strong className="text-white text-sm">{activePoint.val} {result.units}</strong>
            </div>
            <div className="text-[10px] text-purple-300">
              Climatology Baseline: {activePoint.obs.climatologyBaseline.toFixed(2)} {result.units}
            </div>
            <div className="text-[10px] text-purple-300">
              Deseasonalized Anomaly: {activePoint.obs.anomaly > 0 ? '+' : ''}{activePoint.obs.anomaly.toFixed(2)} {result.units}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
