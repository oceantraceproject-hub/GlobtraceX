import React from 'react';
import { Award, CheckCircle2, ShieldCheck, ArrowRight, Compass, TrendingUp, Layers } from 'lucide-react';

export const ChallengePage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="w-full bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>NASA SPACE APPS CHALLENGE 2026</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Challenge Alignment & Architecture
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            How Ocean Trace translates NASA's Earth-observation challenge guidelines into a rigorous, verifiable scientific platform.
          </p>
        </div>

        {/* Independent Submission Disclaimer */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-slate-900">Independent Challenge Submission</h3>
            <p className="text-slate-600 leading-relaxed">
              Ocean Trace is an independent project submitted to the NASA Space Apps Challenge 2026. Ocean Trace is not an official NASA product, agency department, or formal NASA endorsement. All NASA data, mission names, and satellite logos are utilized strictly within NASA Open Data policies and scientific citation standards.
            </p>
          </div>
        </div>

        {/* The 4 Questions Challenge Mapping */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded border border-cyan-200">
              Core Challenge Criteria
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-2">
              Mapping the Four Scientific Questions
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">1. What is changing?</span>
                <span className="font-mono text-cyan-800 bg-cyan-100/70 px-2 py-0.5 rounded font-semibold">
                  Variables & Sensors
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Rather than treating all environmental data identically, Ocean Trace separates physical variables (Aqua MODIS Sea Surface Temperature, SWOT Sea Surface Height Anomaly) from remotely sensed optical pigment proxies (Aqua MODIS and PACE Chlorophyll-a).
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">2. Where is it changing?</span>
                <span className="font-mono text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded font-semibold">
                  Geospatial Isolation
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Users can investigate at planetary open-ocean scales (60°S to 60°N) or drill down to vulnerable regional marginal basins like the featured Bay of Bengal study area (10°N–22°N, 80°E–95°E) and Mediterranean Sea.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">3. How much is it changing?</span>
                <span className="font-mono text-indigo-800 bg-indigo-100/70 px-2 py-0.5 rounded font-semibold">
                  Deseasonalized Magnitude
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                We remove the 12-month cyclical climatology baseline (2002–2020 reference period) to extract clean anomalies, computing both parametric Ordinary Least Squares slope and outlier-resistant Sen’s slope.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">4. Is the change statistically significant?</span>
                <span className="font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-semibold">
                  Mann-Kendall Test
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                The platform implements the non-parametric Mann-Kendall rank trend test. We distinguish genuine multi-decadal thermodynamic trends from short-term decadal variability (e.g. ENSO / IOD cycles) with formal p-values at α = 0.05.
              </p>
            </div>
          </div>
        </div>

        {/* Video Mode Readiness */}
        <div className="bg-gradient-to-r from-slate-900 to-cyan-950 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-cyan-300 font-mono text-xs uppercase tracking-wider font-bold">
              240-Second Competition Video Tool
            </span>
            <h3 className="text-lg font-bold text-white">
              Presentation Mode for Screen Recording
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Every scene in the 240-second competition script has a dedicated, live interactive visual state in Ocean Trace, allowing seamless 1080p recording without mockups.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/presentation')}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
          >
            <span>Launch Presentation Mode</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
