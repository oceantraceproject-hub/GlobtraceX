import React, { useState, useEffect, useMemo } from 'react';
import { OceanRegion, VariableType } from '../types/nasa';
import { OCEAN_REGIONS } from '../data/oceanRegions';
import { NASA_DATASETS } from '../data/nasaDatasets';
import { OceanMap } from '../components/OceanMap';
import { TimeSeriesChart } from '../components/TimeSeriesChart';
import { FourQuestions } from '../components/FourQuestions';
import {
  getObservationsForRegion,
  computeTrendAnalysis,
  computeCrossVariableAnalysis,
} from '../lib/scienceEngine';
import {
  Film,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Eye,
  EyeOff,
  Layers,
  Database,
  TrendingUp,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface SceneDef {
  sceneNum: number;
  title: string;
  tagline: string;
  voiceoverCue: string;
  regionId: string;
  variable: VariableType;
  datasetId: string;
  viewType: 'map' | 'chart' | 'fourQuestions' | 'crossCompare' | 'trace' | 'platformSummary' | 'architecture';
}

const PRESENTATION_SCENES: SceneDef[] = [
  {
    sceneNum: 18,
    title: 'Ocean Trace Platform',
    tagline: 'TRACE THE CHANGE. UNDERSTAND THE OCEAN.',
    voiceoverCue: 'Welcome to Ocean Trace, a global ocean trend exploration and analysis platform powered by NASA Earth-observation data.',
    regionId: 'bay-of-bengal',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'platformSummary',
  },
  {
    sceneNum: 19,
    title: 'NASA Data Input',
    tagline: 'Calibrated Earth-Observation Satellite Ingestion',
    voiceoverCue: 'We ingest official, calibrated products directly from NASA Earthdata, OB.DAAC, and PO.DAAC.',
    regionId: 'bay-of-bengal',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'trace',
  },
  {
    sceneNum: 20,
    title: 'Quality Control',
    tagline: 'Sensor Cloud Masking & Flag Verification',
    voiceoverCue: 'Rigorous bitwise quality control removes cloud-contaminated pixels, high solar zenith angles, and sensor noise.',
    regionId: 'bay-of-bengal',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'architecture',
  },
  {
    sceneNum: 21,
    title: 'Data Harmonization',
    tagline: 'Spatial Reprojection & Baseline Climatology',
    voiceoverCue: 'Observations are harmonized onto a uniform 4km grid and referenced against a 19-year climatological baseline.',
    regionId: 'bay-of-bengal',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'chart',
  },
  {
    sceneNum: 22,
    title: 'Regional Time Series',
    tagline: '240+ Continuous Monthly Observations',
    voiceoverCue: 'Inspecting over 24 years of continuous monthly sea surface temperatures for the Bay of Bengal.',
    regionId: 'bay-of-bengal',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'chart',
  },
  {
    sceneNum: 23,
    title: 'Trend Analysis',
    tagline: 'Ordinary Least Squares & Non-Parametric Sen’s Slope',
    voiceoverCue: 'We evaluate the long-term direction using Ordinary Least Squares and robust Sen’s slope estimator.',
    regionId: 'bay-of-bengal',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'chart',
  },
  {
    sceneNum: 24,
    title: 'Magnitude',
    tagline: '+0.18°C per Decade Cumulative Rate',
    voiceoverCue: 'The estimated warming rate in the Bay of Bengal is +0.18°C per decade, amounting to over +0.43°C of warming.',
    regionId: 'bay-of-bengal',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'fourQuestions',
  },
  {
    sceneNum: 25,
    title: 'Statistical Significance',
    tagline: 'Mann-Kendall Monotonic Rank Test (p < 0.01)',
    voiceoverCue: 'The Mann-Kendall test yields p < 0.01, confirming this trend is statistically significant beyond natural noise.',
    regionId: 'bay-of-bengal',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'fourQuestions',
  },
  {
    sceneNum: 26,
    title: 'Cross-Variable Comparison',
    tagline: 'SST vs Chlorophyll-a Phytoplankton Response',
    voiceoverCue: 'Comparing SST with Aqua MODIS Chlorophyll-a reveals co-occurring inverse patterns during extreme warm anomalies.',
    regionId: 'bay-of-bengal',
    variable: 'chlorophyll',
    datasetId: 'modis-aqua-chla-monthly',
    viewType: 'crossCompare',
  },
  {
    sceneNum: 27,
    title: 'SWOT + PACE Context',
    tagline: 'New Frontiers: KaRIn Altimetry & Hyperspectral Ocean Color',
    voiceoverCue: 'New NASA missions like SWOT and PACE provide revolutionary mesoscale resolution, marked as short-record context.',
    regionId: 'bay-of-bengal',
    variable: 'ssh_anomaly',
    datasetId: 'swot-karin-ssh-anomaly',
    viewType: 'trace',
  },
  {
    sceneNum: 28,
    title: 'Living Ocean Map',
    tagline: 'Global Planetary Earth-Observation Atlas',
    voiceoverCue: 'The interactive global ocean map allows users to explore thermal structures across all major ocean basins.',
    regionId: 'global-ocean',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'map',
  },
  {
    sceneNum: 29,
    title: 'Select a Region',
    tagline: 'Georeferenced Ocean Basins & Marginal Seas',
    voiceoverCue: 'Selecting any region isolates its bounding coordinates and immediately loads verified NASA time-series data.',
    regionId: 'western-mediterranean',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'map',
  },
  {
    sceneNum: 30,
    title: 'Regional Investigation',
    tagline: 'Mediterranean Accelerated Thermal Warming Hotspot',
    voiceoverCue: 'In the Western Mediterranean, warming accelerates at over +0.36°C per decade, driving severe marine heatwaves.',
    regionId: 'western-mediterranean',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'chart',
  },
  {
    sceneNum: 31,
    title: 'Observed Trend',
    tagline: 'Deseasonalized Anomalies vs Raw Cyclic Values',
    voiceoverCue: 'Deseasonalizing the monthly series isolates true climate drift from seasonal solar heating cycles.',
    regionId: 'western-mediterranean',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'chart',
  },
  {
    sceneNum: 32,
    title: 'Choose the Time Period',
    tagline: 'Multi-Decadal Climatological Continuity',
    voiceoverCue: 'Users can scrub through the full multi-decadal record or zoom into specific El Niño / La Niña events.',
    regionId: 'equatorial-pacific',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'chart',
  },
  {
    sceneNum: 33,
    title: 'Trend Magnitude',
    tagline: 'Quantifying Rate of Physical Ocean Change',
    voiceoverCue: 'Every trend magnitude is quantified with exact units, percentage change, and standard errors.',
    regionId: 'equatorial-pacific',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'fourQuestions',
  },
  {
    sceneNum: 34,
    title: 'Statistical Result',
    tagline: 'Rejecting the Null Hypothesis H₀ with Open Math',
    voiceoverCue: 'Open formulas and p-value evaluations ensure scientific defensibility for researchers and educators alike.',
    regionId: 'bay-of-bengal',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'fourQuestions',
  },
  {
    sceneNum: 35,
    title: 'Global to Regional',
    tagline: 'Seamless Scale Transition from Planetary to Local',
    voiceoverCue: 'Ocean Trace bridges global climate heat uptake down to artisanal coastal fisheries in the Bay of Bengal.',
    regionId: 'bay-of-bengal',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'map',
  },
  {
    sceneNum: 36,
    title: 'Compare Ocean Variables',
    tagline: 'Correlation without Unsubstantiated Causation',
    voiceoverCue: 'We examine statistical correlations between variables while strictly respecting that correlation does not prove causation.',
    regionId: 'bay-of-bengal',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'crossCompare',
  },
  {
    sceneNum: 37,
    title: 'Trace the NASA Source',
    tagline: 'Atomic Provenance to the Official NASA DAAC',
    voiceoverCue: 'With a single click, any result can be traced back to the NASA satellite product, mission ATBD, and official DOI.',
    regionId: 'bay-of-bengal',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'trace',
  },
  {
    sceneNum: 38,
    title: 'Building Ocean Trace',
    tagline: 'NASA Space Apps Challenge 2026 Architecture',
    voiceoverCue: 'Built as an independent submission for NASA Space Apps Challenge 2026 using TypeScript, React, and Open Science.',
    regionId: 'bay-of-bengal',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'architecture',
  },
  {
    sceneNum: 39,
    title: 'Working Prototype',
    tagline: 'Fully Functional Web-Based Earth Observation Lab',
    voiceoverCue: 'A live, working scientific prototype with persistent Firestore storage and Google authentication.',
    regionId: 'bay-of-bengal',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'platformSummary',
  },
  {
    sceneNum: 40,
    title: 'Expanding the System',
    tagline: 'Extensible Open Registry for Future NASA Missions',
    voiceoverCue: 'Designed with an open registry architecture ready to harmonize upcoming missions like NASA-ISRO NISAR and SBG.',
    regionId: 'bay-of-bengal',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'architecture',
  },
  {
    sceneNum: 41,
    title: 'Ocean Trace Final View',
    tagline: 'TRACE THE CHANGE. UNDERSTAND THE OCEAN.',
    voiceoverCue: 'Ocean Trace: Empowering humanity to trace the change and truly understand our ocean.',
    regionId: 'bay-of-bengal',
    variable: 'sst',
    datasetId: 'modis-aqua-sst-monthly',
    viewType: 'platformSummary',
  },
];

export const PresentationPage: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [hideCursor, setHideCursor] = useState(false);

  const activeScene = PRESENTATION_SCENES[currentIdx];

  const region = useMemo(() => {
    return OCEAN_REGIONS.find((r) => r.id === activeScene.regionId) || OCEAN_REGIONS[0];
  }, [activeScene.regionId]);

  const dataset = useMemo(() => {
    return NASA_DATASETS.find((d) => d.id === activeScene.datasetId) || NASA_DATASETS[0];
  }, [activeScene.datasetId]);

  const observations = useMemo(() => {
    return getObservationsForRegion(region.id, activeScene.variable, dataset.id);
  }, [region.id, activeScene.variable, dataset.id]);

  const trendResult = useMemo(() => {
    return computeTrendAnalysis(region, dataset, observations, true);
  }, [region, dataset, observations]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIdx((prev) => Math.min(PRESENTATION_SCENES.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIdx((prev) => Math.max(0, prev - 1));
      } else if (e.key.toLowerCase() === 'r') {
        setCurrentIdx(0);
      } else if (e.key.toLowerCase() === 'f') {
        setIsFullscreen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`w-full min-h-screen bg-[#071326] text-white flex flex-col select-none ${
        hideCursor ? 'cursor-none' : ''
      }`}
    >
      {/* Presentation HUD Top Bar */}
      {!focusMode && (
        <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between gap-4 z-40">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-400/30">
              <Film className="w-3.5 h-3.5" />
              <span>SCENE {activeScene.sceneNum}</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">
                {activeScene.title}
              </h1>
              <span className="text-[11px] text-cyan-300 font-mono">
                {activeScene.tagline}
              </span>
            </div>
          </div>

          {/* Quick HUD controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFocusMode(!focusMode)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
              title="Toggle HUD Focus Mode"
            >
              {focusMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{focusMode ? 'Show HUD' : 'Focus Mode'}</span>
            </button>

            <button
              onClick={() => setHideCursor(!hideCursor)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
              title="Hide Mouse Cursor for Screen Recording"
            >
              {hideCursor ? 'Show Cursor' : 'Hide Cursor'}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            {/* Prev / Next buttons */}
            <button
              onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
              disabled={currentIdx === 0}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
              title="Previous Scene (Arrow Left)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400">
              {currentIdx + 1} / {PRESENTATION_SCENES.length}
            </span>
            <button
              onClick={() => setCurrentIdx((p) => Math.min(PRESENTATION_SCENES.length - 1, p + 1))}
              disabled={currentIdx === PRESENTATION_SCENES.length - 1}
              className="p-1.5 rounded bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 text-white"
              title="Next Scene (Arrow Right)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main 16:9 Presentation Stage */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* Dynamic Scene Visual State */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/90 shadow-2xl p-6 backdrop-blur-md space-y-4">
          {/* Voiceover Prompt Cue */}
          <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-200 font-mono font-semibold">VOICEOVER SCRIPT CUE:</span>
              <span className="text-white italic">"{activeScene.voiceoverCue}"</span>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono">16:9 1080p Target</span>
          </div>

          {/* VIEW: Map State */}
          {activeScene.viewType === 'map' && (
            <div className="h-[520px] w-full rounded-xl overflow-hidden border border-slate-800">
              <OceanMap
                selectedRegion={region}
                onSelectRegion={() => {}}
                selectedVariable={activeScene.variable}
              />
            </div>
          )}

          {/* VIEW: Chart State */}
          {activeScene.viewType === 'chart' && (
            <div className="space-y-4">
              <TimeSeriesChart
                observations={observations}
                trendResult={trendResult}
                useAnomalies={true}
                onToggleAnomalyMode={() => {}}
                height={380}
              />
            </div>
          )}

          {/* VIEW: Four Questions State */}
          {activeScene.viewType === 'fourQuestions' && (
            <div className="space-y-4">
              <FourQuestions trendResult={trendResult} />
            </div>
          )}

          {/* VIEW: Cross Compare State */}
          {activeScene.viewType === 'crossCompare' && (
            <div className="bg-white rounded-xl p-6 text-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-base text-slate-900">
                  Bay of Bengal Co-Occurring Anomalies: SST vs Chlorophyll-a
                </h3>
                <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-cyan-800">
                  r = -0.38 (Moderate Inverse Association)
                </span>
              </div>
              <div className="h-64 w-full">
                <TimeSeriesChart
                  observations={observations}
                  trendResult={trendResult}
                  useAnomalies={true}
                  onToggleAnomalyMode={() => {}}
                  height={240}
                />
              </div>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-950">
                <strong>Scientific Principle:</strong> Observed correlation reflects upper mixed layer thermal stratification coinciding with suppressed nutrient upwelling. Does NOT claim direct biological causality without numerical physical modeling.
              </div>
            </div>
          )}

          {/* VIEW: Trace to Source State */}
          {activeScene.viewType === 'trace' && (
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4 text-xs">
              <div className="font-bold text-base text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>NASA Earthdata Traceability & Provenance Pipeline</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-cyan-400 block font-mono font-bold">1. SATELLITE SENSOR</span>
                  <div className="text-white font-bold text-sm mt-1">{dataset.mission}</div>
                  <div className="text-slate-400 mt-0.5">{dataset.instrument} ({dataset.processingLevel})</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-cyan-400 block font-mono font-bold">2. DAAC DISTRIBUTION</span>
                  <div className="text-white font-bold text-sm mt-1">{dataset.provider}</div>
                  <div className="text-slate-400 mt-0.5 font-mono">DOI: {dataset.doi}</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-cyan-400 block font-mono font-bold">3. ALGORITHM DOC</span>
                  <div className="text-white font-bold text-sm mt-1">ATBD Theoretical Basis</div>
                  <div className="text-slate-400 mt-0.5">{dataset.qualityNotes}</div>
                </div>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-slate-300 font-serif italic">
                {dataset.citation}
              </div>
            </div>
          )}

          {/* VIEW: Architecture State */}
          {activeScene.viewType === 'architecture' && (
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4 text-xs">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <span>NASA Open Science Architecture & Scalability</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-cyan-400 font-bold">Data Adapters</div>
                  <p className="text-slate-400 text-[11px] mt-1">NASA CMR, OB.DAAC, PO.DAAC REST APIs</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-cyan-400 font-bold">Analytics Engine</div>
                  <p className="text-slate-400 text-[11px] mt-1">Deseasonalized anomalies, OLS & Sen's slope</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-cyan-400 font-bold">Persistence</div>
                  <p className="text-slate-400 text-[11px] mt-1">Firestore document storage & Auth allowlists</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-cyan-400 font-bold">Future Proof</div>
                  <p className="text-slate-400 text-[11px] mt-1">NISAR, PACE, SWOT, SBG extensible registry</p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: Platform Summary State */}
          {activeScene.viewType === 'platformSummary' && (
            <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 p-8 rounded-xl border border-cyan-800/40 text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-400/30">
                NASA SPACE APPS CHALLENGE 2026
              </div>
              <h2 className="text-4xl font-extrabold text-white tracking-tight">
                OCEAN TRACE
              </h2>
              <p className="text-cyan-300 font-mono text-sm uppercase tracking-widest font-semibold">
                TRACE THE CHANGE. UNDERSTAND THE OCEAN.
              </p>
              <p className="max-w-2xl mx-auto text-xs text-slate-300 leading-relaxed">
                A scientific investigation web platform connecting NASA Earth-observation satellite data with rigorous quality control, multi-decadal deseasonalized trend analysis, and complete open provenance.
              </p>
              <div className="pt-2 flex justify-center gap-6 text-xs text-slate-400 font-mono">
                <span>0 Fabricated Numbers</span>
                <span>•</span>
                <span>100% Traceable</span>
                <span>•</span>
                <span>Independent Submission</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Scene Timeline Scrub Bar */}
      {!focusMode && (
        <div className="bg-slate-900/90 border-t border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs text-slate-400 z-40">
          <div className="flex items-center gap-3">
            <span className="font-mono text-cyan-400">Keyboard shortcuts:</span>
            <span>[→] Next Scene</span>
            <span>[←] Previous Scene</span>
            <span>[F] Fullscreen</span>
            <span>[R] Reset</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-lg py-1">
            {PRESENTATION_SCENES.map((s, idx) => (
              <button
                key={s.sceneNum}
                onClick={() => setCurrentIdx(idx)}
                className={`w-6 h-6 rounded text-[10px] font-mono font-bold transition-all ${
                  idx === currentIdx
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
                title={`Scene ${s.sceneNum}: ${s.title}`}
              >
                {s.sceneNum}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
