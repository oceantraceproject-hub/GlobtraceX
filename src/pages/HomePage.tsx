import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { EarthExplorer } from '../components/EarthExplorer';
import { GoogleEarthMap } from '../components/GoogleEarthMap';
import { CapabilityCircle } from '../components/CapabilityCircle';
import { TrendAlertModal } from '../components/TrendAlertModal';
import { NASA_DATASET_REGISTRY } from '../data/nasaRegistry';
import {
  Compass,
  GitCompare,
  ShieldCheck,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Award,
  Thermometer,
  CloudRain,
  Sprout,
  Waves,
  Globe,
  Flame,
  Activity,
  FileText,
  Bell,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [mapEngine, setMapEngine] = useState<'google' | 'globe'>('google');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);

  const questions = [
    {
      id: 0,
      title: t('questions.q1.title'),
      desc: t('questions.q1.desc'),
      tag: t('questions.q1.tag'),
      icon: Thermometer,
      implementation:
        'Analyzes calibrated spectral radiometers (MODIS Terra/Aqua), microwave radar constellations (GPM IMERG), and gravimetric K-band interferometers (GRACE/GRACE-FO).',
    },
    {
      id: 1,
      title: t('questions.q2.title'),
      desc: t('questions.q2.desc'),
      tag: t('questions.q2.tag'),
      icon: Layers,
      implementation:
        'Hierarchical geographic resolution from planetary Earth to global continents, nations, and sub-national administrative boundary polygons with real georeferenced coordinates.',
    },
    {
      id: 2,
      title: t('questions.q3.title'),
      desc: t('questions.q3.desc'),
      tag: t('questions.q3.tag'),
      icon: BarChart3,
      implementation:
        'Deseasonalizes observations against monthly climatological baselines and computes non-parametric Theil-Sen median slopes with Gilbert (1987) 95% confidence intervals.',
    },
    {
      id: 3,
      title: t('questions.q4.title'),
      desc: t('questions.q4.desc'),
      tag: t('questions.q4.tag'),
      icon: CheckCircle2,
      implementation:
        'Executes monotonic rank-based Mann-Kendall hypothesis testing with tie-corrected variance to establish standardized Z-scores and exact two-tailed p-values.',
    },
  ];

  return (
    <div className="w-full bg-[#fafaff] min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-10 sm:pb-16 lg:pt-14 lg:pb-20 border-b border-purple-100 bg-gradient-to-b from-white via-[#fafaff] to-purple-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headlines & Actions */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6 min-w-0">
              {/* Competition Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold tracking-wide shadow-2xs w-fit">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse shrink-0" />
                <span className="truncate">NASA SPACE APPS 2026 • CHALLENGE 02</span>
              </div>

              {/* Main Distinctive Headline */}
              <div className="space-y-3">
                <h1 className="text-[clamp(2.2rem,4.5vw,3.75rem)] font-black text-slate-950 tracking-tight leading-[1.05] break-words">
                  {t('hero.titleMain')}{' '}
                  <span className="text-purple-700 block sm:inline">
                    {t('hero.titleSub')}
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-xl">
                  {t('hero.subtext')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('/investigate')}
                  className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-98"
                >
                  <Compass className="w-4 h-4" />
                  <span>{t('hero.ctaInvestigate')}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => onNavigate('/compare')}
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-purple-50 text-slate-800 font-bold text-sm border border-purple-200 shadow-xs transition-all flex items-center gap-2"
                >
                  <GitCompare className="w-4 h-4 text-purple-600" />
                  <span>{t('hero.ctaCompare')}</span>
                </button>

                <button
                  onClick={() => setIsAlertModalOpen(true)}
                  className="px-4 py-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-sm border border-amber-200 shadow-xs transition-all flex items-center gap-2"
                  title="Subscribe to Ocean and Climate Threshold Trend Alerts"
                >
                  <Bell className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>{language === 'bn' ? 'ট্রেন্ড অ্যালার্ট' : 'Trend Alerts'}</span>
                </button>
              </div>

              {/* Scientific Integrity Callout */}
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="leading-snug">{t('hero.integrityBadge')}</span>
              </div>
            </div>

            {/* Right Column: Unified Interactive Map Experience (Google Maps + Satellite Switcher) */}
            <div className="lg:col-span-7 flex flex-col justify-center min-w-0">
              <div className="p-2 sm:p-3 bg-white rounded-3xl shadow-xl border border-purple-100/90 space-y-2">
                {/* Engine Selector */}
                <div className="flex items-center justify-between px-2 pt-1 text-xs font-mono">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-purple-50 border border-purple-200">
                    <button
                      onClick={() => setMapEngine('google')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        mapEngine === 'google'
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'text-purple-900 hover:text-purple-700'
                      }`}
                    >
                      Google Maps Live
                    </button>
                    <button
                      onClick={() => setMapEngine('globe')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        mapEngine === 'globe'
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'text-purple-900 hover:text-purple-700'
                      }`}
                    >
                      3D Satellite Globe
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    73 Sovereign Nations • 5 Layers
                  </span>
                </div>

                {mapEngine === 'google' ? (
                  <GoogleEarthMap
                    heightClass="h-[440px] sm:h-[500px] lg:h-[530px]"
                    onNavigateToInvestigate={(code) => onNavigate('/investigate')}
                  />
                ) : (
                  <EarthExplorer
                    initialLevel="south-asia"
                    onNavigateToInvestigate={() => onNavigate('/investigate')}
                    heightClass="h-[440px] sm:h-[500px] lg:h-[530px]"
                    showInvestigationAction={true}
                  />
                )}

                <div className="px-3 py-1 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span className="truncate">Synchronized Google Maps &amp; NASA GIBS Satellite Base Layer</span>
                  <button
                    onClick={() => onNavigate('/investigate')}
                    className="text-purple-700 font-bold hover:underline shrink-0 ml-2"
                  >
                    Launch Full Lab →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Radial Scientific Capability Network (Section 24 & 51) */}
      <CapabilityCircle onNavigate={onNavigate} />

      {/* Signature Feature: Hot & Humid Days (Section 26) */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 text-white border-y border-purple-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-mono font-bold tracking-wider uppercase">
                <Flame className="w-3.5 h-3.5" />
                <span>SIGNATURE DERIVED INDICATOR</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                When Heat Meets Humidity
              </h2>
              <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed font-sans">
                How often do heat and humidity occur together — and is that changing? Track compounded thermal stress across 73 sovereign nations derived from NASA POWER daily meteorological observations.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/datasets/hot-humid-days')}
              className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs shadow-lg transition-all flex items-center gap-2 shrink-0 active:scale-95"
            >
              <span>Explore Hot &amp; Humid Days</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Transparent Metric Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-800/40 space-y-3">
              <span className="text-[10px] font-mono text-purple-300 uppercase block font-bold tracking-wider">
                UNDERLYING NASA SOURCE
              </span>
              <h3 className="text-xl font-bold text-white font-mono">
                NASA POWER Daily API
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Extracted from NASA Langley Research Center. Verified meteorological parameters: <code className="text-purple-300 font-mono">T2M_MAX</code>, <code className="text-purple-300 font-mono">RH2M</code>, and <code className="text-purple-300 font-mono">T2MWET</code>.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-800/40 space-y-3">
              <span className="text-[10px] font-mono text-purple-300 uppercase block font-bold tracking-wider">
                RIGOROUS THRESHOLD CRITERIA
              </span>
              <h3 className="text-xl font-bold text-white font-mono">
                T ≥ 32.0°C &amp; RH ≥ 70.0%
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Simultaneous daily joint evaluation. Measures physiological evaporative cooling breakdown and critical wet-bulb thermal limits.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-800/40 space-y-3">
              <span className="text-[10px] font-mono text-purple-300 uppercase block font-bold tracking-wider">
                REPRODUCIBLE STATISTICAL TREND
              </span>
              <h3 className="text-xl font-bold text-emerald-400 font-mono">
                Theil-Sen &amp; Mann-Kendall
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Every country trend is computed via non-parametric median pairwise slopes with Gilbert (1987) confidence intervals and exact p-values.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Workflow Data Story Sequence (Section 25) */}
      <section className="py-16 bg-white border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              TRACEABLE SCIENTIFIC PIPELINE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              From Raw NASA Observations to Interpretable Evidence
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              The end-to-end scientific verification workflow powering every metric in GlobTraceX.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
            {[
              { step: '01', title: 'NASA DATA', desc: 'Calibrated orbital radiometers & gravimetry' },
              { step: '02', title: 'VALIDATION', desc: 'QA mask screening & fill-value removal' },
              { step: '03', title: 'ANALYSIS', desc: 'Monthly climatology deseasonalization' },
              { step: '04', title: 'TREND', desc: 'Non-parametric Theil-Sen median slopes' },
              { step: '05', title: 'EVIDENCE', desc: 'Mann-Kendall p-value hypothesis testing' },
              { step: '06', title: 'UNDERSTANDING', desc: 'Reproducible public environmental intelligence' },
            ].map((s, idx) => (
              <div
                key={s.step}
                className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col justify-between space-y-2 relative"
              >
                <span className="text-[10px] font-mono font-black text-purple-700">{s.step}</span>
                <h4 className="text-xs font-black text-slate-900 font-mono tracking-tight">{s.title}</h4>
                <p className="text-[11px] text-slate-500 font-sans leading-tight">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Four Scientific Questions (Interactive) */}
      <section className="py-14 sm:py-16 border-b border-purple-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              CORE SCIENTIFIC PURPOSE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('questions.heading')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {t('questions.subheading')}
            </p>
          </div>

          {/* Interactive Question Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {questions.map((q, idx) => {
              const isSelected = activeQuestion === idx;
              const Icon = q.icon;
              return (
                <button
                  key={q.id}
                  onClick={() => setActiveQuestion(idx)}
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-900 text-white border-purple-900 shadow-lg ring-2 ring-purple-600/30'
                      : 'bg-[#fafaff] text-slate-800 border-purple-100 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isSelected ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-300' : 'text-purple-600'}`} />
                    </div>

                    <h3
                      className={`text-sm font-extrabold tracking-tight ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {q.title}
                    </h3>
                    <p
                      className={`text-xs mt-1.5 leading-relaxed line-clamp-3 ${
                        isSelected ? 'text-purple-200' : 'text-slate-600'
                      }`}
                    >
                      {q.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-purple-200/40 flex items-center justify-between text-xs font-mono">
                    <span className={isSelected ? 'text-purple-300 font-bold' : 'text-purple-700'}>
                      {q.tag}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 ${isSelected ? 'translate-x-1 text-purple-300' : 'text-slate-400'}`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Question Deep-Dive Explanation Card */}
          <div className="p-6 rounded-2xl bg-purple-50/80 border border-purple-200 text-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono text-purple-800 font-bold uppercase tracking-wider">
                SCIENTIFIC COMPUTATION FRAMEWORK: {questions[activeQuestion].title}
              </span>
              <button
                onClick={() => onNavigate('/references')}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 underline font-mono"
              >
                View Statistical Derivations & Citations →
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-mono">
              {questions[activeQuestion].implementation}
            </p>
          </div>
        </div>
      </section>

      {/* Connected NASA Satellite Datasets Showcase */}
      <section className="py-14 sm:py-16 bg-[#fafaff] border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                OFFICIAL NASA SOURCE REGISTRY
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                Authentic NASA Earth-Observation Satellite Datasets
              </h2>
            </div>

            <button
              onClick={() => onNavigate('/datasets')}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 font-mono"
            >
              <span>Explore Complete Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {NASA_DATASET_REGISTRY.slice(0, 4).map((d) => (
              <div
                key={d.dataset_id}
                className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {d.mission.split('/')[0]}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      VERIFIED SOURCE
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {d.dataset_name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {d.processing_method}
                  </p>

                  <div className="pt-1 text-[11px] font-mono text-slate-500 space-y-0.5">
                    <div>Agency: <strong className="text-slate-700">{d.source_agency}</strong></div>
                    <div>Product: <strong className="text-slate-700">{d.product_name.split(' ')[0]}</strong></div>
                    <div>Version: <strong className="text-slate-700">{d.product_version}</strong></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between text-xs">
                  <span className="text-purple-700 font-mono font-bold text-[11px]">{d.units}</span>
                  <a
                    href={d.official_source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
                  >
                    <span>Official NASA</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global & Regional Scientific Scope */}
      <section className="py-14 bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-purple-300">
              <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400/30">
                SCIENTIFIC SCOPE
              </span>
              <span>FROM GLOBAL TO SUB-NATIONAL OBSERVATIONS</span>
            </div>

            <h3 className="text-2xl font-extrabold tracking-tight text-white">
              Every trend has a direction. Every result has a source.
            </h3>

            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed font-sans">
              Investigate 73 sovereign countries and 64 high-resolution Bangladesh district boundaries. Evaluate Theil-Sen median slopes, 95% confidence intervals, and Mann-Kendall significance across Land Surface Temperature, GPM Precipitation, MODIS Vegetation vitality, and GRACE Water Storage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('/investigate')}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-purple-50 text-purple-900 font-bold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <Compass className="w-4 h-4 text-purple-700" />
              <span>Launch Investigation</span>
              <ArrowRight className="w-4 h-4 text-purple-700" />
            </button>
            <button
              onClick={() => onNavigate('/team')}
              className="px-5 py-3.5 rounded-xl bg-purple-800/80 hover:bg-purple-700 text-purple-100 font-bold text-xs border border-purple-500/40 transition-all flex items-center gap-2"
            >
              <span>Meet Team Protichamp</span>
            </button>
            <button
              onClick={() => setIsAlertModalOpen(true)}
              className="px-4 py-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold text-xs transition-all flex items-center gap-2"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Trend Alerts</span>
            </button>
          </div>
        </div>
      </section>

      {/* Global Trend Alert Modal */}
      <TrendAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        defaultParameter="sst"
      />
    </div>
  );
};
