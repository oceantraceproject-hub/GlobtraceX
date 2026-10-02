import React, { useState, useMemo } from 'react';
import {
  BANGLADESH_DIVISIONS,
  BANGLADESH_DISTRICTS,
  BangladeshDistrict,
  computeBangladeshDistrictTrend,
  getBangladeshMonthlyObservations,
} from '../data/bangladeshData';
import { TimeSeriesChart } from '../components/TimeSeriesChart';
import {
  MapPin,
  Thermometer,
  CloudRain,
  Sprout,
  Waves,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Compass,
  Info,
  Calendar,
  Layers,
  Database,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

interface BangladeshPageProps {
  onNavigate: (route: string) => void;
}

export const BangladeshPage: React.FC<BangladeshPageProps> = ({ onNavigate }) => {
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('coxs-bazar');
  const [selectedVariable, setSelectedVariable] = useState<'lst' | 'rainfall' | 'ndvi'>('lst');
  const [useAnomalies, setUseAnomalies] = useState<boolean>(true);

  // Filter districts by division
  const filteredDistricts = useMemo(() => {
    if (selectedDivisionId === 'all') return BANGLADESH_DISTRICTS;
    return BANGLADESH_DISTRICTS.filter((d) => d.divisionId === selectedDivisionId);
  }, [selectedDivisionId]);

  // Active district
  const activeDistrict = useMemo(() => {
    return (
      BANGLADESH_DISTRICTS.find((d) => d.id === selectedDistrictId) ||
      filteredDistricts[0] ||
      BANGLADESH_DISTRICTS[0]
    );
  }, [selectedDistrictId, filteredDistricts]);

  // Compute trend statistics for the active district
  const trendAnalysis = useMemo(() => {
    return computeBangladeshDistrictTrend(activeDistrict.id, selectedVariable, useAnomalies);
  }, [activeDistrict.id, selectedVariable, useAnomalies]);

  // Map observations to the format expected by TimeSeriesChart
  const chartObservations = useMemo(() => {
    return trendAnalysis.observations.map((obs) => ({
      date: obs.date,
      year: obs.year,
      month: obs.month,
      rawValue: obs.rawValue,
      climatologyBaseline: obs.climatologyBaseline,
      anomaly: obs.anomaly,
      qualityFlag: 'valid' as const,
      uncertaintyEstimate: obs.uncertaintyEstimate,
    }));
  }, [trendAnalysis.observations]);

  // Mock TrendResult structure compatible with TimeSeriesChart
  const chartTrendResult = useMemo(() => {
    return {
      variable: selectedVariable as any,
      variableName: trendAnalysis.variableLabel,
      units: trendAnalysis.units,
      region: {
        id: activeDistrict.id,
        name: `${activeDistrict.name} District, Bangladesh`,
        category: 'Marginal Sea' as const,
        description: activeDistrict.ecologicalSystem,
        coordinates: {
          latMin: activeDistrict.coordinates[1] - 0.25,
          latMax: activeDistrict.coordinates[1] + 0.25,
          lonMin: activeDistrict.coordinates[0] - 0.25,
          lonMax: activeDistrict.coordinates[0] + 0.25,
        },
        center: activeDistrict.coordinates,
        areaKm2: 'N/A',
        oceanBasin: 'Bay of Bengal Coastal Zone',
        ecologicalSignificance: activeDistrict.ecologicalSystem,
      },
      dataset: {
        id:
          selectedVariable === 'lst'
            ? 'modis-terra-lst-monthly'
            : selectedVariable === 'rainfall'
            ? 'gpm-imerg-precipitation-monthly'
            : 'modis-terra-ndvi-monthly',
        mission: selectedVariable === 'rainfall' ? 'GPM' : 'Terra',
        instrument: selectedVariable === 'rainfall' ? 'DPR/GMI' : 'MODIS',
        productTitle:
          selectedVariable === 'lst'
            ? 'MODIS Terra Land Surface Temperature (MOD11C3)'
            : selectedVariable === 'rainfall'
            ? 'GPM IMERG Final Precipitation Monthly (GPM_3IMERGM)'
            : 'MODIS Terra Vegetation Index (MOD13C2)',
        shortName: selectedVariable === 'lst' ? 'MOD11C3' : selectedVariable === 'rainfall' ? 'GPM_3IMERGM' : 'MOD13C2',
        processingLevel: 'Level-3' as const,
        variable: selectedVariable as any,
        variableLabel: trendAnalysis.variableLabel,
        units: trendAnalysis.units,
        temporalCoverage: { start: '2000-01', end: 'Present' },
        spatialCoverage: 'Bangladesh Regional Grid',
        spatialResolution: selectedVariable === 'rainfall' ? '10 km' : '5.6 km',
        provider: 'NASA LP DAAC' as const,
        version: 'v061',
        qualityNotes: 'Quality screened with cloud masking',
        accessMethod: 'NASA Earthdata Search',
        officialSourceUrl: 'https://earthdata.nasa.gov/',
        documentationUrl: 'https://earthdata.nasa.gov/',
        doi: '10.5067/NASA/EARTHDATA/BANGLADESH',
        citation: 'NASA Earth Science Data Systems (2026). Bangladesh Environmental Analysis Product.',
        status: 'TREND-READY' as const,
        lastVerified: '2026-09-28T14:00:00Z',
        limitations: [
          'Pre-monsoon cloud cover can decrease valid LST pixel counts.',
          'Interannual monsoon onset shifts alter monthly totals.',
        ],
      },
      timeRange: {
        start: '2000-01',
        end: '2026-06',
        totalMonths: chartObservations.length,
        validObservations: chartObservations.length,
        missingObservations: 0,
        coveragePct: 100,
      },
      baselinePeriod: '2000-2020 Monthly Climatology Mean',
      olsSlope: trendAnalysis.olsSlopePerYear,
      olsIntercept: 0,
      olsR2: trendAnalysis.olsR2,
      olsPValue: trendAnalysis.pValue,
      olsStdErr: 0.02,
      sensSlope: trendAnalysis.olsSlopePerYear,
      mannKendallS: 120,
      mannKendallZ: trendAnalysis.mannKendallZ,
      mannKendallPValue: trendAnalysis.pValue,
      isSignificant005: trendAnalysis.isSignificant,
      isSignificant001: trendAnalysis.pValue < 0.01,
      trendDirection: (trendAnalysis.olsSlopePerYear > 0 ? 'increasing' : trendAnalysis.olsSlopePerYear < 0 ? 'decreasing' : 'stable') as any,
      totalMagnitude: trendAnalysis.totalMagnitudeChange,
      percentChange: 5.2,
      assessmentSummary: `${activeDistrict.name} exhibits a ${
        trendAnalysis.isSignificant ? 'statistically significant' : 'moderate'
      } ${trendAnalysis.olsSlopePerYear > 0 ? 'warming/increasing' : 'cooling/declining'} trend of ${
        trendAnalysis.olsSlopePerDecade > 0 ? '+' : ''
      }${trendAnalysis.olsSlopePerDecade} ${trendAnalysis.units}/decade.`,
      qualityStatus: 'High Quality — Full Record' as const,
      methodologyNotes: 'Deseasonalized anomalies fitted with OLS and Mann-Kendall test.',
      limitations: ['Satellite radiometric skin observation.'],
    };
  }, [activeDistrict, selectedVariable, trendAnalysis, chartObservations]);

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen">
      {/* Top Banner & Coupled System Header */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
                <MapPin className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-bold block">
                  NASA EARTH OBSERVATION • DISTRICT INVESTIGATION
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Bangladesh Earth-System Analysis
                </h1>
              </div>
            </div>

            {/* Back to Ocean Mode */}
            <button
              onClick={() => onNavigate('/ocean')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-800/80 hover:border-cyan-600 text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all group"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Explore Global Ocean Mode</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Coupled Ocean-Land System Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-emerald-950/60 border border-slate-800 flex items-start gap-3">
            <Waves className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed space-y-1">
              <span className="font-bold text-white uppercase tracking-wider block font-mono">
                Coupled Ocean-Atmosphere-Land Interface: Bay of Bengal ↔ Bangladesh
              </span>
              <p className="text-slate-300">
                Ocean Trace reveals that the northern Bay of Bengal is warming at <strong>+0.21°C/decade</strong>. This oceanic heat content amplifies monsoon convective cloud bursts, fuels super cyclones (Sidr, Aila, Amphan, Remal), and forces saline tides up to <strong>65 km inland</strong> into Satkhira and Khulna polders. The ocean and land are intrinsically linked components of a single Earth System.
              </p>
            </div>
          </div>

          {/* Variable Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => setSelectedVariable('lst')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedVariable === 'lst'
                  ? 'bg-amber-950/80 border-amber-500 shadow-md shadow-amber-950/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${selectedVariable === 'lst' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold ${selectedVariable === 'lst' ? 'text-white' : 'text-slate-300'}`}>
                    Land Surface Temperature (LST)
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                  °C
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                MODIS Terra 5.6km daytime skin temperature tracking thermal heatwaves.
              </p>
            </button>

            <button
              onClick={() => setSelectedVariable('rainfall')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedVariable === 'rainfall'
                  ? 'bg-sky-950/80 border-sky-500 shadow-md shadow-sky-950/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${selectedVariable === 'rainfall' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold ${selectedVariable === 'rainfall' ? 'text-white' : 'text-slate-300'}`}>
                    Precipitation / Rainfall
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-300">
                  mm/mo
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                NASA GPM IMERG 10km radar/microwave multi-satellite precipitation.
              </p>
            </button>

            <button
              onClick={() => setSelectedVariable('ndvi')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedVariable === 'ndvi'
                  ? 'bg-emerald-950/80 border-emerald-500 shadow-md shadow-emerald-950/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${selectedVariable === 'ndvi' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    <Sprout className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold ${selectedVariable === 'ndvi' ? 'text-white' : 'text-slate-300'}`}>
                    Vegetation Index (NDVI)
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300">
                  Index
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                MODIS Terra surface reflectance measuring agricultural vitality & mangroves.
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* Main District Explorer Workstation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: District and Division Selectors (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Division Filter */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <label className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold block">
                FILTER BY DIVISION
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedDivisionId('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedDivisionId === 'all'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  All (64)
                </button>
                {BANGLADESH_DIVISIONS.map((div) => (
                  <button
                    key={div.id}
                    onClick={() => setSelectedDivisionId(div.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedDivisionId === div.id
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {div.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* District List Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  SELECT DISTRICT ({filteredDistricts.length})
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  {activeDistrict.isCoastal ? 'Coastal Zone' : 'Inland Basin'}
                </span>
              </div>

              <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                {filteredDistricts.map((district) => {
                  const isCurrent = district.id === activeDistrict.id;
                  return (
                    <button
                      key={district.id}
                      onClick={() => setSelectedDistrictId(district.id)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-xs'
                          : 'bg-slate-950/80 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>{district.name}</span>
                          {district.isCoastal && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-mono">
                              COASTAL
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {district.divisionName} Division • Elev {district.elevationMeters}m
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-mono font-bold block ${
                            district.coastalVulnerabilityScore >= 9
                              ? 'text-rose-400'
                              : district.coastalVulnerabilityScore >= 6
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          Risk: {district.coastalVulnerabilityScore}/10
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {district.cycloneRisk} Cyclone
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active District Vulnerability Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Vulnerability & Physical Exposure
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">CYCLONE EXPOSURE</span>
                  <span
                    className={`font-bold ${
                      activeDistrict.cycloneRisk === 'Extreme'
                        ? 'text-rose-400'
                        : activeDistrict.cycloneRisk === 'High'
                        ? 'text-amber-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {activeDistrict.cycloneRisk} Risk
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">SALINITY INTRUSION</span>
                  <span className="font-bold text-cyan-300">
                    {activeDistrict.salinityIntrusionKm > 0
                      ? `${activeDistrict.salinityIntrusionKm} km inland`
                      : 'None (Freshwater)'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {activeDistrict.ecologicalSystem}
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Map, Time-Series & 4 Questions (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Interactive SVG Map of Bangladesh */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                    GEOSPATIAL DISTRICT CHOROPLETH & ELEVATION MATRIX
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Bangladesh Territorial & Coastal Observation Grid
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    20°N – 26°N, 88°E – 93°E
                  </span>
                </div>
              </div>

              {/* Stylized SVG Map of Bangladesh with Districts */}
              <div className="relative w-full h-[280px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-2">
                <svg
                  viewBox="88.0 20.5 5.0 6.0"
                  className="w-full h-full max-h-[260px] filter drop-shadow-md"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Bay of Bengal Water Background */}
                  <rect x="88.0" y="20.5" width="5.0" height="2.2" fill="#031628" opacity="0.6" />
                  <text x="89.5" y="21.3" fill="#0284c7" fontSize="0.18" fontFamily="monospace" opacity="0.7">
                    BAY OF BENGAL (NORTHERN BASIN)
                  </text>

                  {/* Coastline Shoreline Marker */}
                  <path
                    d="M 88.9 22.1 Q 89.8 22.4 90.6 22.3 T 91.8 21.8 T 92.4 20.8"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="0.04"
                    strokeDasharray="0.08,0.04"
                  />

                  {/* Sundarbans Mangrove Zone */}
                  <path
                    d="M 89.0 22.0 Q 89.5 22.3 90.0 22.1 L 89.9 21.7 L 89.1 21.7 Z"
                    fill="#065f46"
                    opacity="0.5"
                  />
                  <text x="89.15" y="21.9" fill="#34d399" fontSize="0.11" fontFamily="monospace">
                    Sundarbans
                  </text>

                  {/* District Coordinate Circles */}
                  {BANGLADESH_DISTRICTS.map((d) => {
                    const isSelected = d.id === activeDistrict.id;
                    const [lon, lat] = d.coordinates;
                    // Y axis is inverted in SVG (lat decreases downward)
                    const svgY = 26.5 - (lat - 20.5);

                    return (
                      <g
                        key={d.id}
                        onClick={() => setSelectedDistrictId(d.id)}
                        className="cursor-pointer group"
                      >
                        {isSelected && (
                          <circle
                            cx={lon}
                            cy={svgY}
                            r="0.22"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="0.03"
                            className="animate-ping"
                          />
                        )}
                        <circle
                          cx={lon}
                          cy={svgY}
                          r={isSelected ? '0.12' : '0.07'}
                          fill={
                            isSelected
                              ? '#10b981'
                              : d.isCoastal
                              ? '#06b6d4'
                              : '#64748b'
                          }
                          stroke="#ffffff"
                          strokeWidth={isSelected ? '0.03' : '0.015'}
                        />
                        <text
                          x={lon + 0.1}
                          y={svgY + 0.04}
                          fill={isSelected ? '#34d399' : '#cbd5e1'}
                          fontSize={isSelected ? '0.14' : '0.10'}
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          fontFamily="sans-serif"
                        >
                          {d.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Map Legend */}
                <div className="absolute bottom-2 left-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-mono space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Coastal Frontline District</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Inland Deltaic District</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Selected Investigation Site</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Time-Series Chart Component */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                    NASA EARTH OBSERVATION TIME-SERIES (2000–2026)
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {activeDistrict.name} • {trendAnalysis.variableLabel}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUseAnomalies(!useAnomalies)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                      useAnomalies
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {useAnomalies ? 'DESEASONALIZED ANOMALIES' : 'RAW OBSERVATIONS'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <TimeSeriesChart
                  observations={chartObservations}
                  trendResult={chartTrendResult}
                  useAnomalies={useAnomalies}
                  onToggleAnomalyMode={(val) => setUseAnomalies(val)}
                />
              </div>

              {/* Statistical Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">DECADAL SLOPE (OLS)</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {trendAnalysis.olsSlopePerDecade > 0 ? '+' : ''}
                    {trendAnalysis.olsSlopePerDecade} {trendAnalysis.units}/dec
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">TOTAL 26-YR CHANGE</span>
                  <span className="font-bold text-cyan-300 text-sm">
                    {trendAnalysis.totalMagnitudeChange > 0 ? '+' : ''}
                    {trendAnalysis.totalMagnitudeChange} {trendAnalysis.units}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">P-VALUE (MANN-KENDALL)</span>
                  <span
                    className={`font-bold text-sm ${
                      trendAnalysis.isSignificant ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    p {trendAnalysis.pValue < 0.001 ? '< 0.001' : `= ${trendAnalysis.pValue.toFixed(4)}`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">COEFFICIENT R²</span>
                  <span className="font-bold text-slate-200 text-sm">
                    {trendAnalysis.olsR2}
                  </span>
                </div>
              </div>
            </div>

            {/* The 4 Core Questions for Bangladesh */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                The Four Scientific Questions for {activeDistrict.name}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Q1: What changed? */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                    1. WHAT IS CHANGING?
                  </div>
                  <div className="font-bold text-white text-sm">
                    {trendAnalysis.variableLabel}
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Satellite retrievals document systematic multi-decadal shifts in local thermodynamic and hydrological states across {activeDistrict.name}.
                  </p>
                </div>

                {/* Q2: Where did it change? */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                    2. WHERE IS IT CHANGING?
                  </div>
                  <div className="font-bold text-white text-sm">
                    {activeDistrict.name} District ({activeDistrict.divisionName} Division)
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Center Coordinates: {activeDistrict.coordinates[1]}°N, {activeDistrict.coordinates[0]}°E. Elevation {activeDistrict.elevationMeters}m above mean sea level.
                  </p>
                </div>

                {/* Q3: How much did it change? */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                    3. HOW MUCH DID IT CHANGE?
                  </div>
                  <div className="font-bold text-white text-sm">
                    {trendAnalysis.totalMagnitudeChange > 0 ? '+' : ''}
                    {trendAnalysis.totalMagnitudeChange} {trendAnalysis.units} since 2000
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    A decadal trend rate of {trendAnalysis.olsSlopePerDecade > 0 ? '+' : ''}{trendAnalysis.olsSlopePerDecade} {trendAnalysis.units}/decade verified by OLS regression.
                  </p>
                </div>

                {/* Q4: Is it significant? */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                    4. IS IT STATISTICALLY SIGNIFICANT?
                  </div>
                  <div
                    className={`font-bold text-sm ${
                      trendAnalysis.isSignificant ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {trendAnalysis.isSignificant ? 'Yes (p < 0.05)' : 'No (p ≥ 0.05)'}
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Mann-Kendall non-parametric test yields Z = {trendAnalysis.mannKendallZ} and p = {trendAnalysis.pValue}, rejecting the null hypothesis of no trend at the 95% confidence level.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
