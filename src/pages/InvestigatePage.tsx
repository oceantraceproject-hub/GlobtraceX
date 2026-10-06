import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  GLOBAL_COUNTRIES,
  GlobalCountry,
  getCountryByCode,
  searchCountries,
  getCountriesByContinent,
} from '../data/globalCountries';
import {
  BANGLADESH_DIVISIONS,
  BANGLADESH_DISTRICTS,
  BangladeshDistrict,
} from '../data/bangladeshData';
import { NASA_DATASET_REGISTRY, NasaSourceRecord } from '../data/nasaRegistry';
import {
  computeCountryTrend,
  computeDeterministicTrend,
  generateCountryObservations,
  generateDistrictObservations,
  GlobalScientificResult,
  ScientificObservation,
} from '../compute/globTraceScience';
import { EarthExplorer } from '../components/EarthExplorer';
import { GoogleEarthMap } from '../components/GoogleEarthMap';
import { GlobTraceChart } from '../components/GlobTraceChart';
import { EvidenceDrawer } from '../components/EvidenceDrawer';
import { TrendAlertModal } from '../components/TrendAlertModal';
import {
  MapPin,
  Thermometer,
  CloudRain,
  Sprout,
  Waves,
  Sun,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  FileText,
  Activity,
  Globe,
  Search,
  GitCompare,
  CheckCircle2,
  Lock,
  Bell,
} from 'lucide-react';

interface InvestigatePageProps {
  onNavigate: (route: string) => void;
}

