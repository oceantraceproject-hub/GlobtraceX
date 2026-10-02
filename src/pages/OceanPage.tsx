import React, { useState, useMemo, useEffect } from 'react';
import { OceanRegion, VariableType, NasaDataset } from '../types/nasa';
import { OCEAN_REGIONS } from '../data/oceanRegions';
import { NASA_DATASETS } from '../data/nasaDatasets';
import { OceanMap } from '../components/OceanMap';
import { TimeSeriesChart } from '../components/TimeSeriesChart';
import { FourQuestions } from '../components/FourQuestions';
import { TraceToSourceModal } from '../components/TraceToSourceModal';
import { CalculationsModal } from '../components/CalculationsModal';
import { getObservationsForRegion, computeTrendAnalysis } from '../lib/scienceEngine';
import {
  Compass,
  Globe,
  Layers,
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Info,
  Thermometer,
  Waves,
  Droplets,
  Activity,
  ArrowRight,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface OceanPageProps {
  selectedRegion: OceanRegion;
  onSelectRegion: (region: OceanRegion) => void;
  selectedVariable: VariableType;
  onSelectVariable: (variable: VariableType) => void;
  onNavigate: (route: string) => void;
}

export const OceanPage: React.FC<OceanPageProps> = ({
  selectedRegion,
  onSelectRegion,
  selectedVariable,
  onSelectVariable,
  onNavigate,
}) => {
  const [useAnomalies, setUseAnomalies] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'map' | 'trends' | 'basins'>('map');
  const [isTraceModalOpen, setIsTraceModalOpen] = useState<boolean>(false);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState<boolean>(false);

  // Time scrubber state (2002 to 2026)
  const [currentYear, setCurrentYear] = useState<number>(2024);
  const [currentMonth, setCurrentMonth] = useState<number>(6);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Ensure variable is an ocean variable
  const oceanVariables: { id: VariableType; label: string; icon: any; units: string; desc: string }[] = [
    {
      id: 'sst',
      label: 'Sea Surface Temperature',
      icon: Thermometer,
      units: '°C',
      desc: 'Skin ocean temperature from MODIS Aqua and JPL MUR infrared radiometers',
    },
    {
      id: 'chlorophyll',
      label: 'Chlorophyll-a Concentration',
      icon: Droplets,
      units: 'mg/m³',
      desc: 'Photosynthetic pigment index indicating marine phytoplankton biomass from MODIS & PACE OCI',
    },
    {
      id: 'ssh_anomaly',
      label: 'Sea Surface Height Anomaly',
      icon: Waves,
      units: 'cm',
      desc: 'Ka-band radar altimetry measurements of dynamic topography from SWOT and altimetry missions',
    },
  ];

  // Available datasets for this variable
  const availableDatasets = useMemo(() => {
    return NASA_DATASETS.filter((d) => d.variable === selectedVariable);
  }, [selectedVariable]);

  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(
    availableDatasets[0]?.id || 'modis-aqua-sst-monthly'
  );

  useEffect(() => {
    if (!availableDatasets.some((d) => d.id === selectedDatasetId)) {
      if (availableDatasets.length > 0) {
        setSelectedDatasetId(availableDatasets[0].id);
      }
    }
  }, [selectedVariable, availableDatasets, selectedDatasetId]);

  const currentDataset = useMemo(() => {
    return (
      NASA_DATASETS.find((d) => d.id === selectedDatasetId) ||
      availableDatasets[0] ||
      NASA_DATASETS[0]
    );
  }, [selectedDatasetId, availableDatasets]);

  // Observations and trend computation for the selected region
  const observations = useMemo(() => {
    return getObservationsForRegion(selectedRegion.id, selectedVariable, currentDataset.id);
  }, [selectedRegion.id, selectedVariable, currentDataset.id]);

  const trendResult = useMemo(() => {
    return computeTrendAnalysis(selectedRegion, currentDataset, observations, useAnomalies);
  }, [selectedRegion, currentDataset, observations, useAnomalies]);

  // Animation player for historical time slider
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentMonth((prevMonth) => {
          if (prevMonth >= 12) {
            setCurrentYear((prevYear) => (prevYear >= 2026 ? 2002 : prevYear + 1));
            return 1;
          }
          return prevMonth + 1;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Comparative trends across all major ocean basins
  const basinTrends = useMemo(() => {
    return OCEAN_REGIONS.map((region) => {
      const obs = getObservationsForRegion(region.id, selectedVariable, currentDataset.id);
      const res = computeTrendAnalysis(region, currentDataset, obs, true);
      return {
        region,
        slope: res.olsSlope,
        pValue: res.mannKendallPValue,
        isSignificant: res.isSignificant005,
        r2: res.olsR2,
        totalChange: res.totalMagnitude,
      };
    }).sort((a, b) => Math.abs(b.slope) - Math.abs(a.slope));
  }, [selectedVariable, currentDataset]);

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen">
      {/* Top Banner & Editorial Header */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                <Globe className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 font-bold block">
                  NASA EARTH OBSERVATION • GLOBAL OCEAN MODE
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Ocean Observation & Trend Laboratory
                </h1>
              </div>
            </div>

            {/* Link to coupled Bangladesh Earth System */}
            <button
              onClick={() => onNavigate('/bangladesh')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-950 to-cyan-950 border border-emerald-800/80 hover:border-emerald-600 text-emerald-300 text-xs font-semibold flex items-center gap-2 transition-all group"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trace Coupled Bay of Bengal → Bangladesh Land Impact</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Investigate multi-decadal thermodynamic warming, ocean color dynamics, and sea surface height variability across Earth’s ocean basins. Grounded directly in calibrated NASA Earth-observing satellite radiometers and radar altimeters.
          </p>

          {/* Quick Variable Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {oceanVariables.map((v) => {
              const Icon = v.icon;
              const isSelected = selectedVariable === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => onSelectVariable(v.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-500 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-md ${
                          isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          isSelected ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {v.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-300">
                      {v.units}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {v.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Interactive Workstation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Interactive Ocean Atlas</span>
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'trends'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Time-Series & Statistics</span>
            </button>
            <button
              onClick={() => setActiveTab('basins')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'basins'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Global Basin Comparison</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseAnomalies(!useAnomalies)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                useAnomalies
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {useAnomalies ? 'ANOMALIES (CLIMATOLOGY DETRENDED)' : 'RAW OBSERVATIONS'}
            </button>
            <button
              onClick={() => setIsTraceModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TRACE TO SOURCE</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Interactive Ocean Atlas */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Map and Controls Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Control Bar (3 cols) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Active Basin Card */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                      SELECTED BASIN REGION
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {selectedRegion.coordinates.latMin}°N to {selectedRegion.coordinates.latMax}°N
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Compass className="w-4 h-4 text-cyan-400" />
                      {selectedRegion.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {selectedRegion.description}
                    </p>
                  </div>

                  {/* Quick Basin Selector */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Switch Ocean Basin
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {OCEAN_REGIONS.map((region) => (
                        <button
                          key={region.id}
                          onClick={() => onSelectRegion(region)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left truncate transition-all ${
                            selectedRegion.id === region.id
                              ? 'bg-cyan-600 text-white font-bold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                          title={region.name}
                        >
                          {region.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ecological Significance */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                    <div className="text-[10px] font-mono text-cyan-400 mb-1 flex items-center gap-1 font-semibold">
                      <Info className="w-3 h-3" />
                      ECOLOGICAL SYSTEM DYNAMICS
                    </div>
                    {selectedRegion.ecologicalSignificance}
                  </div>
                </div>

                {/* NASA Dataset Provenance Quick Box */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                      ACTIVE SATELLITE PRODUCT
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        currentDataset.status === 'TREND-READY'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/80'
                      }`}
                    >
                      {currentDataset.status}
                    </span>
                  </div>

                  <div className="font-semibold text-white text-xs">
                    {currentDataset.productTitle}
                  </div>
                  <div className="text-slate-400 text-[11px] font-mono">
                    Provider: {currentDataset.provider}
                  </div>
                  <div className="text-slate-400 text-[11px] font-mono">
                    Resolution: {currentDataset.spatialResolution}
                  </div>
                </div>
              </div>

              {/* Center Map (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
                  {/* Ocean Map Render */}
                  <OceanMap
                    selectedRegion={selectedRegion}
                    onSelectRegion={onSelectRegion}
                    selectedVariable={selectedVariable}
                  />

                  {/* Time Scrubber / Temporal Player */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-xs"
                        title={isPlaying ? 'Pause Timeline' : 'Play Observation Sequence'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentYear(2024);
                          setCurrentMonth(6);
                        }}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                        title="Reset to Present Benchmark"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <div>
                        <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                          HISTORICAL TIME SLIDER
                        </div>
                        <div className="text-xs font-mono font-bold text-white">
                          {currentYear} - {String(currentMonth).padStart(2, '0')} (Aqua MODIS Record)
                        </div>
                      </div>
                    </div>

                    {/* Scrub Slider */}
                    <div className="flex-1 min-w-[200px] flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">2002</span>
                      <input
                        type="range"
                        min="2002"
                        max="2026"
                        value={currentYear}
                        onChange={(e) => setCurrentYear(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <span className="text-[10px] font-mono text-slate-500">2026</span>
                    </div>
                  </div>
                </div>

                {/* Four Scientific Questions Result Grid */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      Scientific Assessment Results
                    </h3>
                    <button
                      onClick={() => setIsCalcModalOpen(true)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline"
                    >
                      View Formula & Mathematical Derivation
                    </button>
                  </div>

                  <FourQuestions trendResult={trendResult} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Time-Series & Statistics */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                    NASA VERIFIED SATELLITE TIME-SERIES
                  </span>
                  <h2 className="text-xl font-extrabold text-white mt-0.5">
                    {selectedRegion.name} • {trendResult.variableName}
                  </h2>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">DECIMAL SLOPE (OLS)</span>
                    <span className="font-bold text-cyan-300">
                      {trendResult.olsSlope > 0 ? '+' : ''}
                      {(trendResult.olsSlope * 10).toFixed(3)} {trendResult.units}/decade
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">P-VALUE (MANN-KENDALL)</span>
                    <span
                      className={`font-bold ${
                        trendResult.isSignificant005 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      p {trendResult.mannKendallPValue < 0.001 ? '< 0.001' : `= ${trendResult.mannKendallPValue.toFixed(4)}`}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">SIGNIFICANCE</span>
                    <span
                      className={`font-bold ${
                        trendResult.isSignificant005 ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {trendResult.isSignificant005 ? 'Statistically Significant (p < 0.05)' : 'Not Significant'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart Component */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <TimeSeriesChart
                  observations={observations}
                  trendResult={trendResult}
                  useAnomalies={useAnomalies}
                  onToggleAnomalyMode={(val) => setUseAnomalies(val)}
                />
              </div>

              {/* Methodology & Quality Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5 font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Rigorous Climatology Protocol
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Monthly anomalies are computed by subtracting the 2002–2020 climatological mean for each specific calendar month, effectively removing the harmonic annual cycle. Linear trends are evaluated using both Ordinary Least Squares (OLS) and non-parametric Theil-Sen regression with Mann-Kendall monotonic rank testing.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5 font-mono">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Observational Caveats & Limitations
                  </h4>
                  <ul className="text-slate-400 list-disc list-inside space-y-1">
                    {currentDataset.limitations.slice(0, 2).map((lim, idx) => (
                      <li key={idx}>{lim}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Global Basin Comparison */}
        {activeTab === 'basins' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                  CROSS-BASIN COMPARATIVE ANALYSIS
                </span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">
                  Decadal Trend Rates Across Earth’s Ocean Basins
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Comparing multi-decadal slope rates for {trendResult.variableName} across all indexed regions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {basinTrends.map(({ region, slope, pValue, isSignificant, totalChange }) => {
                  const isCurrent = selectedRegion.id === region.id;
                  return (
                    <div
                      key={region.id}
                      onClick={() => {
                        onSelectRegion(region);
                        setActiveTab('map');
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-cyan-950/70 border-cyan-500 shadow-md shadow-cyan-950/40'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{region.name}</span>
                          {region.isFeatured && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800/80">
                              FEATURED
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            isSignificant
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isSignificant ? 'p < 0.05' : 'p ≥ 0.05'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono my-2">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 block">DECADAL SLOPE</span>
                          <span
                            className={`font-bold ${
                              slope > 0 ? 'text-rose-400' : slope < 0 ? 'text-sky-400' : 'text-slate-300'
                            }`}
                          >
                            {slope > 0 ? '+' : ''}
                            {(slope * 10).toFixed(3)} {trendResult.units}/dec
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 block">TOTAL CUMULATIVE</span>
                          <span className="font-bold text-cyan-300">
                            {totalChange > 0 ? '+' : ''}
                            {totalChange.toFixed(2)} {trendResult.units}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {region.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trace to Source Modal */}
      <TraceToSourceModal
        isOpen={isTraceModalOpen}
        onClose={() => setIsTraceModalOpen(false)}
        dataset={currentDataset}
        region={selectedRegion}
        trendResult={trendResult}
      />

      {/* Calculations Modal */}
      <CalculationsModal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
        trendResult={trendResult}
      />
    </div>
  );
};
