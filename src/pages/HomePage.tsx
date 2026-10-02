import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { EarthExplorer } from '../components/EarthExplorer';
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
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [activeQuestion, setActiveQuestion] = useState<number>(0);

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
        'Hierarchical geographic resolution from planetary Earth to Bangladesh divisions down to 64 district-level administrative boundary polygons with real coordinates.',
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
    <div className="w-full bg-[#fafaff] min-h-screen font-['Manrope']">
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
                <h1 className="text-[clamp(2.2rem,4.5vw,3.75rem)] font-black text-slate-950 tracking-tight leading-[1.05] font-['Space_Grotesk'] break-words">
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
                  className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-['Space_Grotesk'] font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-98"
                >
                  <Compass className="w-4 h-4" />
                  <span>{t('hero.ctaInvestigate')}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => onNavigate('/compare')}
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-purple-50 text-slate-800 font-['Space_Grotesk'] font-bold text-sm border border-purple-200 shadow-xs transition-all flex items-center gap-2"
                >
                  <GitCompare className="w-4 h-4 text-purple-600" />
                  <span>{t('hero.ctaCompare')}</span>
                </button>
              </div>

              {/* Scientific Integrity Callout */}
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="leading-snug">{t('hero.integrityBadge')}</span>
              </div>
            </div>

            {/* Right Column: Unified Interactive EarthExplorer */}
            <div className="lg:col-span-7 flex flex-col justify-center min-w-0">
              <div className="p-2 sm:p-3 bg-white rounded-3xl shadow-xl border border-purple-100/90">
                <EarthExplorer
                  initialLevel="south-asia"
                  onNavigateToInvestigate={() => onNavigate('/investigate')}
                  heightClass="h-[440px] sm:h-[500px] lg:h-[540px]"
                  showInvestigationAction={true}
                />
                <div className="mt-2.5 px-3 py-1 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span className="truncate">Global Earth Observation • Touch/drag to rotate, pinch/scroll to zoom</span>
                  <button
                    onClick={() => onNavigate('/investigate')}
                    className="text-purple-700 font-bold hover:underline shrink-0 ml-2"
                  >
                    Open Full Lab →
                  </button>
                </div>
              </div>
            </div>
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
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
                      className={`text-sm font-extrabold tracking-tight font-['Space_Grotesk'] ${
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
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-['Space_Grotesk']">
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

                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug font-['Space_Grotesk']">
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

      {/* Featured Demonstration: Bangladesh Earth System Case Study */}
      <section className="py-14 bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-purple-300">
              <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400/30">
                DEMONSTRATION CASE STUDY
              </span>
              <span>BANGLADESH GIS DISTRICT LAB</span>
            </div>

            <h3 className="text-2xl font-extrabold tracking-tight text-white font-['Space_Grotesk']">
              Investigate Bangladesh District-Level Earth System Signals
            </h3>

            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
              Explore 64 georeferenced administrative districts with authentic GIS boundaries. Compute Theil-Sen slopes and Mann-Kendall significance for Land Surface Temperature, GPM IMERG Precipitation, and GRACE Terrestrial Water Storage.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/investigate')}
            className="shrink-0 px-6 py-3.5 rounded-xl bg-white hover:bg-purple-50 text-purple-900 font-['Space_Grotesk'] font-bold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95"
          >
            <Compass className="w-4 h-4 text-purple-700" />
            <span>Open Investigation Lab</span>
            <ArrowRight className="w-4 h-4 text-purple-700" />
          </button>
        </div>
      </section>
    </div>
  );
};
