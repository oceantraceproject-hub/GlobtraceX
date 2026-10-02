import React, { useState, useMemo, useRef } from 'react';
import { MonthlyObservation, TrendAnalysisResult } from '../types/nasa';
import { Download, Camera } from 'lucide-react';

interface TimeSeriesChartProps {
  observations: MonthlyObservation[];
  trendResult: TrendAnalysisResult;
  useAnomalies: boolean;
  onToggleAnomalyMode: (anomalies: boolean) => void;
  height?: number;
  highlightYear?: number;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  observations,
  trendResult,
  useAnomalies,
  onToggleAnomalyMode,
  height = 320,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const n = observations.length;

  const { minVal, maxVal, dataPoints, trendStartVal, trendEndVal } = useMemo(() => {
    if (n === 0) return { minVal: 0, maxVal: 1, dataPoints: [], trendStartVal: 0, trendEndVal: 0 };

    const vals = observations.map((o) => (useAnomalies ? o.anomaly : o.rawValue));
    let min = Math.min(...vals);
    let max = Math.max(...vals);

    // Padding
    const range = max - min || 1;
    min -= range * 0.12;
    max += range * 0.12;

    if (useAnomalies) {
      min = Math.min(min, -0.2);
      max = Math.max(max, 0.2);
    }

    const points = observations.map((obs, i) => ({
      obs,
      val: useAnomalies ? obs.anomaly : obs.rawValue,
      xRatio: i / (n - 1 || 1),
      yRatio: ((useAnomalies ? obs.anomaly : obs.rawValue) - min) / (max - min),
    }));

    // Trend line endpoints
    const startXFraction = 0;
    const endXFraction = (n - 1) / 12; // in years
    const startVal = trendResult.olsIntercept + trendResult.olsSlope * startXFraction;
    const endVal = trendResult.olsIntercept + trendResult.olsSlope * endXFraction;

    return {
      minVal: min,
      maxVal: max,
      dataPoints: points,
      trendStartVal: startVal,
      trendEndVal: endVal,
    };
  }, [observations, n, useAnomalies, trendResult]);

  // Chart layout dimensions
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartWidth = 720;
  const chartHeight = height;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const getYCoord = (val: number) => {
    const ratio = (val - minVal) / (maxVal - minVal || 1);
    return paddingTop + innerHeight - ratio * innerHeight;
  };

  const getXCoord = (index: number) => {
    return paddingLeft + (index / (n - 1 || 1)) * innerWidth;
  };

