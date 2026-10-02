import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  Award,
  Globe,
  Database,
  BarChart3,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const AboutPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold font-mono">
            <Award className="w-3.5 h-3.5" />
            <span>NASA SPACE APPS CHALLENGE 2026 • CHALLENGE 02</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            About GlobTraceX
          </h1>
          <p className="text-purple-700 font-mono text-xs uppercase tracking-widest font-bold">
            TRACE THE CHANGE. UNDERSTAND THE EVIDENCE.
          </p>
        </div>

        {/* Official Space Apps Disclaimer Card */}
        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-extrabold text-slate-900">Official Student Project Disclaimer</h3>
            <p className="text-slate-600 leading-relaxed">
              GlobTraceX is an independent student project developed by <strong>Team Protichamp</strong> for the NASA Space Apps Challenge 2026, competing in Challenge 02: “Be An Earth System Trend Detective!” All NASA datasets, satellite imagery, and mission references are utilized in accordance with official NASA open data distribution policies. GlobTraceX is not an official NASA website, agency product, or commercial endorsement.
            </p>
          </div>
        </div>

        {/* Narrative Editorial Sections */}
        <div className="bg-white rounded-2xl p-8 border border-purple-100 shadow-sm space-y-8 text-xs text-slate-700 leading-relaxed">
          <div className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 font-mono flex items-center gap-2">
              <span className="text-purple-700">1.</span>
              <span>What is GlobTraceX?</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              GlobTraceX is a scientific Earth-system trend investigation platform designed to bridge the gap between complex multi-gigabyte satellite telemetry and actionable environmental intelligence. Rather than displaying cosmetic dashboards, GlobTraceX acts as a transparent research instrument where every observed slope, p-value, and confidence interval is deterministically calculated from authentic NASA Earth-observation records.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 font-mono flex items-center gap-2">
              <span className="text-purple-700">2.</span>
              <span>Why Does It Exist?</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              Evaluating climate trends across Earth systems often falls into two extremes: either inaccessible raw satellite HDF/NetCDF binaries requiring specialized coding expertise, or oversimplified media graphs lacking statistical significance testing. GlobTraceX answers the NASA challenge by providing an evidence-first platform answering four non-negotiable questions: <em>What changed? Where did it change? How much did it change? And is the observed trend statistically significant?</em>
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 font-mono flex items-center gap-2">
              <span className="text-purple-700">3.</span>
              <span>Authentic NASA Satellite Datasets</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              Every data point in GlobTraceX originates from official NASA Earthdata portals:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1.5 pl-2 text-slate-600">
              <li><strong>NASA POWER:</strong> Langley Research Center MERRA-2 / CERES assimilated solar and meteorological parameters.</li>
              <li><strong>NASA MODIS (Terra & Aqua):</strong> Level-3 Land Surface Temperature (MOD11C3) and Vegetation Indices (MOD13C2) from NASA LP DAAC.</li>
              <li><strong>NASA GPM IMERG:</strong> Research-quality Final precipitation run (GPM_3IMERGM v07) calibrated with ground rain gauges at NASA GES DISC.</li>
              <li><strong>NASA GRACE / GRACE-FO:</strong> Tellus Terrestrial Water Storage Anomaly (RL06M) gravimetry grids from NASA PO.DAAC / JPL.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 font-mono flex items-center gap-2">
              <span className="text-purple-700">4.</span>
              <span>Deterministic Statistical Rigor</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              To eliminate seasonality biases, raw monthly values are deseasonalized by subtracting the 2000–2020 monthly reference mean for each calendar month. Trend rates are determined using non-parametric Theil-Sen median slopes and rank-based Mann-Kendall hypothesis testing with tie corrections. Every result is bounded by Gilbert (1987) two-tailed 95% confidence intervals.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 font-mono flex items-center gap-2">
              <span className="text-purple-700">5.</span>
              <span>Architecture & Scalable Geographic Hierarchy</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              While Bangladesh serves as the primary demonstration region featuring 64 extruded 3D district polygons, the underlying analytical engine is globally extensible. The architecture scales seamlessly from Country → Administrative Division → District → Basin without requiring modifications to the statistical computation engine.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={() => onNavigate('/investigate')}
            className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            <span>Launch Trend Investigation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
