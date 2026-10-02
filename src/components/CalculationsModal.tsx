import React, { useState } from 'react';
import { TrendAnalysisResult } from '../types/nasa';
import { X, Calculator, Eye, BookOpen, Layers } from 'lucide-react';

interface CalculationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trendResult: TrendAnalysisResult;
}

export const CalculationsModal: React.FC<CalculationsModalProps> = ({
  isOpen,
  onClose,
  trendResult,
}) => {
  const [activeTab, setActiveTab] = useState<'scientific' | 'simple'>('scientific');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Statistical Methodology & Calculations
              </h2>
              <p className="text-xs text-slate-300">
                Mathematical formulations implemented in the Ocean Trace analytical engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher: Scientific vs Simple */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Explanation Level:</span>
          <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('scientific')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'scientific'
                  ? 'bg-white text-cyan-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Scientific View (Formulas)</span>
            </button>
            <button
              onClick={() => setActiveTab('simple')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'simple'
                  ? 'bg-white text-cyan-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Simple View (Plain Language)</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {activeTab === 'scientific' ? (
            <>
              {/* Method 1: Climatological Deseasonalization */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-5 h-5 rounded-full bg-cyan-700 text-white flex items-center justify-center text-xs">1</span>
                  <span>12-Month Climatological Deseasonalization</span>
                </div>
                <p>
                  To eliminate seasonal temperature swings (e.g. summer heating vs winter cooling) from confounding the multi-decadal signal, monthly anomalies $A(y, m)$ are extracted relative to the 2002–2020 reference baseline:
                </p>
                <div className="bg-slate-900 text-cyan-300 font-mono p-3 rounded-lg text-center text-xs">
                  {'Anomaly A(y, m) = X(y, m) - ClimatologyBaseline(m)'}
                </div>
                <p className="text-slate-500">
                  Where ClimatologyBaseline(m) is the long-term arithmetic mean for calendar month m across the 2002–2020 reference period.
                </p>
              </div>

              {/* Method 2: Ordinary Least Squares Linear Regression */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs">2</span>
                  <span>Ordinary Least Squares (OLS) Linear Trend</span>
                </div>
                <p>
                  Slope β is computed via least squares minimization over the N monthly observations:
                </p>
                <div className="bg-slate-900 text-cyan-300 font-mono p-3 rounded-lg text-center text-xs">
                  {'β = Σ[ (t_i - t̄) × (A_i - Ā) ] / Σ[ (t_i - t̄)² ]'}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                  <div>Estimated Slope: <strong className="text-slate-900 font-mono">{(trendResult.olsSlope * 10).toFixed(4)} {trendResult.units}/dec</strong></div>
                  <div>Standard Error (se): <strong className="text-slate-900 font-mono">{trendResult.olsStdErr}</strong></div>
                  <div>Coefficient of Determination (R²): <strong className="text-slate-900 font-mono">{trendResult.olsR2}</strong></div>
                  <div>p-value: <strong className="text-slate-900 font-mono">{trendResult.olsPValue < 0.001 ? '< 0.001' : trendResult.olsPValue.toFixed(4)}</strong></div>
                </div>
              </div>

              {/* Method 3: Non-Parametric Sen's Slope */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-700 text-white flex items-center justify-center text-xs">3</span>
                  <span>Non-Parametric Sen’s Slope Estimator</span>
                </div>
                <p>
                  Robust against extreme outlier events (such as singular marine heatwave months) by calculating the median of all pairwise slopes:
                </p>
                <div className="bg-slate-900 text-cyan-300 font-mono p-3 rounded-lg text-center text-xs">
                  {'Q = median { (A_j - A_i) / (t_j - t_i) }  for all 1 ≤ i < j ≤ N'}
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-[11px]">
                  Sen’s Slope Estimate: <strong className="text-indigo-800">{(trendResult.sensSlope * 10).toFixed(4)} {trendResult.units} / decade</strong>
                </div>
              </div>

              {/* Method 4: Mann-Kendall Significance Test */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">4</span>
                  <span>Mann-Kendall Rank Trend Test</span>
                </div>
                <p>
                  Tests the null hypothesis H₀ (no monotonic trend) against alternative H₁ (monotonic upward or downward trend) without assuming normal distribution:
                </p>
                <div className="bg-slate-900 text-cyan-300 font-mono p-3 rounded-lg text-center text-xs">
                  {'S = Σ sgn(A_j - A_i),  Z = (S ∓ 1) / √Var(S)'}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                  <div>Mann-Kendall S: <strong className="text-slate-900 font-mono">{trendResult.mannKendallS}</strong></div>
                  <div>Standardized Z-Score: <strong className="text-slate-900 font-mono">{trendResult.mannKendallZ}</strong></div>
                  <div>Two-tailed p-value: <strong className="text-slate-900 font-mono">{trendResult.mannKendallPValue < 0.001 ? '< 0.001' : trendResult.mannKendallPValue.toFixed(4)}</strong></div>
                  <div>Significance Level: <strong className="text-emerald-700 font-mono">{trendResult.isSignificant005 ? 'Significant (α = 0.05)' : 'Not Significant'}</strong></div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Simple View */}
              <div className="space-y-4 text-slate-700 text-sm">
                <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-xl">
                  <h4 className="font-bold text-cyan-900 mb-1">What does "Observed Trend" mean?</h4>
                  <p className="text-xs text-cyan-950 leading-relaxed">
                    Ocean temperatures naturally rise in the summer and fall in the winter. To find out if the ocean is actually warming overall, we first remove the regular seasonal cycle. Then we measure whether the remaining values consistently move upward, downward, or stay flat over the years.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">What does "Statistical Significance" mean?</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Ocean weather is noisy—some years are unusually hot because of natural cycles like El Niño. Statistical tests check whether the rise in temperature is too large and consistent to be explained by random yearly fluctuations alone. If the p-value is less than 0.05, we have 95% confidence that a real ongoing trend is occurring.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">What does Chlorophyll-a represent?</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Chlorophyll-a is the green pigment in microscopic marine algae called phytoplankton. Phytoplankton form the base of the ocean food web and produce roughly half of Earth's oxygen. Satellites estimate chlorophyll by observing subtle changes in ocean color from space.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">Why can't we calculate a trend for SWOT or PACE yet?</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    NASA’s SWOT satellite launched in late 2022, and PACE launched in February 2024. Because they have only been observing for 1 to 3 years, their records are too short to distinguish long-term multi-decadal climate trends from regular seasonal weather. Ocean Trace clearly marks them as SHORT-RECORD datasets.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
