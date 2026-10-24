import React, { useState, useEffect } from 'react';
import { LiveEarthIntelligence } from '../services/intelligenceEngine';
import { ImpactBridge } from './ImpactBridge';
import { EvidencePassportCard } from './EvidencePassportCard';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Activity,
  CheckCircle2,
  HelpCircle,
  Scale,
  Calendar,
  Layers,
  ExternalLink,
  Users,
  Compass,
  FileText,
  BarChart3,
  Clock,
  Sparkles,
  Info,
  Copy,
  Download,
} from 'lucide-react';

interface AnalysisRecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  intelligence: LiveEarthIntelligence;
}

export const AnalysisRecommendationsModal: React.FC<AnalysisRecommendationsModalProps> = ({
  isOpen,
  onClose,
  intelligence,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'evidence' | 'bridge'>('overview');

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const {
    regionName,
    regionId,
    indicator,
    situation,
    whatIsHappening,
    whyDoesItMatter,
    whatShouldHappenNext,
    evidenceAndConfidence,
    impactBridge,
    stakeholders,
    evidencePassport,
    methodology,
    period,
  } = intelligence;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="analysis-modal-title"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden my-auto">
        {/* Header Strip */}
        <div className="px-5 sm:px-6 py-4 border-b border-purple-100 bg-gradient-to-r from-purple-50/70 via-white to-purple-50/40 flex items-center justify-between gap-4 shrink-0">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-purple-700 uppercase tracking-wider">
                EARTH INTELLIGENCE & ADAPTIVE RECOMMENDATIONS
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${situation.badgeBg} ${situation.badgeBorder} ${situation.badgeColor} font-bold`}>
                {situation.label}
              </span>
            </div>
            <h3 id="analysis-modal-title" className="text-lg sm:text-xl font-black text-slate-950 tracking-tight truncate">
              {regionName} • {indicator.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
            aria-label="Close Analysis Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Navigation Strip */}
        <div className="px-5 sm:px-6 border-b border-slate-200 bg-slate-50/60 flex items-center gap-2 overflow-x-auto py-2 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>1. Diagnostic Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'recommendations'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>2. Adaptive Recommendations</span>
          </button>

          <button
            onClick={() => setActiveTab('bridge')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'bridge'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>3. Impact Bridge</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'evidence'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Evidence Passport & Provenance</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: DIAGNOSTIC OVERVIEW (Sections 1, 2, 3, 4) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Section 1: Current Situation Summary */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/50 to-white border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-700 uppercase tracking-wider">
                    Section 1 • Current Situation Assessment
                  </span>
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${situation.badgeBg} ${situation.badgeBorder} ${situation.badgeColor}`}>
                    {situation.label}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-950">
                  {situation.headline}
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {situation.summary}
                </p>
              </div>

              {/* Section 2: What the Data Shows */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Section 2 • What the Data Shows
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Theil-Sen Median Slope</p>
                    <p className="text-base font-mono font-bold text-slate-900">
                      {whatIsHappening.observedMetric}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">Decadal monotonic rate</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Mann-Kendall Rank Test</p>
                    <p className="text-base font-mono font-bold text-purple-700">
                      p = {evidenceAndConfidence.pValue.toFixed(3)} (Z = {evidenceAndConfidence.zScore.toFixed(2)})
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {evidenceAndConfidence.pValue <= 0.05 ? 'Significant (p ≤ 0.05)' : 'Not significant'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Observational Coverage</p>
                    <p className="text-base font-mono font-bold text-emerald-700">
                      {evidenceAndConfidence.coveragePct.toFixed(1)}% Completeness
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {evidenceAndConfidence.validObservations} valid monthly cycles
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-1.5 text-xs text-slate-600">
                  <p><strong>Detailed Trajectory:</strong> {whatIsHappening.rateStatement}</p>
                  <p><strong>Sub-period Stability:</strong> {whatIsHappening.subPeriodBehavior}</p>
                  <p><strong>Climatological Baseline:</strong> {whatIsHappening.baselineComparison}</p>
                </div>
              </div>

              {/* Section 3: Underlying Environmental Drivers & Human Impact */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Section 3 • Underlying Drivers & Environmental Relevance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                    <h5 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5 text-purple-700">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Biophysical Mechanism</span>
                    </h5>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {whyDoesItMatter.biophysicalMechanism}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                    <h5 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5 text-purple-700">
                      <Users className="w-3.5 h-3.5" />
                      <span>Socioeconomic & Environmental Impact</span>
                    </h5>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {whyDoesItMatter.environmentalImpact}
                    </p>
                    <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                      Vulnerability: {whyDoesItMatter.humanVulnerability}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  {whyDoesItMatter.distinctionNote}
                </p>
              </div>

              {/* Section 4: Confidence & Uncertainty Analysis */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Section 4 • Confidence & Uncertainty Evaluation
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
                    <span className="font-mono text-slate-700">
                      Uncertainty Rating: <strong className="text-slate-900">{evidenceAndConfidence.uncertaintyLevel}</strong>
                    </span>
                    <span className="font-mono text-slate-700">
                      {evidenceAndConfidence.confidenceInterval}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-bold text-slate-800">Telemetry Quality & Sensor Limitations:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {evidenceAndConfidence.limitations.map((lim, idx) => (
                        <li key={idx}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADAPTIVE RECOMMENDATIONS (Sections 5, 6, 7, 8, 9, 10) */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              {/* Prioritized Action Horizon Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Section 5: Immediate Recommendations (0–6 Months) */}
                <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-rose-800 uppercase tracking-wider">
                      Section 5 • Immediate (0–6 Mo)
                    </span>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {whatShouldHappenNext.immediate.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                        <span className="leading-snug">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Section 6: Medium-Term Recommendations (6–24 Months) */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-amber-800 uppercase tracking-wider">
                      Section 6 • Medium-Term (6–24 Mo)
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {whatShouldHappenNext.mediumTerm.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <span className="leading-snug">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Section 7: Long-Term Strategic (2–5+ Years) */}
                <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-purple-800 uppercase tracking-wider">
                      Section 7 • Long-Term (2–5+ Yrs)
                    </span>
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {whatShouldHappenNext.longTerm.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
                        <span className="leading-snug">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sections 8 & 9: What to Monitor vs What to Avoid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Section 8: What to Monitor Next */}
                <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2.5">
                  <h4 className="text-xs font-mono font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-purple-700" />
                    <span>Section 8 • What to Monitor Next (Leading Indicators)</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {whatShouldHappenNext.whatToMonitor.map((mon, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{mon}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Section 9: What to Avoid or Postpone */}
                <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2.5">
                  <h4 className="text-xs font-mono font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-700" />
                    <span>Section 9 • What to Avoid or Postpone (Maladaptations)</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {whatShouldHappenNext.whatToAvoid.map((av, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{av}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Section 10: Relevant Stakeholders & Action Mapping */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Section 10 • Relevant Stakeholders & Operational Roles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {stakeholders.map((sh, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <p className="text-[10px] font-mono text-purple-700 uppercase font-bold">{sh.role}</p>
                      <p className="text-xs font-bold text-slate-900">{sh.title}</p>
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        {sh.actionFocus}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMPACT BRIDGE */}
          {activeTab === 'bridge' && (
            <div className="space-y-4">
              <ImpactBridge steps={impactBridge} />
            </div>
          )}

          {/* TAB 4: EVIDENCE PASSPORT & METHODOLOGY (Section 11) */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              <EvidencePassportCard passport={evidencePassport} />

              {/* Section 11: Methodology & Data Provenance */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                  Section 11 • Scientific Methodology & Data Provenance
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="font-mono text-slate-500 uppercase text-[10px] block">Mathematical Algorithm</span>
                    <p className="font-medium">{methodology.algorithm}</p>
                  </div>
                  <div>
                    <span className="font-mono text-slate-500 uppercase text-[10px] block">Hypothesis Testing</span>
                    <p className="font-medium">{methodology.hypothesisTest}</p>
                  </div>
                  <div>
                    <span className="font-mono text-slate-500 uppercase text-[10px] block">Satellite Mission & Sensor</span>
                    <p className="font-medium">{methodology.sensor}</p>
                  </div>
                  <div>
                    <span className="font-mono text-slate-500 uppercase text-[10px] block">Official NASA Catalog ID</span>
                    <p className="font-mono">{methodology.datasetId} • DOI: {methodology.doi}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] font-mono text-slate-500">
            GlobTraceX Live Earth Intelligence • NASA Space Apps Challenge 2026
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold font-mono transition-colors active:scale-95 shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
