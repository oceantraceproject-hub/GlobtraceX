import React from 'react';
import { TrendAnalysisResult } from '../types/nasa';
import { Compass, Thermometer, TrendingUp, CheckCircle2, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';

interface FourQuestionsProps {
  trendResult: TrendAnalysisResult;
  onNavigateTab?: (route: string) => void;
  showCalculationsModal?: () => void;
}

export const FourQuestions: React.FC<FourQuestionsProps> = ({
  trendResult,
  onNavigateTab,
  showCalculationsModal,
}) => {
  const isShortRecord = trendResult.dataset.status === 'SHORT-RECORD';

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
            Research Framework
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            The Four Scientific Questions
          </h2>
        </div>
        {showCalculationsModal && (
          <button
            onClick={showCalculationsModal}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-cyan-700 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
            <span>How was this calculated?</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Question 1: What is changing? */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-4 flex flex-col justify-between hover:border-cyan-300 transition-colors">
          <div>
            <div className="flex items-center gap-2 text-cyan-700 text-xs font-semibold uppercase tracking-wider">
              <Thermometer className="w-4 h-4" />
              <span>1. What is changing?</span>
            </div>
            <div className="mt-2.5">
              <div className="text-base font-bold text-slate-900 leading-snug">
                {trendResult.variableName}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Sensor: <span className="font-semibold text-slate-800">{trendResult.dataset.instrument}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {trendResult.dataset.mission} ({trendResult.dataset.processingLevel})
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Unit: <strong className="text-slate-700">{trendResult.units}</strong></span>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('/data')}
                className="text-cyan-700 font-medium hover:underline inline-flex items-center gap-0.5"
              >
                Inspect Dataset <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Question 2: Where is it changing? */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-4 flex flex-col justify-between hover:border-cyan-300 transition-colors">
          <div>
            <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>2. Where is it changing?</span>
            </div>
            <div className="mt-2.5">
              <div className="text-base font-bold text-slate-900 leading-snug">
                {trendResult.region.name}
              </div>
              <div className="text-xs text-slate-600 mt-1 font-mono">
                {trendResult.region.coordinates.latMin}°N – {trendResult.region.coordinates.latMax}°N,{' '}
                {trendResult.region.coordinates.lonMin}°E – {trendResult.region.coordinates.lonMax}°E
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Basin: {trendResult.region.oceanBasin} ({trendResult.region.areaKm2})
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">{trendResult.region.category} Region</span>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('/explore')}
                className="text-blue-700 font-medium hover:underline inline-flex items-center gap-0.5"
              >
                View on Map <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Question 3: How much is it changing? */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-4 flex flex-col justify-between hover:border-cyan-300 transition-colors">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>3. How much is it changing?</span>
            </div>
            <div className="mt-2.5">
              {isShortRecord ? (
                <div>
                  <div className="text-sm font-semibold text-amber-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Short-Record Constraint</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Duration &lt; 3 years. Decadal trend magnitude cannot be statistically determined.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-xl font-bold font-mono text-slate-900">
                    {trendResult.olsSlope > 0 ? '+' : ''}
                    {(trendResult.olsSlope * 10).toFixed(3)}{' '}
                    <span className="text-xs font-normal text-slate-600">
                      {trendResult.units} / decade
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Cumulative record change:{' '}
                    <strong className="text-slate-900 font-mono">
                      {trendResult.totalMagnitude > 0 ? '+' : ''}
                      {trendResult.totalMagnitude} {trendResult.units}
                    </strong>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Sen’s Slope: {(trendResult.sensSlope * 10).toFixed(3)} {trendResult.units}/decade
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Record: {trendResult.timeRange.totalMonths} months</span>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('/trends')}
                className="text-indigo-700 font-medium hover:underline inline-flex items-center gap-0.5"
              >
                Trend Lab <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Question 4: Is the change statistically significant? */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-4 flex flex-col justify-between hover:border-cyan-300 transition-colors">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>4. Is it significant?</span>
            </div>
            <div className="mt-2.5">
              {isShortRecord ? (
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Not Applicable</span>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Hypothesis test requires baseline record &gt; 30 seasonal cycles.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        trendResult.isSignificant005 ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}
                    />
                    <span className="text-sm font-bold text-slate-900">
                      {trendResult.isSignificant005 ? 'Statistically Significant' : 'Not Significant'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 font-mono">
                    p-value: {trendResult.mannKendallPValue < 0.001 ? '< 0.001' : trendResult.mannKendallPValue.toFixed(3)}{' '}
                    (α = 0.05)
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Mann-Kendall Z = {trendResult.mannKendallZ}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Method: Mann-Kendall</span>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('/methodology')}
                className="text-emerald-700 font-medium hover:underline inline-flex items-center gap-0.5"
              >
                Methodology <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
