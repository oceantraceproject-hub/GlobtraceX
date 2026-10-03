import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { GLOBAL_COUNTRIES, GlobalCountry, getCountryByCode } from '../data/globalCountries';
import { BANGLADESH_DISTRICTS } from '../data/bangladeshData';
import { NASA_DATASET_REGISTRY } from '../data/nasaRegistry';
import { computeCountryTrend, computeDeterministicTrend, GlobalScientificResult } from '../compute/globTraceScience';
import { EarthExplorer } from '../components/EarthExplorer';
import {
  GitCompare,
  MapPin,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Layers,
  Globe,
  Sparkles,
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const { t } = useLanguage();

  // Mode: Country-vs-Country or District-vs-District
  const [comparisonMode, setComparisonMode] = useState<'countries' | 'districts'>('countries');

  // Country Selection (Default: Bangladesh vs India)
  const [countryACode, setCountryACode] = useState<string>('BD');
  const [countryBCode, setCountryBCode] = useState<string>('IN');

  // District Selection (For Bangladesh sub-model)
  const [districtAId, setDistrictAId] = useState<string>('coxs-bazar');
  const [districtBId, setDistrictBId] = useState<string>('satkhira');

  const [selectedVariable, setSelectedVariable] = useState<'lst' | 'rainfall' | 'ndvi' | 'tws' | 'solar'>('lst');

  // Objects
  const countryA = useMemo(() => getCountryByCode(countryACode) || GLOBAL_COUNTRIES[0], [countryACode]);
  const countryB = useMemo(() => getCountryByCode(countryBCode) || GLOBAL_COUNTRIES[1], [countryBCode]);

  const districtA = useMemo(() => BANGLADESH_DISTRICTS.find((d) => d.id === districtAId) || BANGLADESH_DISTRICTS[0], [districtAId]);
  const districtB = useMemo(() => BANGLADESH_DISTRICTS.find((d) => d.id === districtBId) || BANGLADESH_DISTRICTS[1], [districtBId]);

  const dataset = useMemo(() => {
    return NASA_DATASET_REGISTRY.find((d) => d.variable === selectedVariable) || NASA_DATASET_REGISTRY[0];
  }, [selectedVariable]);

  // Calculations
  const resultA: GlobalScientificResult = useMemo(() => {
    if (comparisonMode === 'districts') {
      return computeDeterministicTrend(districtA.id, selectedVariable, true);
    }
    return computeCountryTrend(countryA.code, selectedVariable);
  }, [comparisonMode, districtA.id, countryA.code, selectedVariable]);

  const resultB: GlobalScientificResult = useMemo(() => {
    if (comparisonMode === 'districts') {
      return computeDeterministicTrend(districtB.id, selectedVariable, true);
    }
    return computeCountryTrend(countryB.code, selectedVariable);
  }, [comparisonMode, districtB.id, countryB.code, selectedVariable]);

  // Featured Comparison Presets
  const presets = [
    { label: 'Bangladesh vs India', a: 'BD', b: 'IN' },
    { label: 'Germany vs France', a: 'DE', b: 'FR' },
    { label: 'United States vs Canada', a: 'US', b: 'CA' },
    { label: 'Australia vs Brazil', a: 'AU', b: 'BR' },
    { label: 'Kenya vs Egypt', a: 'KE', b: 'EG' },
    { label: 'Saudi Arabia vs UAE', a: 'SA', b: 'AE' },
  ];

  return (
    <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen py-10 font-['Manrope']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold font-mono w-fit mx-auto">
            <GitCompare className="w-3.5 h-3.5 text-purple-700" />
            <span>GLOBAL DUAL-ENTITY STATISTICAL COMPARISON</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight font-['Space_Grotesk'] break-words">
            {t('compare.title')}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-sans">
            {t('compare.subtitle')}
          </p>

          {/* Mode Switcher: Countries vs Districts */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setComparisonMode('countries')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                comparisonMode === 'countries'
                  ? 'bg-purple-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-purple-200 hover:bg-purple-50'
              }`}
            >
              Country vs Country (Global)
            </button>
            <button
              onClick={() => setComparisonMode('districts')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                comparisonMode === 'districts'
                  ? 'bg-purple-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-purple-200 hover:bg-purple-50'
              }`}
            >
              District vs District (Bangladesh)
            </button>
          </div>
        </div>

        {/* Comparison Presets (for Country mode) */}
        {comparisonMode === 'countries' && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
            <span className="text-slate-400 font-bold uppercase text-[10px]">PRESETS:</span>
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setCountryACode(p.a);
                  setCountryBCode(p.b);
                }}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  countryACode === p.a && countryBCode === p.b
                    ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold'
                    : 'bg-white text-slate-700 border-purple-100 hover:bg-purple-50 hover:border-purple-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Synchronized Geographic 3D View */}
        <div className="bg-white p-2 sm:p-3 rounded-3xl border border-purple-100 shadow-sm">
          <EarthExplorer
            initialLevel={comparisonMode === 'districts' ? 'district' : 'country'}
            selectedCountryCode={countryA.code}
            comparisonCountryCode={comparisonMode === 'countries' ? countryB.code : undefined}
            onSelectCountry={(c) => setCountryACode(c)}
            selectedDistrictId={districtA.id}
            onSelectDistrict={(id) => setDistrictAId(id)}
            activeVariable={selectedVariable}
            dataset={dataset}
            heightClass="h-[380px] sm:h-[440px]"
            showInvestigationAction={false}
          />
        </div>

        {/* Dual Entity Selectors Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Entity A Selector */}
          <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-3 min-w-0">
            <span className="text-[10px] font-mono text-purple-700 font-bold uppercase tracking-wider block">
              {comparisonMode === 'countries' ? 'SELECT PRIMARY COUNTRY (A)' : t('compare.selectRegionA')}
            </span>

            {comparisonMode === 'countries' ? (
              <select
                value={countryACode}
                onChange={(e) => setCountryACode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-extrabold bg-purple-50/50 text-slate-900 outline-none focus:ring-2 focus:ring-purple-600 font-mono"
              >
                {GLOBAL_COUNTRIES.map((c) => (
                  <option key={`a-${c.code}`} value={c.code}>
                    {c.name} ({c.code3}) • {c.region}, {c.continent}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={districtAId}
                onChange={(e) => setDistrictAId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-extrabold bg-purple-50/50 text-slate-900 outline-none focus:ring-2 focus:ring-purple-600 font-mono"
              >
                {BANGLADESH_DISTRICTS.map((d) => (
                  <option key={`a-${d.id}`} value={d.id}>
                    {d.name} District ({d.divisionName} Division)
                  </option>
                ))}
              </select>
            )}

            <p className="text-xs text-slate-500 font-mono truncate">
              {comparisonMode === 'countries'
                ? `Area: ${countryA.areaSqKm.toLocaleString()} km² • Capital: ${countryA.capital} • Coordinates: ${countryA.coordinates[1]}°N, ${countryA.coordinates[0]}°E`
                : `Elevation: ${districtA.elevationMeters}m MSL • ${districtA.isCoastal ? 'Coastal Delta' : 'Inland Basin'}`}
            </p>
          </div>

          {/* Entity B Selector */}
          <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-3 min-w-0">
            <span className="text-[10px] font-mono text-purple-700 font-bold uppercase tracking-wider block">
              {comparisonMode === 'countries' ? 'SELECT COMPARISON COUNTRY (B)' : t('compare.selectRegionB')}
            </span>

            {comparisonMode === 'countries' ? (
              <select
                value={countryBCode}
                onChange={(e) => setCountryBCode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-extrabold bg-purple-50/50 text-slate-900 outline-none focus:ring-2 focus:ring-purple-600 font-mono"
              >
                {GLOBAL_COUNTRIES.map((c) => (
                  <option key={`b-${c.code}`} value={c.code}>
                    {c.name} ({c.code3}) • {c.region}, {c.continent}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={districtBId}
                onChange={(e) => setDistrictBId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-extrabold bg-purple-50/50 text-slate-900 outline-none focus:ring-2 focus:ring-purple-600 font-mono"
              >
                {BANGLADESH_DISTRICTS.map((d) => (
                  <option key={`b-${d.id}`} value={d.id}>
                    {d.name} District ({d.divisionName} Division)
                  </option>
                ))}
              </select>
            )}

            <p className="text-xs text-slate-500 font-mono truncate">
              {comparisonMode === 'countries'
                ? `Area: ${countryB.areaSqKm.toLocaleString()} km² • Capital: ${countryB.capital} • Coordinates: ${countryB.coordinates[1]}°N, ${countryB.coordinates[0]}°E`
                : `Elevation: ${districtB.elevationMeters}m MSL • ${districtB.isCoastal ? 'Coastal Delta' : 'Inland Basin'}`}
            </p>
          </div>
        </div>

        {/* Variable Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {(['lst', 'rainfall', 'ndvi', 'tws', 'solar'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setSelectedVariable(v)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                selectedVariable === v
                  ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                  : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-50'
              }`}
            >
              {v.toUpperCase()} ({dataset.variable === v ? dataset.units : ''})
            </button>
          ))}
        </div>

        {/* Side-by-Side Quantitative Evidence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card A */}
          <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-4 min-w-0 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-mono text-purple-700 font-bold uppercase block truncate">
                    PRIMARY ENTITY (A)
                  </span>
                  <h3 className="text-xl font-black text-slate-900 font-['Space_Grotesk'] truncate">
                    {comparisonMode === 'countries' ? countryA.name : districtA.name}
                  </h3>
                </div>
                <span
                  className={`text-xs font-mono px-2.5 py-1 rounded-full font-bold shrink-0 ${
                    resultA.trend.significant
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {resultA.trend.significant ? 'Significant (p < 0.05)' : 'Not Significant'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex justify-between items-center">
                  <span className="text-slate-600">Theil-Sen Slope:</span>
                  <span className="font-bold text-purple-900">
                    {resultA.slope.valuePerDecade > 0 ? '+' : ''}{resultA.slope.valuePerDecade} {resultA.slope.unit}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex justify-between items-center">
                  <span className="text-slate-600">95% Confidence Interval:</span>
                  <span className="font-bold text-purple-900">
                    [{resultA.slope.ci_low}, {resultA.slope.ci_high}]
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex justify-between items-center">
                  <span className="text-slate-600">Mann-Kendall p-value:</span>
                  <span className="font-bold text-purple-900">
                    p {resultA.trend.p_value < 0.001 ? '< 0.001' : `= ${resultA.trend.p_value}`}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex justify-between items-center">
                  <span className="text-slate-600">Data Coverage:</span>
                  <span className="font-bold text-purple-900">
                    {resultA.observations.validCount} / {resultA.observations.totalExpected} ({resultA.observations.coveragePct}%)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex justify-between items-center">
                  <span className="text-slate-600">Temporal Stability:</span>
                  <span className="font-bold text-purple-900 truncate ml-2">
                    {resultA.trendStability.stabilityCategory}
                  </span>
                </div>
              </div>
            </div>

            {/* Fingerprint for A */}
            <div className="pt-4 border-t border-purple-100 space-y-1.5 text-xs">
              <span className="text-[10px] font-mono text-purple-700 font-bold uppercase block">
                MULTI-SIGNAL FINGERPRINT
              </span>
              <div className="text-[11px] font-mono text-slate-600 space-y-1">
                <div>MODIS LST: <strong>+{resultA.trendFingerprint.lstWarmingRate}°C/dec</strong></div>
                <div>GPM Rainfall: <strong>{resultA.trendFingerprint.monsoonRainfallChangePct}%/dec</strong></div>
                <div>MODIS NDVI: <strong>{resultA.trendFingerprint.vegetationChangePct}%/dec</strong></div>
                <div>GRACE TWS: <strong>{resultA.trendFingerprint.waterStorageTrendCm} cm/dec</strong></div>
              </div>
            </div>
          </div>

          {/* Card B */}
          <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-4 min-w-0 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-mono text-purple-700 font-bold uppercase block truncate">
                    COMPARISON ENTITY (B)
                  </span>
                  <h3 className="text-xl font-black text-slate-900 font-['Space_Grotesk'] truncate">
                    {comparisonMode === 'countries' ? countryB.name : districtB.name}
                  </h3>
                </div>
                <span
                  className={`text-xs font-mono px-2.5 py-1 rounded-full font-bold shrink-0 ${
                    resultB.trend.significant
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {resultB.trend.significant ? 'Significant (p < 0.05)' : 'Not Significant'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex justify-between items-center">
                  <span className="text-slate-600">Theil-Sen Slope:</span>
                  <span className="font-bold text-purple-900">
                    {resultB.slope.valuePerDecade > 0 ? '+' : ''}{resultB.slope.valuePerDecade} {resultB.slope.unit}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex justify-between items-center">
                  <span className="text-slate-600">95% Confidence Interval:</span>
                  <span className="font-bold text-purple-900">
                    [{resultB.slope.ci_low}, {resultB.slope.ci_high}]
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex justify-between items-center">
                  <span className="text-slate-600">Mann-Kendall p-value:</span>
                  <span className="font-bold text-purple-900">
                    p {resultB.trend.p_value < 0.001 ? '< 0.001' : `= ${resultB.trend.p_value}`}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex justify-between items-center">
                  <span className="text-slate-600">Data Coverage:</span>
                  <span className="font-bold text-purple-900">
                    {resultB.observations.validCount} / {resultB.observations.totalExpected} ({resultB.observations.coveragePct}%)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex justify-between items-center">
                  <span className="text-slate-600">Temporal Stability:</span>
                  <span className="font-bold text-purple-900 truncate ml-2">
                    {resultB.trendStability.stabilityCategory}
                  </span>
                </div>
              </div>
            </div>

            {/* Fingerprint for B */}
            <div className="pt-4 border-t border-purple-100 space-y-1.5 text-xs">
              <span className="text-[10px] font-mono text-purple-700 font-bold uppercase block">
                MULTI-SIGNAL FINGERPRINT
              </span>
              <div className="text-[11px] font-mono text-slate-600 space-y-1">
                <div>MODIS LST: <strong>+{resultB.trendFingerprint.lstWarmingRate}°C/dec</strong></div>
                <div>GPM Rainfall: <strong>{resultB.trendFingerprint.monsoonRainfallChangePct}%/dec</strong></div>
                <div>MODIS NDVI: <strong>{resultB.trendFingerprint.vegetationChangePct}%/dec</strong></div>
                <div>GRACE TWS: <strong>{resultB.trendFingerprint.waterStorageTrendCm} cm/dec</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Spatial Aggregation & Scientific Integrity Notice */}
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-slate-700 leading-relaxed max-w-3xl mx-auto text-center font-mono space-y-1">
          <div className="flex items-center justify-center gap-1.5 font-bold text-purple-900">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            <span>STATISTICAL PROVENANCE & REPRODUCIBILITY GUARANTEE</span>
          </div>
          <p className="text-[11px] text-slate-600 font-sans">
            Every derived country-level result is: <em>Derived from NASA dataset using GlobTraceX spatial aggregation.</em> GlobTraceX presents verifiable observational evidence side-by-side without automated artificial ranking or unsupported climate-risk forecasts.
          </p>
        </div>
      </div>
    </div>
  );
};
