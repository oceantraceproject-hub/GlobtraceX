import React from 'react';
import { LiveEarthIntelligence } from '../services/intelligenceEngine';
import {
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Activity,
  CheckCircle2,
  HelpCircle,
  Scale,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface LiveIntelligencePanelProps {
  intelligence: LiveEarthIntelligence;
  onOpenAnalysisModal: () => void;
  isLoading?: boolean;
}

export const LiveIntelligencePanel: React.FC<LiveIntelligencePanelProps> = ({
  intelligence,
  onOpenAnalysisModal,
  isLoading = false,
}) => {
  const {
    regionName,
    indicator,
    situation,
    whatIsHappening,
    whyDoesItMatter,
    whatShouldHappenNext,
    evidenceAndConfidence,
    period,
  } = intelligence;

  // Icon selector based on diagnostic classification
  const renderSituationIcon = () => {
    switch (situation.iconType) {
      case 'check':
        return <CheckCircle2 className="w-4 h-4 text-emerald-700" />;
      case 'trending-up':
        return <TrendingUp className="w-4 h-4 text-teal-700" />;
      case 'alert-triangle':
        return <AlertTriangle className="w-4 h-4 text-rose-700" />;
      case 'activity':
        return <Activity className="w-4 h-4 text-purple-700" />;
      case 'scale':
        return <Scale className="w-4 h-4 text-indigo-700" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-700" />;
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-purple-200/90 shadow-sm overflow-hidden transition-all duration-300">
      {/* Top Banner Accent Stripe */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-xs font-mono font-bold tracking-wider">
            LIVE EARTH INTELLIGENCE • AUTOMATED TELEMETRY DIAGNOSTIC
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-purple-200">
          <span className="hidden sm:inline">NASA Earth-Observation Stream</span>
          <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-semibold">
            {period.start} – {period.end}
          </span>
        </div>
      </div>

      {/* Main Panel Content Body */}
      <div className="p-4 sm:p-6 lg:p-7 space-y-5">
        {/* Row 1: Target Header & Diagnostic Classification Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-semibold text-purple-700 uppercase tracking-wider">
                {indicator.category} • {indicator.shortName}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-mono text-slate-500">
                Sensor: {indicator.sensor.split('(')[0].trim()}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
              {regionName}: {situation.headline}
            </h2>
          </div>

          {/* Diagnostic Situation Badge & CTA */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${situation.badgeBg} ${situation.badgeBorder} ${situation.badgeColor} shadow-2xs`}
            >
              {renderSituationIcon()}
              <span className="text-xs font-bold font-mono tracking-tight uppercase">
                {situation.label}
              </span>
            </div>

            <button
              onClick={onOpenAnalysisModal}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-purple-600/20 whitespace-nowrap"
              aria-label="View Analysis and Recommendations"
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>View Analysis &amp; Recommendations</span>
              <ChevronRight className="w-3.5 h-3.5 text-purple-200 shrink-0" />
            </button>
          </div>
        </div>

        {/* Diagnostic Situation Summary Narrative */}
        <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed font-normal bg-purple-50/40 p-3.5 rounded-2xl border border-purple-100/80">
          {situation.summary}
        </p>

        {/* Row 2: Diagnostic Tri-Card Grid (What is happening, Why it matters, What should happen next) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card A: What Is Happening? */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-purple-200 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                What Is Happening?
              </span>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                {whatIsHappening.observedMetric}
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
              {whatIsHappening.rateStatement}
            </p>
            <p className="text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-100">
              {whatIsHappening.baselineComparison}
            </p>
          </div>

          {/* Card B: Why Does It Matter? */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-purple-200 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Why Does It Matter?
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                Environmental & Human
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
              {whyDoesItMatter.environmentalImpact}
            </p>
            <p className="text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-100 truncate">
              Vulnerability: {whyDoesItMatter.humanVulnerability.slice(0, 75)}...
            </p>
          </div>

          {/* Card C: What Should Happen Next? */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-purple-200 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                What Should Happen Next?
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                Priority Action
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-800 font-medium leading-relaxed">
              {whatShouldHappenNext.topPriority}
            </p>
            <p className="text-[11px] text-purple-700 font-mono pt-1 border-t border-slate-100 flex items-center gap-1 cursor-pointer hover:underline" onClick={onOpenAnalysisModal}>
              <span>Explore all immediate & strategic steps</span>
              <ArrowRight className="w-3 h-3" />
            </p>
          </div>
        </div>

        {/* Row 3: Bottom Telemetry & Statistical Quality Strip */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-600">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              <span>Coverage: <strong className="text-slate-900">{evidenceAndConfidence.coveragePct.toFixed(1)}%</strong> ({evidenceAndConfidence.validObservations} cycles)</span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              <span>Significance: <strong className="text-slate-900">p = {evidenceAndConfidence.pValue.toFixed(3)}</strong></span>
            </span>

            <span className="hidden lg:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              <span>Uncertainty: <strong className="text-slate-900">{evidenceAndConfidence.uncertaintyLevel}</strong></span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              NASA {indicator.productId}
            </span>
            <button
              onClick={onOpenAnalysisModal}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 hover:underline flex items-center gap-1"
            >
              <span>Full Diagnostic & Evidence Passport</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