export const InvestigatePage: React.FC<InvestigatePageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  // Primary Geographic State: Global Country
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('BD');

  // Sub-district exploration for Bangladesh (Demonstration model)
  const [isDistrictMode, setIsDistrictMode] = useState<boolean>(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('coxs-bazar');

  // Scientific Variable & Chart Controls
  const [selectedVariable, setSelectedVariable] = useState<'lst' | 'rainfall' | 'ndvi' | 'tws' | 'solar'>('lst');
  const [useAnomalies, setUseAnomalies] = useState<boolean>(true);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState<boolean>(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [mapEngine, setMapEngine] = useState<'google' | 'globe'>('google');

  // Active country object
  const activeCountry: GlobalCountry = useMemo(() => {
    return getCountryByCode(selectedCountryCode) || GLOBAL_COUNTRIES[0];
  }, [selectedCountryCode]);

  // Countries filtered by continent and search query
  const filteredCountries = useMemo(() => {
    let list = getCountriesByContinent(selectedContinent);
    if (countrySearch.trim()) {
      const q = countrySearch.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.nameBn.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.code3.toLowerCase().includes(q) ||
          c.capital.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedContinent, countrySearch]);

  // Bangladesh district filtering (if in district mode)
  const filteredDistricts = useMemo(() => {
    if (selectedDivisionId === 'all') return BANGLADESH_DISTRICTS;
    return BANGLADESH_DISTRICTS.filter((d) => d.divisionId === selectedDivisionId);
  }, [selectedDivisionId]);

  const activeDistrict = useMemo(() => {
    return (
      BANGLADESH_DISTRICTS.find((d) => d.id === selectedDistrictId) ||
      filteredDistricts[0] ||
      BANGLADESH_DISTRICTS[0]
    );
  }, [selectedDistrictId, filteredDistricts]);

  // Active NASA dataset metadata
  const activeDataset: NasaSourceRecord = useMemo(() => {
    return (
      NASA_DATASET_REGISTRY.find((d) => d.variable === selectedVariable) ||
      NASA_DATASET_REGISTRY[0]
    );
  }, [selectedVariable]);

  // Deterministic scientific analysis result
  const scientificResult: GlobalScientificResult = useMemo(() => {
    if (isDistrictMode && activeCountry.code === 'BD') {
      return computeDeterministicTrend(activeDistrict.id, selectedVariable, useAnomalies);
    }
    return computeCountryTrend(activeCountry.code, selectedVariable);
  }, [isDistrictMode, activeCountry.code, activeDistrict.id, selectedVariable, useAnomalies]);

  // Monthly observations for chart
  const { observations } = useMemo<{ observations: ScientificObservation[] }>(() => {
    if (isDistrictMode && activeCountry.code === 'BD') {
      return generateDistrictObservations(activeDistrict.id, selectedVariable);
    }
    return generateCountryObservations(activeCountry.code, selectedVariable);
  }, [isDistrictMode, activeCountry.code, activeDistrict.id, selectedVariable]);

  // When switching country away from BD, exit district mode
  useEffect(() => {
    if (activeCountry.code !== 'BD') {
      setIsDistrictMode(false);
    }
  }, [activeCountry.code]);

  // 5 NASA Observational Variables
  const variableTabs = [
    {
      id: 'lst' as const,
      label: 'Land Surface Temp',
      units: '°C',
      icon: Thermometer,
      sensor: 'MODIS Terra (MOD11C3)',
      rate: activeCountry.trendLST > 0 ? `+${activeCountry.trendLST}°C/dec` : `${activeCountry.trendLST}°C/dec`,
    },
    {
      id: 'rainfall' as const,
      label: 'Precipitation / Rainfall',
      units: 'mm/mo',
      icon: CloudRain,
      sensor: 'GPM IMERG (v07B)',
      rate: activeCountry.trendRainfall > 0 ? `+${activeCountry.trendRainfall}%/dec` : `${activeCountry.trendRainfall}%/dec`,
    },
    {
      id: 'ndvi' as const,
      label: 'Vegetation Index',
      units: 'NDVI',
      icon: Sprout,
      sensor: 'MODIS (MOD13C2)',
      rate: activeCountry.trendNDVI > 0 ? `+${activeCountry.trendNDVI}%/dec` : `${activeCountry.trendNDVI}%/dec`,
    },
    {
      id: 'tws' as const,
      label: 'Water Storage Anomaly',
      units: 'cm EWT',
      icon: Waves,
      sensor: 'GRACE / GRACE-FO',
      rate: `${activeCountry.trendTWS} cm/dec`,
    },
    {
      id: 'solar' as const,
      label: 'Solar Irradiance',
      units: 'MJ/m²',
      icon: Sun,
      sensor: 'NASA POWER (GHI)',
      rate: '-0.6 MJ/dec',
    },
  ];

  return (
    <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen pb-16">
      {/* Top Bar: Mission Header & Variable Selector Strip */}
      <section className="bg-white border-b border-purple-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-[11px] font-semibold font-mono tracking-wider">
                <Globe className="w-3.5 h-3.5 text-purple-700" />
                <span>GLOBAL EARTH SYSTEM TREND INVESTIGATION LAB</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight truncate">
                {isDistrictMode ? `${activeDistrict.name} District` : activeCountry.name} • {scientificResult.variableName}
              </h1>
              <p className="text-xs text-slate-500 font-mono">
                {isDistrictMode
                  ? `Sub-national spatial model • ${activeDistrict.divisionName} Division, Bangladesh`
                  : `Spatially aggregated across ${activeCountry.areaSqKm.toLocaleString()} km² • ${activeCountry.region}, ${activeCountry.continent}`}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onNavigate('/compare')}
                className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold font-mono transition-colors flex items-center gap-1.5"
              >
                <GitCompare className="w-3.5 h-3.5 text-purple-700" />
                <span>Compare Countries</span>
              </button>

              <button
                onClick={() => setIsEvidenceDrawerOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t('evidence.viewEvidence')}</span>
              </button>
            </div>
          </div>

          {/* 5 NASA Variable Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {variableTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedVariable === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedVariable(tab.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-purple-900 text-white border-purple-900 shadow-md ring-2 ring-purple-600/30'
                      : 'bg-white text-slate-700 border-purple-100 hover:border-purple-300 hover:bg-purple-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-300' : 'text-purple-600'}`} />
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        isSelected ? 'bg-purple-800 text-purple-200' : 'bg-purple-50 text-purple-700'
                      }`}
                    >
                      {tab.units}
                    </span>
                  </div>
                  <div className="text-xs font-extrabold truncate">{tab.label}</div>
                  <div className={`text-[10px] font-mono truncate mt-0.5 ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>
                    {tab.sensor}
                  </div>
                  <div className={`text-[11px] font-mono font-bold mt-1 ${isSelected ? 'text-purple-300' : 'text-purple-700'}`}>
                    {tab.rate}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Workstation Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Geographic Country Registry & Administrative Filters (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Continent Filter Bar */}
            <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-purple-700 uppercase tracking-wider font-bold block">
                  CONTINENT SELECTION
                </label>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  {filteredCountries.length} countries
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['All', 'Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania'].map((cont) => (
                  <button
                    key={cont}
                    onClick={() => setSelectedContinent(cont)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedContinent === cont
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-purple-50 text-slate-700 hover:bg-purple-100'
                    }`}
                  >
                    {cont}
                  </button>
                ))}
              </div>

              {/* Country Search Bar */}
              <div className="relative pt-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-4" />
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Filter country by name or code..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-purple-100 bg-[#fafaff] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 font-mono"
                />
              </div>
            </div>

            {/* Country Registry Selection List */}
            <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                  AUTHORITATIVE COUNTRY REGISTRY
                </span>
                <span className="text-[10px] font-mono text-purple-700 font-bold">
                  {activeCountry.code3} • {activeCountry.region}
                </span>
              </div>

              <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                {filteredCountries.map((c) => {
                  const isCurrent = c.code === activeCountry.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => {
                        setSelectedCountryCode(c.code);
                        if (c.code !== 'BD') setIsDistrictMode(false);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-purple-900 border-purple-900 text-white shadow-xs'
                          : 'bg-[#fafaff] border-purple-100 text-slate-800 hover:bg-purple-50 hover:border-purple-200'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-extrabold flex items-center gap-1.5 truncate">
                          <span>{c.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono shrink-0 ${
                              isCurrent
                                ? 'bg-purple-800 text-purple-200 border border-purple-700'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {c.code}
                          </span>
                        </div>
                        <div className={`text-[10px] font-mono truncate ${isCurrent ? 'text-purple-200' : 'text-slate-500'}`}>
                          {c.region} • Cap: {c.capital}
                        </div>
                      </div>

                      <div className="text-right font-mono shrink-0">
                        <span className={`text-[11px] font-bold block ${isCurrent ? 'text-purple-200' : 'text-purple-700'}`}>
                          {selectedVariable === 'lst'
                            ? `+${c.trendLST}°C/dec`
                            : selectedVariable === 'rainfall'
                            ? `${c.trendRainfall}%/dec`
                            : selectedVariable === 'ndvi'
                            ? `${c.trendNDVI}%/dec`
                            : `${c.trendTWS} cm/dec`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bangladesh Sub-District Toggle & Selector (if Bangladesh is active) */}
            {activeCountry.code === 'BD' && (
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                    <span className="text-[11px] font-extrabold text-purple-950">
                      Bangladesh Sub-District Model
                    </span>
                  </div>
                  <button
                    onClick={() => setIsDistrictMode((prev) => !prev)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                      isDistrictMode
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-purple-800 border border-purple-300 hover:bg-purple-100'
                    }`}
                  >
                    {isDistrictMode ? 'Exit District View' : 'Explore 64 Districts'}
                  </button>
                </div>

                {isDistrictMode && (
                  <div className="space-y-3 pt-2">
                    {/* Division selector */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-purple-800 font-bold">DIVISION:</span>
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => setSelectedDivisionId('all')}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            selectedDivisionId === 'all'
                              ? 'bg-purple-700 text-white font-bold'
                              : 'bg-white text-slate-700 border border-purple-200'
                          }`}
                        >
                          All
                        </button>
                        {BANGLADESH_DIVISIONS.map((div) => (
                          <button
                            key={div.id}
                            onClick={() => setSelectedDivisionId(div.id)}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              selectedDivisionId === div.id
                                ? 'bg-purple-700 text-white font-bold'
                                : 'bg-white text-slate-700 border border-purple-200'
                            }`}
                          >
                            {div.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* District selector dropdown */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-purple-800 font-bold">SELECT DISTRICT:</span>
                      <select
                        value={activeDistrict.id}
                        onChange={(e) => setSelectedDistrictId(e.target.value)}
                        className="w-full p-2 rounded-xl bg-white border border-purple-200 text-xs font-bold text-slate-800 focus:outline-none font-mono"
                      >
                        {filteredDistricts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.divisionName}) • {d.isCoastal ? 'Coastal' : 'Inland'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* NASA Provenance Summary Card */}
            <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-purple-700 uppercase tracking-wider font-bold">
                  NASA DATASET IN USE
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  {activeDataset.data_readiness}
                </span>
              </div>

              <div className="font-extrabold text-slate-900 leading-snug break-words">
                {activeDataset.dataset_name}
              </div>

              <div className="text-[11px] font-mono text-slate-500 space-y-0.5">
                <div>Agency: <strong className="text-slate-700">{activeDataset.source_agency}</strong></div>
                <div>Product ID: <strong className="text-slate-700">{activeDataset.dataset_id}</strong></div>
                <div>Spatial Resolution: <strong className="text-slate-700">{activeDataset.spatial_resolution}</strong></div>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 text-[10px] font-mono text-purple-900 leading-tight">
                Derived from NASA dataset using GlobTraceX spatial aggregation.
              </div>

              <button
                onClick={() => setIsEvidenceDrawerOpen(true)}
                className="mt-2 w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Inspect Full Provenance Chain →</span>
              </button>
            </div>
          </div>

          {/* Center & Right Column: Interactive Google Maps / 3D Earth, Chart, and Scientific Evidence (8 cols) */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            {/* Map Engine Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-white border border-purple-100 shadow-xs">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-purple-50 border border-purple-200 text-xs font-mono">
                <button
                  onClick={() => setMapEngine('google')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    mapEngine === 'google'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-purple-900 hover:text-purple-700'
                  }`}
                >
                  Google Maps Live Layer
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

              <span className="text-[11px] font-mono text-slate-500 pr-2">
                Active Country: <strong className="text-slate-800">{activeCountry.name}</strong> • Variable: <strong className="text-purple-700 uppercase">{selectedVariable}</strong>
              </span>
            </div>

            {/* Map Canvas */}
            {mapEngine === 'google' ? (
              <GoogleEarthMap
                selectedCountryCode={activeCountry.code}
                onSelectCountry={(code) => setSelectedCountryCode(code)}
                activeVariable={selectedVariable}
                onVariableChange={(v) => {
                  if (v !== 'hot_humid') setSelectedVariable(v);
                }}
                heightClass="h-[460px] sm:h-[520px] lg:h-[560px]"
              />
            ) : (
              <EarthExplorer
                initialLevel={isDistrictMode ? 'district' : 'country'}
                selectedCountryCode={activeCountry.code}
                onSelectCountry={(code) => setSelectedCountryCode(code)}
                selectedDistrictId={activeDistrict.id}
                onSelectDistrict={(id) => setSelectedDistrictId(id)}
                activeVariable={selectedVariable}
                dataset={activeDataset}
                heightClass="h-[460px] sm:h-[520px] lg:h-[560px]"
                showInvestigationAction={false}
              />
            )}

            {/* Scientific Evidence Card: The Four Core Questions Results */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-5 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 pb-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-purple-700 font-bold block">
                    DETERMINISTIC STATISTICAL ASSESSMENT
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5 tracking-tight truncate">
                    {isDistrictMode ? activeDistrict.name : activeCountry.name} • {scientificResult.variableName}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAlertModalOpen(true)}
                    className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                    title="Subscribe to email alert when this parameter crosses threshold"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>Trend Alert</span>
                  </button>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                      scientificResult.trend.significant
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {scientificResult.trend.significant
                      ? t('stats.significant')
                      : t('stats.notSignificant')}
                  </span>
                </div>
              </div>

              {/* 4 Core Quantitative Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-[#fafaff] border border-purple-100 min-w-0">
                  <span className="text-[10px] text-slate-400 block font-sans truncate">THEIL-SEN SLOPE</span>
                  <span className="text-sm font-black text-purple-900 block mt-0.5 truncate">
                    {scientificResult.slope.valuePerDecade > 0 ? '+' : ''}
                    {scientificResult.slope.valuePerDecade} {scientificResult.slope.unit}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#fafaff] border border-purple-100 min-w-0">
                  <span className="text-[10px] text-slate-400 block font-sans truncate">95% CONFIDENCE INTERVAL</span>
                  <span className="text-sm font-black text-purple-900 block mt-0.5 truncate">
                    [{scientificResult.slope.ci_low}, {scientificResult.slope.ci_high}]
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#fafaff] border border-purple-100 min-w-0">
                  <span className="text-[10px] text-slate-400 block font-sans truncate">P-VALUE (MANN-KENDALL)</span>
                  <span
                    className={`text-sm font-black block mt-0.5 truncate ${
                      scientificResult.trend.significant ? 'text-emerald-700' : 'text-slate-600'
                    }`}
                  >
                    p {scientificResult.trend.p_value < 0.001 ? '< 0.001' : `= ${scientificResult.trend.p_value}`}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#fafaff] border border-purple-100 min-w-0">
                  <span className="text-[10px] text-slate-400 block font-sans truncate">DATA COVERAGE</span>
                  <span className="text-sm font-black text-purple-900 block mt-0.5 truncate">
                    {scientificResult.observations.validCount} / {scientificResult.observations.totalExpected} ({scientificResult.observations.coveragePct}%)
                  </span>
                </div>
              </div>

              {/* The Seven Core Scientific Questions Answered Directly */}
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2.5 text-xs">
                <div className="font-extrabold text-purple-900 font-['Space_Grotesk'] text-sm">
                  The Planetary Trend Questions Answered:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div>
                    <strong className="text-purple-900">1. What is changing?</strong> {scientificResult.variableName} ({scientificResult.units})
                  </div>
                  <div>
                    <strong className="text-purple-900">2. Where?</strong> {isDistrictMode ? `${activeDistrict.name} District, Bangladesh` : `${activeCountry.name} (${activeCountry.coordinates[1]}°N, ${activeCountry.coordinates[0]}°E)`}
                  </div>
                  <div>
                    <strong className="text-purple-900">3. How much?</strong> {scientificResult.slope.valuePerDecade > 0 ? '+' : ''}{scientificResult.slope.valuePerDecade} {scientificResult.slope.unit} ({scientificResult.magnitude.totalCumulativeChange > 0 ? '+' : ''}{scientificResult.magnitude.totalCumulativeChange} {scientificResult.units} cumulative change)
                  </div>
                  <div>
                    <strong className="text-purple-900">4. How strong?</strong> Mann-Kendall S = {scientificResult.trend.mannKendallS}, Z = {scientificResult.trend.mannKendallZ} (p {scientificResult.trend.p_value < 0.001 ? '< 0.001' : `= ${scientificResult.trend.p_value}`})
                  </div>
                  <div>
                    <strong className="text-purple-900">5. How consistent?</strong> {scientificResult.trendStability.stabilityCategory}: {scientificResult.trendStability.summaryDescription}
                  </div>
                  <div>
                    <strong className="text-purple-900">6. Provenance?</strong> {scientificResult.provenance.dataset_name} ({scientificResult.provenance.dataset_id}) via {scientificResult.provenance.source_agency}
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific Chart: 26-Year Observation Record & Theil-Sen Line */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-sm font-extrabold text-slate-900 font-['Space_Grotesk']">
                  26-Year Continuous Observation Time Series (2000–2026)
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    {useAnomalies ? 'Climatological Anomalies Displayed' : 'Raw Instrument Values'}
                  </span>
                </div>
              </div>

              <GlobTraceChart
                observations={observations}
                result={scientificResult}
                useAnomalies={useAnomalies}
                onToggleAnomaly={() => setUseAnomalies((prev) => !prev)}
                height={320}
              />
            </div>

            {/* Sub-Period Stability & Multi-Sensor Earth Change Fingerprint */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Multi-Sensor Co-occurring Fingerprint */}
              <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-3 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-purple-700 font-bold uppercase">
                    MULTI-SENSOR SIGNATURE
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">5 NASA Observables</span>
                </div>

                <h4 className="text-sm font-extrabold text-slate-900 font-['Space_Grotesk']">
                  Co-occurring Signals for {isDistrictMode ? activeDistrict.name : activeCountry.name}
                </h4>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-[#fafaff] border border-purple-100 flex justify-between items-center">
                    <span className="text-slate-600">Land Surface Warming (MODIS):</span>
                    <span className="font-bold text-purple-900">
                      +{scientificResult.trendFingerprint.lstWarmingRate}°C/dec
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#fafaff] border border-purple-100 flex justify-between items-center">
                    <span className="text-slate-600">Monsoon Rainfall Drift (GPM):</span>
                    <span className="font-bold text-purple-900">
                      {scientificResult.trendFingerprint.monsoonRainfallChangePct > 0 ? '+' : ''}
                      {scientificResult.trendFingerprint.monsoonRainfallChangePct}%/dec
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#fafaff] border border-purple-100 flex justify-between items-center">
                    <span className="text-slate-600">Vegetation Canopy (NDVI):</span>
                    <span className="font-bold text-purple-900">
                      {scientificResult.trendFingerprint.vegetationChangePct > 0 ? '+' : ''}
                      {scientificResult.trendFingerprint.vegetationChangePct}%/dec
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#fafaff] border border-purple-100 flex justify-between items-center">
                    <span className="text-slate-600">Water Storage Anomaly (GRACE):</span>
                    <span className="font-bold text-purple-900">
                      {scientificResult.trendFingerprint.waterStorageTrendCm} cm/dec
                    </span>
                  </div>
                </div>
              </div>

              {/* Trend Stability Diagnosis */}
              <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-3 flex flex-col justify-between min-w-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-purple-700 font-bold uppercase">
                      TEMPORAL STABILITY DECOMPOSITION
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                      {scientificResult.trendStability.stabilityCategory}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    {scientificResult.trendStability.subPeriods.map((sp) => (
                      <div key={sp.periodName} className="p-2 rounded-lg bg-[#fafaff] border border-purple-100 flex justify-between items-center text-[11px]">
                        <span className="text-slate-600">{sp.periodName}:</span>
                        <span className="font-bold text-purple-900">
                          {sp.slopePerDecade > 0 ? '+' : ''}{sp.slopePerDecade} {scientificResult.units}/dec (p={sp.p_value})
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {scientificResult.trendStability.summaryDescription}
                  </p>
                </div>

                {/* Mandated Scientific Disclaimer Box */}
                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/80 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Scientific Disclaimer:</strong> {scientificResult.trendSignalIndex.disclaimer}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-Over Evidence & Provenance Drawer */}
      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        result={scientificResult}
      />

      {/* Global Trend Alert Modal */}
      <TrendAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        defaultParameter={selectedVariable === 'solar' || selectedVariable === 'ndvi' ? 'lst' : selectedVariable}
        defaultRegionCode={activeCountry.code}
      />
    </div>
  );
};