  // Generate SVG path for observations line
  const linePath = useMemo(() => {
    if (dataPoints.length === 0) return '';
    return dataPoints
      .map((p, idx) => {
        const x = getXCoord(idx);
        const y = getYCoord(p.val);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [dataPoints, n]);

  // Zero-line Y coordinate for anomalies
  const zeroY = getYCoord(0);

  // Years for X-axis labels
  const yearTicks = useMemo(() => {
    const ticks: { index: number; year: number; x: number }[] = [];
    let lastYear = -1;
    observations.forEach((obs, idx) => {
      if (obs.year !== lastYear && (obs.year % 3 === 0 || idx === 0 || idx === n - 1)) {
        ticks.push({
          index: idx,
          year: obs.year,
          x: getXCoord(idx),
        });
        lastYear = obs.year;
      }
    });
    return ticks;
  }, [observations, n]);

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const count = 5;
    const ticks: number[] = [];
    const step = (maxVal - minVal) / (count - 1);
    for (let i = 0; i < count; i++) {
      ticks.push(minVal + i * step);
    }
    return ticks;
  }, [minVal, maxVal]);

  const activeObs = hoveredIndex !== null ? observations[hoveredIndex] : null;

  // Export current SVG chart as downloadable SVG file
  const handleDownloadChartSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `OceanTrace_${trendResult.region.id}_${trendResult.variable}_${useAnomalies ? 'anomalies' : 'raw'}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col">
      {/* Header controls & toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {trendResult.dataset.productTitle}
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
              {trendResult.timeRange.start} → {trendResult.timeRange.end}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {useAnomalies
              ? `Deseasonalized monthly anomalies relative to ${trendResult.baselinePeriod}`
              : 'Direct monthly mean observed values'}
          </p>
        </div>

        {/* Anomaly vs Raw Toggle and Export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => onToggleAnomalyMode(true)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                useAnomalies
                  ? 'bg-white text-cyan-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Deseasonalized Anomaly
            </button>
            <button
              onClick={() => onToggleAnomalyMode(false)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                !useAnomalies
                  ? 'bg-white text-cyan-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw Observations
            </button>
          </div>

          <button
            onClick={handleDownloadChartSvg}
            title="Export Vector Chart (SVG)"
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-cyan-800 transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Time Series Chart */}
      <div className="w-full relative mt-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none font-sans"
        >
          {/* Grid lines */}
          {yTicks.map((tickVal, i) => {
            const y = getYCoord(tickVal);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                >
                  {tickVal.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Zero reference line for anomalies */}
          {useAnomalies && zeroY >= paddingTop && zeroY <= paddingTop + innerHeight && (
            <line
              x1={paddingLeft}
              y1={zeroY}
              x2={chartWidth - paddingRight}
              y2={zeroY}
              stroke="#64748b"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
          )}

          {/* X-axis year ticks */}
          {yearTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={tick.x}
                y1={paddingTop + innerHeight}
                x2={tick.x}
                y2={paddingTop + innerHeight + 5}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <text
                x={tick.x}
                y={paddingTop + innerHeight + 18}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
                fontFamily="JetBrains Mono"
              >
                {tick.year}
              </text>
            </g>
          ))}

          {/* Observations Path */}
          <path
            d={linePath}
            fill="none"
            stroke="#0284c7"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Fitted OLS Linear Trend Line (if trend ready and non-zero slope) */}
          {trendResult.dataset.status !== 'SHORT-RECORD' && (
            <line
              x1={getXCoord(0)}
              y1={getYCoord(trendStartVal)}
              x2={getXCoord(n - 1)}
              y2={getYCoord(trendEndVal)}
              stroke="#e11d48"
              strokeWidth="2.2"
              strokeDasharray="6,4"
            />
          )}

          {/* Hover interaction overlay */}
          {dataPoints.map((p, idx) => {
            const x = getXCoord(idx);
            const y = getYCoord(p.val);
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r={hoveredIndex === idx ? 5 : 2}
                fill={hoveredIndex === idx ? '#e11d48' : '#0284c7'}
                stroke="#ffffff"
                strokeWidth={hoveredIndex === idx ? 2 : 0.5}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIndex(idx)}
              />
            );
          })}

          {/* Hover Vertical Guide Line */}
          {hoveredIndex !== null && (
            <line
              x1={getXCoord(hoveredIndex)}
              y1={paddingTop}
              x2={getXCoord(hoveredIndex)}
              y2={paddingTop + innerHeight}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          )}
        </svg>

        {/* Hover Inspector Card */}
        {activeObs && hoveredIndex !== null && (
          <div
            className="absolute z-20 bg-slate-900/95 text-white backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700 shadow-xl text-xs font-mono pointer-events-none transform -translate-x-1/2"
            style={{
              left: `${(getXCoord(hoveredIndex) / chartWidth) * 100}%`,
              top: '15px',
            }}
          >
            <div className="font-bold text-cyan-400 mb-0.5">{activeObs.date}</div>
            <div>
              Raw:{' '}
              <span className="font-semibold text-white">
                {activeObs.rawValue} {trendResult.units}
              </span>
            </div>
            <div>
              Anomaly:{' '}
              <span
                className={`font-semibold ${
                  activeObs.anomaly > 0 ? 'text-amber-400' : 'text-blue-400'
                }`}
              >
                {activeObs.anomaly > 0 ? `+${activeObs.anomaly}` : activeObs.anomaly}{' '}
                {trendResult.units}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Baseline: {activeObs.climatologyBaseline} {trendResult.units}
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend & Summary Footnote */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sky-600 rounded"></span>
            <span className="text-slate-600">
              {useAnomalies ? 'Monthly Anomaly Series' : 'Monthly Observed Value'}
            </span>
          </div>
          {trendResult.dataset.status !== 'SHORT-RECORD' && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-600 border-b border-dashed border-rose-600"></span>
              <span className="text-slate-600 font-medium">
                OLS Trend Line ({trendResult.olsSlope > 0 ? '+' : ''}
                {(trendResult.olsSlope * 10).toFixed(3)} {trendResult.units}/decade)
              </span>
            </div>
          )}
          {useAnomalies && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-400"></span>
              <span className="text-slate-500">Climatological Mean (0.0)</span>
            </div>
          )}
        </div>

        <div className="font-mono text-[11px] text-slate-500">
          N = {n} verified monthly observations
        </div>
      </div>
    </div>
  );
};
