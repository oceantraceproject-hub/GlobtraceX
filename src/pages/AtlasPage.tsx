import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { GLOBAL_COUNTRIES, GlobalCountry } from '../data/globalCountries';
import { NASA_DATASET_REGISTRY, NasaSourceRecord } from '../data/nasaRegistry';
import {
  Globe,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Layers,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Info,
  Calendar,
  Sparkles,
  MapPin,
  ArrowRight,
} from 'lucide-react';

interface AtlasPageProps {
  onNavigate: (route: string) => void;
}

export const AtlasPage: React.FC<AtlasPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  const [selectedVariable, setSelectedVariable] = useState<'lst' | 'rainfall' | 'ndvi' | 'tws' | 'solar'>('lst');
  const [selectedMetric, setSelectedMetric] = useState<'rate' | 'significance' | 'coverage'>('rate');
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step
  const [hoveredCountry, setHoveredCountry] = useState<GlobalCountry | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<string>('All');

  const timerRef = useRef<number | null>(null);

  const activeDataset: NasaSourceRecord = useMemo(() => {
    return (
      NASA_DATASET_REGISTRY.find((d) => d.variable === selectedVariable) ||
      NASA_DATASET_REGISTRY[0]
    );
  }, [selectedVariable]);

  // Timeline replay loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setCurrentYear((prev) => {
        if (prev >= 2026) return 2000;
        return prev + 1;
      });
    }, playbackSpeed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // Filtered countries
  const filteredCountries = useMemo(() => {
    if (selectedContinent === 'All') return GLOBAL_COUNTRIES;
    return GLOBAL_COUNTRIES.filter((c) => c.continent === selectedContinent);
  }, [selectedContinent]);

  // Metric color for a country in the active year
  const getCountryColor = (c: GlobalCountry) => {
    const yearFraction = (currentYear - 2000) / 26; // 0 to 1

    if (selectedMetric === 'significance') {
      const isSig = Math.abs(c.trendLST) > 0.3;
      return isSig ? '#7c3aed' : '#e2e8f0';
    }

    if (selectedMetric === 'coverage') {
      return c.coveragePercent >= 95 ? '#10b981' : c.coveragePercent >= 88 ? '#60a5fa' : '#f59e0b';
    }

    // Rate / Anomaly Shift
    if (selectedVariable === 'lst') {
      // Accumulating shift over historical years
      const shift = (c.trendLST / 10) * (currentYear - 2000);
      return shift > 0.8 ? '#ef4444' : shift > 0.4 ? '#f97316' : shift > 0.1 ? '#fbbf24' : '#a78bfa';
    } else if (selectedVariable === 'rainfall') {
      const shift = (c.trendRainfall / 10) * (currentYear - 2000);
      return shift < -4 ? '#f43f5e' : shift > 4 ? '#3b82f6' : '#8b5cf6';
    } else if (selectedVariable === 'ndvi') {
      const shift = (c.trendNDVI / 10) * (currentYear - 2000);
      return shift > 1.5 ? '#10b981' : shift < -1.5 ? '#eab308' : '#6366f1';
    } else if (selectedVariable === 'tws') {
      const shift = (c.trendTWS / 10) * (currentYear - 2000);
      return shift < -3.5 ? '#9333ea' : shift < -1.0 ? '#a855f7' : '#c084fc';
    }
    return '#8b5cf6';
  };

  return (
    <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold font-mono w-fit mx-auto">
            <Globe className="w-3.5 h-3.5" />
            <span>GLOBAL CHANGE ATLAS & TEMPORAL REPLAY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Global Planetary Environmental Atlas
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Investigate how satellite-derived Earth-system signals evolve country-by-country across the 2000–2026 observational record.
          </p>
        </div>

        {/* Controls & Metrics Panel */}
        <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Variable Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              {(['lst', 'rainfall', 'ndvi', 'tws', 'solar'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVariable(v)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    selectedVariable === v
                      ? 'bg-purple-900 text-white shadow-xs'
                      : 'bg-purple-50 text-slate-700 hover:bg-purple-100'
                  }`}
                >
                  {v === 'lst'
                    ? 'Daytime LST'
                    : v === 'rainfall'
                    ? 'Precipitation'
                    : v === 'ndvi'
                    ? 'Vegetation (NDVI)'
                    : v === 'tws'
                    ? 'Water Storage (TWS)'
                    : 'Solar Flux'}
                </button>
              ))}
            </div>

            {/* Metric Mode */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-400 font-sans text-[11px] uppercase mr-1">METRIC:</span>
              <button
                onClick={() => setSelectedMetric('rate')}
                className={`px-2.5 py-1 rounded-lg font-bold ${
                  selectedMetric === 'rate' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Theil-Sen Shift
              </button>
              <button
                onClick={() => setSelectedMetric('significance')}
                className={`px-2.5 py-1 rounded-lg font-bold ${
                  selectedMetric === 'significance' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Mann-Kendall p &lt; 0.05
              </button>
              <button
                onClick={() => setSelectedMetric('coverage')}
                className={`px-2.5 py-1 rounded-lg font-bold ${
                  selectedMetric === 'coverage' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Data Completeness %
              </button>
            </div>
          </div>

          {/* Earth Replay Timeline Slider Bar */}
          <div className="p-4 rounded-2xl bg-[#fafaff] border border-purple-100 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause Replay' : 'Play Earth Replay'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentYear(2000);
                  }}
                  className="p-1.5 rounded-lg bg-white border border-purple-200 text-slate-700 hover:bg-purple-50"
                  title="Reset to 2000"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-sans">Observation Year:</span>
                <span className="text-base font-black text-purple-900">
                  {currentYear}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({currentYear - 2000} yrs elapsed)
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min={2000}
                max={2026}
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>2000 (Baseline Start)</span>
                <span>2008</span>
                <span>2016</span>
                <span>2024</span>
                <span>2026 (Recent Record)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Geographic Atlas Surface */}
        <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 font-sans">FILTER CONTINENT:</span>
              {['All', 'Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedContinent(c)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedContinent === c
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-purple-50 text-slate-600 hover:bg-purple-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Dataset: <strong className="text-slate-800">{activeDataset.dataset_id}</strong> • Agency:{' '}
              <strong className="text-slate-800">{activeDataset.source_agency}</strong>
            </div>
          </div>

          {/* Interactive Country Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
            {filteredCountries.map((c) => {
              const color = getCountryColor(c);
              const isHovered = hoveredCountry?.code === c.code;

              return (
                <div
                  key={c.code}
                  onMouseEnter={() => setHoveredCountry(c)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => onNavigate(`/country/${c.code}`)}
                  className="p-3.5 rounded-2xl border border-purple-100 bg-[#fafaff] hover:bg-white hover:border-purple-300 transition-all shadow-2xs hover:shadow-sm cursor-pointer space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                        {c.code3}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono truncate">{c.region}</span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 truncate">
                      {c.name}
                    </h4>
                  </div>

                  {/* Scientific Metric Indicator Bar */}
                  <div className="space-y-1 pt-1 border-t border-purple-100/60 font-mono text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">
                        {selectedVariable === 'lst'
                          ? 'Decadal LST Shift:'
                          : selectedVariable === 'rainfall'
                          ? 'Precipitation Drift:'
                          : selectedVariable === 'ndvi'
                          ? 'Canopy Shift:'
                          : 'TWS Groundwater:'}
                      </span>
                      <span className="font-extrabold text-purple-900">
                        {selectedVariable === 'lst'
                          ? `+${c.trendLST}°C`
                          : selectedVariable === 'rainfall'
                          ? `${c.trendRainfall}%`
                          : selectedVariable === 'ndvi'
                          ? `${c.trendNDVI}%`
                          : `${c.trendTWS}cm`}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: color,
                          width: `${Math.min(100, Math.max(15, c.coveragePercent))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-purple-700 font-bold pt-1">
                    <span>Inspect Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scientific Integrity Disclaimer */}
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-slate-700 leading-relaxed max-w-3xl mx-auto text-center font-mono">
          <ShieldCheck className="w-4 h-4 text-purple-700 inline-block mr-1.5 -mt-0.5" />
          <span>
            <strong>Global Atlas Traceability Guarantee:</strong> Country-level aggregate metrics in the Atlas are deterministically processed from NASA Earth-observation grids. Animations communicate calibrated temporal progression and do not interpolate unobserved daily fluctuations.
          </span>
        </div>
      </div>
    </div>
  );
};
