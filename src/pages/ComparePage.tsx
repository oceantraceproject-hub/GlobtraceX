import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BANGLADESH_DISTRICTS } from '../data/bangladeshData';
import { NASA_DATASET_REGISTRY } from '../data/nasaRegistry';
import { computeDeterministicTrend } from '../compute/globTraceScience';
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
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const { t } = useLanguage();

  const [regionAId, setRegionAId] = useState<string>('coxs-bazar');
  const [regionBId, setRegionBId] = useState<string>('satkhira');
  const [selectedVariable, setSelectedVariable] = useState<'lst' | 'rainfall' | 'ndvi' | 'tws' | 'solar'>('lst');

  const regionA = useMemo(() => {
    return BANGLADESH_DISTRICTS.find((d) => d.id === regionAId) || BANGLADESH_DISTRICTS[0];
  }, [regionAId]);

  const regionB = useMemo(() => {
    return BANGLADESH_DISTRICTS.find((d) => d.id === regionBId) || BANGLADESH_DISTRICTS[1];
  }, [regionBId]);

  const dataset = useMemo(() => {
    return NASA_DATASET_REGISTRY.find((d) => d.variable === selectedVariable) || NASA_DATASET_REGISTRY[0];
  }, [selectedVariable]);

  const resultA = useMemo(() => {
    return computeDeterministicTrend(regionA.id, selectedVariable, true);
  }, [regionA.id, selectedVariable]);

  const resultB = useMemo(() => {
    return computeDeterministicTrend(regionB.id, selectedVariable, true);
  }, [regionB.id, selectedVariable]);

  return (
    <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen py-10 font-['Manrope']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold font-mono w-fit mx-auto">
            <GitCompare className="w-3.5 h-3.5" />
            <span>TWO-DISTRICT STATISTICAL COMPARISON</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-['Space_Grotesk'] break-words">
            {t('compare.title')}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t('compare.subtitle')}
          </p>
        </div>

        {/* Synchronized Geographic 3D View */}
        <div className="bg-white p-2 sm:p-3 rounded-3xl border border-purple-100 shadow-sm">
          <EarthExplorer
            initialLevel="bangladesh"
            selectedDistrictId={regionA.id}
            onSelectDistrict={(id) => setRegionAId(id)}
            activeVariable={selectedVariable}
            dataset={dataset}
            heightClass="h-[380px] sm:h-[440px]"
            showInvestigationAction={false}
          />
        </div>

        {/* District Selectors Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Region A Selector */}
          <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-3 min-w-0">
            <span className="text-[10px] font-mono text-purple-700 font-bold uppercase tracking-wider block">
              {t('compare.selectRegionA')}
            </span>
            <select
              value={regionAId}
              onChange={(e) => setRegionAId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-extrabold bg-purple-50/50 text-slate-900 outline-none focus:ring-2 focus:ring-purple-600 font-mono"
            >
              {BANGLADESH_DISTRICTS.map((d) => (
                <option key={`a-${d.id}`} value={d.id}>
                  {d.name} District ({d.divisionName} Division)
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 font-mono truncate">
              Elevation: {regionA.elevationMeters}m MSL • {regionA.isCoastal ? 'Coastal Zone' : 'Inland Basin'}
            </p>
          </div>

          {/* Region B Selector */}
          <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-3 min-w-0">
            <span className="text-[10px] font-mono text-purple-700 font-bold uppercase tracking-wider block">
              {t('compare.selectRegionB')}
            </span>
            <select
              value={regionBId}
              onChange={(e) => setRegionBId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-extrabold bg-purple-50/50 text-slate-900 outline-none focus:ring-2 focus:ring-purple-600 font-mono"
            >
              {BANGLADESH_DISTRICTS.map((d) => (
                <option key={`b-${d.id}`} value={d.id}>
                  {d.name} District ({d.divisionName} Division)
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 font-mono truncate">
              Elevation: {regionB.elevationMeters}m MSL • {regionB.isCoastal ? 'Coastal Zone' : 'Inland Basin'}
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
                    REGION A ANALYSIS
                  </span>
                  <h3 className="text-xl font-black text-slate-900 font-['Space_Grotesk'] truncate">
                    {regionA.name}
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
                  <span className="text-slate-600">Valid Observations:</span>
                  <span className="font-bold text-purple-900">
                    {resultA.observations.validCount} / {resultA.observations.totalExpected} ({resultA.observations.coveragePct}%)
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
                    REGION B ANALYSIS
                  </span>
                  <h3 className="text-xl font-black text-slate-900 font-['Space_Grotesk'] truncate">
                    {regionB.name}
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
                  <span className="text-slate-600">Valid Observations:</span>
                  <span className="font-bold text-purple-900">
                    {resultB.observations.validCount} / {resultB.observations.totalExpected} ({resultB.observations.coveragePct}%)
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

        {/* Non-ranking Scientific Integrity Notice */}
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-slate-700 leading-relaxed max-w-2xl mx-auto text-center font-mono">
          <ShieldCheck className="w-4 h-4 text-purple-700 inline-block mr-1.5 -mt-0.5" />
          <span>
            GlobTraceX presents verifiable observational evidence side-by-side without automated artificial ranking. Climatological systems vary due to local orography, coastal ocean buffering, and hydrology.
          </span>
        </div>
      </div>
    </div>
  );
};
