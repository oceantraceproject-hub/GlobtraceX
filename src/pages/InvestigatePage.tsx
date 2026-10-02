import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  BANGLADESH_DIVISIONS,
  BANGLADESH_DISTRICTS,
  BangladeshDistrict,
} from '../data/bangladeshData';
import { NASA_DATASET_REGISTRY, NasaSourceRecord } from '../data/nasaRegistry';
import {
  computeDeterministicTrend,
  generateDistrictObservations,
  StructuredScientificResult,
} from '../compute/globTraceScience';
import { EarthExplorer, GeoLevel } from '../components/EarthExplorer';
import { GlobTraceChart } from '../components/GlobTraceChart';
import { EvidenceDrawer } from '../components/EvidenceDrawer';
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
} from 'lucide-react';

interface InvestigatePageProps {
  onNavigate: (route: string) => void;
}

export const InvestigatePage: React.FC<InvestigatePageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('coxs-bazar');
  const [selectedVariable, setSelectedVariable] = useState<'lst' | 'rainfall' | 'ndvi' | 'tws' | 'solar'>('lst');
  const [useAnomalies, setUseAnomalies] = useState<boolean>(true);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState<boolean>(false);

  // Filter districts by division
  const filteredDistricts = useMemo(() => {
    if (selectedDivisionId === 'all') return BANGLADESH_DISTRICTS;
    return BANGLADESH_DISTRICTS.filter((d) => d.divisionId === selectedDivisionId);
  }, [selectedDivisionId]);

  // Selected district record
  const selectedDistrict = useMemo(() => {
    return (
      BANGLADESH_DISTRICTS.find((d) => d.id === selectedDistrictId) ||
      filteredDistricts[0] ||
      BANGLADESH_DISTRICTS[0]
    );
  }, [selectedDistrictId, filteredDistricts]);

  // Active NASA dataset
  const activeDataset: NasaSourceRecord = useMemo(() => {
    return (
      NASA_DATASET_REGISTRY.find((d) => d.variable === selectedVariable) ||
      NASA_DATASET_REGISTRY[0]
    );
  }, [selectedVariable]);

  // Deterministic scientific analysis result
  const scientificResult: StructuredScientificResult = useMemo(() => {
    return computeDeterministicTrend(selectedDistrict.id, selectedVariable, useAnomalies);
  }, [selectedDistrict.id, selectedVariable, useAnomalies]);

  // Monthly observations for chart
  const { observations } = useMemo(() => {
    return generateDistrictObservations(selectedDistrict.id, selectedVariable);
  }, [selectedDistrict.id, selectedVariable]);

  // Variable tabs
  const variableTabs = [
    {
      id: 'lst' as const,
      label: 'Land Surface Temp',
      units: '°C',
      icon: Thermometer,
      sensor: 'MODIS Terra (MOD11C3)',
    },
    {
      id: 'rainfall' as const,
      label: 'Monthly Rainfall',
      units: 'mm/mo',
      icon: CloudRain,
      sensor: 'GPM IMERG (v07B)',
    },
    {
      id: 'ndvi' as const,
      label: 'Vegetation (NDVI)',
      units: 'Index',
      icon: Sprout,
      sensor: 'MODIS / VIIRS (v061)',
    },
    {
      id: 'tws' as const,
      label: 'Water Storage (TWS)',
      units: 'cm-EWT',
      icon: Waves,
      sensor: 'GRACE / GRACE-FO (RL06M)',
    },
    {
      id: 'solar' as const,
      label: 'Solar Radiation',
      units: 'MJ/m²',
      icon: Sun,
      sensor: 'NASA POWER (MERRA-2)',
    },
  ];

  return (
    <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen pb-16 font-['Manrope']">
      {/* Top Header & Context Controls */}
      <section className="bg-white border-b border-purple-100 pt-6 pb-5 px-4 sm:px-6 lg:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                <MapPin className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono tracking-widest uppercase text-purple-700 font-bold block truncate">
                  GLOBTRACEX • SCIENTIFIC INVESTIGATION WORKSTATION
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-['Space_Grotesk'] truncate">
                  {selectedDistrict.name} District, {selectedDistrict.divisionName} Division
                </h1>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/compare')}
                className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Compare Regions</span>
                <ArrowRight className="w-3.5 h-3.5" />
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

          {/* Variable Selector Tabs */}
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
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Workstation Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: District & Administrative Selectors (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Division Filter */}
            <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-2">
              <label className="text-[10px] font-mono text-purple-700 uppercase tracking-wider font-bold block">
                ADMINISTRATIVE DIVISION
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedDivisionId('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedDivisionId === 'all'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-purple-50 text-slate-700 hover:bg-purple-100'
                  }`}
                >
                  All (16+)
                </button>
                {BANGLADESH_DIVISIONS.map((div) => (
                  <button
                    key={div.id}
                    onClick={() => setSelectedDivisionId(div.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedDivisionId === div.id
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-purple-50 text-slate-700 hover:bg-purple-100'
                    }`}
                  >
                    {div.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* District Selection List */}
            <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                  GEOGRAPHIC DISTRICTS ({filteredDistricts.length})
                </span>
                <span className="text-[10px] font-mono text-purple-700 font-bold">
                  {selectedDistrict.isCoastal ? 'Coastal Polygon' : 'Inland Basin'}
                </span>
              </div>

              <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                {filteredDistricts.map((d) => {
                  const isCurrent = d.id === selectedDistrict.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDistrictId(d.id)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-purple-900 border-purple-900 text-white shadow-xs'
                          : 'bg-[#fafaff] border-purple-100 text-slate-800 hover:bg-purple-50 hover:border-purple-200'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-extrabold flex items-center gap-1.5 font-['Space_Grotesk'] truncate">
                          <span>{d.name}</span>
                          {d.isCoastal && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono shrink-0 ${
                                isCurrent
                                  ? 'bg-purple-800 text-purple-200 border border-purple-700'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}
                            >
                              COASTAL
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] font-mono truncate ${isCurrent ? 'text-purple-200' : 'text-slate-500'}`}>
                          {d.divisionName} Division • Elev {d.elevationMeters}m
                        </div>
                      </div>

                      <div className="text-right font-mono shrink-0">
                        <span className={`text-[11px] font-bold block ${isCurrent ? 'text-purple-200' : 'text-purple-700'}`}>
                          {selectedVariable === 'lst'
                            ? `+${d.lstTrendPerDecade_C}°C`
                            : selectedVariable === 'rainfall'
                            ? `${d.annualRainfall_mm}mm`
                            : `${d.meanNDVI} NDVI`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

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
                <div>Resolution: <strong className="text-slate-700">{activeDataset.spatial_resolution}</strong></div>
              </div>

              <button
                onClick={() => setIsEvidenceDrawerOpen(true)}
                className="mt-2 w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Inspect Full Provenance Chain →</span>
              </button>
            </div>
          </div>

          {/* Center & Right Column: Large Geographic Visualization, Evidence & Chart (8 cols) */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            {/* Unified Geographic Engine: EarthExplorer */}
            <EarthExplorer
              initialLevel="bangladesh"
              selectedDistrictId={selectedDistrict.id}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
              activeVariable={selectedVariable}
              dataset={activeDataset}
              heightClass="h-[480px] sm:h-[540px] lg:h-[580px]"
              showInvestigationAction={false}
            />

            {/* Scientific Evidence Card: The Four Questions Results */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-5 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 pb-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-purple-700 font-bold block">
                    DETERMINISTIC STATISTICAL ASSESSMENT
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5 font-['Space_Grotesk'] truncate">
                    {selectedDistrict.name} • {scientificResult.variableName}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
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
                  <span className="text-[10px] text-slate-400 block font-sans truncate">VALID OBSERVATIONS</span>
                  <span className="text-sm font-black text-purple-900 block mt-0.5 truncate">
                    {scientificResult.observations.validCount} / {scientificResult.observations.totalExpected} ({scientificResult.observations.coveragePct}%)
                  </span>
                </div>
              </div>

              {/* Four Scientific Questions Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 text-xs">
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5 min-w-0">
                  <span className="text-[10px] font-mono text-purple-700 font-bold uppercase block">
                    1. WHAT IS CHANGING?
                  </span>
                  <div className="font-extrabold text-slate-900 font-['Space_Grotesk']">
                    {scientificResult.variableName} ({scientificResult.units})
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Observed trajectory: <strong>{scientificResult.trend.direction.toUpperCase()}</strong> with a total cumulative shift of{' '}
                    <strong>{scientificResult.magnitude.totalCumulativeChange > 0 ? '+' : ''}{scientificResult.magnitude.totalCumulativeChange} {scientificResult.units}</strong> over the analysis period.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5 min-w-0">
                  <span className="text-[10px] font-mono text-purple-700 font-bold uppercase block">
                    2. WHERE IS IT CHANGING?
                  </span>
                  <div className="font-extrabold text-slate-900 font-['Space_Grotesk']">
                    {selectedDistrict.name} District, {selectedDistrict.divisionName} Division
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Coordinates: {selectedDistrict.coordinates[1]}°N, {selectedDistrict.coordinates[0]}°E. Elevation: {selectedDistrict.elevationMeters}m MSL.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5 min-w-0">
                  <span className="text-[10px] font-mono text-purple-700 font-bold uppercase block">
                    3. HOW MUCH IS IT CHANGING?
                  </span>
                  <div className="font-extrabold text-slate-900 font-['Space_Grotesk']">
                    {scientificResult.slope.valuePerDecade > 0 ? '+' : ''}{scientificResult.slope.valuePerDecade} {scientificResult.slope.unit}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    The non-parametric median rate establishes a decadal trend of {scientificResult.slope.valuePerDecade} {scientificResult.units}/decade.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5 min-w-0">
                  <span className="text-[10px] font-mono text-purple-700 font-bold uppercase block">
                    4. IS THE CHANGE SIGNIFICANT?
                  </span>
                  <div className="font-extrabold text-slate-900 font-['Space_Grotesk']">
                    {scientificResult.trend.significant ? 'Statistically Significant (p < 0.05)' : 'Not Distinguishable from Random Variability'}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Mann-Kendall test yields standardized Z = {scientificResult.trend.mannKendallZ} and two-tailed p = {scientificResult.trend.p_value}.
                  </p>
                </div>
              </div>
            </div>

            {/* Time-Series Chart Component */}
            <GlobTraceChart
              observations={observations}
              result={scientificResult}
              useAnomalies={useAnomalies}
              onToggleAnomaly={() => setUseAnomalies(!useAnomalies)}
            />

            {/* Trend Fingerprint & Trend Signal Index (TSI) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trend Fingerprint Card */}
              <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-3 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-purple-700 font-bold uppercase">
                    MULTI-SIGNAL TREND FINGERPRINT
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">4 Independent NASA Observables</span>
                </div>

                <h4 className="text-sm font-extrabold text-slate-900 font-['Space_Grotesk']">
                  Co-occurring Signals for {selectedDistrict.name}
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

              {/* Trend Signal Index (TSI) with Mandated Scientific Disclaimer */}
              <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-3 flex flex-col justify-between min-w-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-purple-700 font-bold uppercase">
                      ANALYTICAL COMPOSITE INDEX
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                      {scientificResult.trendSignalIndex.label}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900 font-['Space_Grotesk']">
                    Trend Signal Index (TSI): <span className="text-purple-700 font-mono text-base font-black">{scientificResult.trendSignalIndex.score > 0 ? '+' : ''}{scientificResult.trendSignalIndex.score}</span>
                  </h4>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(10, ((scientificResult.trendSignalIndex.score + 1) / 2) * 100))}%` }}
                    />
                  </div>
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
    </div>
  );
};
