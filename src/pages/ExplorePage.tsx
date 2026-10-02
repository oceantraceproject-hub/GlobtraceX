import React, { useState, useMemo } from 'react';
import { OceanRegion, VariableType, NasaDataset } from '../types/nasa';
import { OCEAN_REGIONS } from '../data/oceanRegions';
import { NASA_DATASETS } from '../data/nasaDatasets';
import { OceanMap } from '../components/OceanMap';
import { TimeSeriesChart } from '../components/TimeSeriesChart';
import { FourQuestions } from '../components/FourQuestions';
import { TraceToSourceModal } from '../components/TraceToSourceModal';
import { CalculationsModal } from '../components/CalculationsModal';
import { getObservationsForRegion, computeTrendAnalysis } from '../lib/scienceEngine';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import {
  Compass,
  Layers,
  TrendingUp,
  Bookmark,
  Share2,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';

interface ExplorePageProps {
  selectedRegion: OceanRegion;
  onSelectRegion: (region: OceanRegion) => void;
  selectedVariable: VariableType;
  onSelectVariable: (variable: VariableType) => void;
  onNavigate: (route: string) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  selectedRegion,
  onSelectRegion,
  selectedVariable,
  onSelectVariable,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [useAnomalies, setUseAnomalies] = useState(true);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Available datasets for selected variable
  const availableDatasets = useMemo(() => {
    return NASA_DATASETS.filter((d) => d.variable === selectedVariable);
  }, [selectedVariable]);

  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(
    availableDatasets[0]?.id || NASA_DATASETS[0].id
  );

  // Ensure dataset matches variable when variable changes
  React.useEffect(() => {
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

  // Observations and trend computation
  const observations = useMemo(() => {
    return getObservationsForRegion(selectedRegion.id, selectedVariable, currentDataset.id);
  }, [selectedRegion.id, selectedVariable, currentDataset.id]);

  const trendResult = useMemo(() => {
    return computeTrendAnalysis(selectedRegion, currentDataset, observations, useAnomalies);
  }, [selectedRegion, currentDataset, observations, useAnomalies]);

  // Save investigation to user profile in Firestore
  const handleSaveInvestigation = async () => {
    if (!user) {
      onNavigate('/sign-in');
      return;
    }

    try {
      const colRef = collection(db, 'users', user.uid, 'savedInvestigations');
      await addDoc(colRef, {
        id: `inv_${Date.now()}`,
        userId: user.uid,
        title: `${selectedRegion.name} — ${currentDataset.variableLabel}`,
        regionId: selectedRegion.id,
        variable: selectedVariable,
        datasetId: currentDataset.id,
        timeRange: `${trendResult.timeRange.start} to ${trendResult.timeRange.end}`,
        trendEstimate: `${(trendResult.olsSlope * 10).toFixed(3)} ${trendResult.units}/decade`,
        statisticalResult: trendResult.assessmentSummary,
        notes: `Saved via Ocean Trace Explorer for region ${selectedRegion.name}.`,
        createdAt: new Date().toISOString(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save investigation:', err);
    }
  };

  return (
    <div className="w-full bg-slate-100 min-h-screen pb-12">
      {/* Sub-header navigation breadcrumb */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Explorer</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-900">{selectedRegion.name}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
              {currentDataset.variableLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTraceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold border border-cyan-200 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" />
              <span>Trace to Source</span>
            </button>
            <button
              onClick={handleSaveInvestigation}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300 shadow-2xs transition-colors"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Saved!</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                  <span>Save Investigation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-Column Exploration Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Controls & Region Selector (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Variable Selector */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                1. Select Variable
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'sst', label: 'Sea Surface Temperature', sub: 'Aqua MODIS (Physical)', unit: '°C' },
                  { id: 'chlorophyll', label: 'Chlorophyll-a', sub: 'Aqua MODIS (Ocean Color)', unit: 'mg/m³' },
                  { id: 'ssh_anomaly', label: 'SSH Anomaly', sub: 'SWOT KaRIn (Short Record)', unit: 'cm' },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => onSelectVariable(v.id as VariableType)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                      selectedVariable === v.id
                        ? 'bg-cyan-50/80 border-cyan-400 text-cyan-950 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{v.label}</span>
                      <span className="font-mono text-[10px] text-slate-500">{v.unit}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">{v.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Region Selector */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Select Region
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {OCEAN_REGIONS.length} Basins
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                {OCEAN_REGIONS.map((r) => {
                  const isSelected = r.id === selectedRegion.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => onSelectRegion(r)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-700 text-white font-bold shadow-xs'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{r.name}</span>
                      {r.isFeatured && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Featured
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Dataset Specs */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs text-xs space-y-2">
              <div className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center justify-between">
                <span>Active NASA Product</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    currentDataset.status === 'TREND-READY'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {currentDataset.status}
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-800 font-semibold leading-tight">
                {currentDataset.productTitle}
              </div>
              <div className="text-[11px] text-slate-500">
                Resolution: {currentDataset.spatialResolution}
              </div>
              <div className="text-[11px] text-slate-500">
                DAAC: {currentDataset.provider}
              </div>
              <button
                onClick={() => setIsTraceModalOpen(true)}
                className="w-full text-center py-1.5 mt-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
              >
                Inspect Provenance & Citation
              </button>
            </div>
          </div>

          {/* CENTER COLUMN: Ocean Map Canvas (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="h-[460px] w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white">
              <OceanMap
                selectedRegion={selectedRegion}
                onSelectRegion={onSelectRegion}
                selectedVariable={selectedVariable}
                onSelectVariable={onSelectVariable}
              />
            </div>

            {/* Region Environmental Summary */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {selectedRegion.name} Overview
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  Area: {selectedRegion.areaKm2}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {selectedRegion.description}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                <span>Coordinates: {selectedRegion.coordinates.latMin}°N–{selectedRegion.coordinates.latMax}°N, {selectedRegion.coordinates.lonMin}°E–{selectedRegion.coordinates.lonMax}°E</span>
                <span className="font-medium text-slate-700">{selectedRegion.oceanBasin}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Quantitative Results Panel (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Trend Summary Card */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Statistical Result
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              {trendResult.dataset.status === 'SHORT-RECORD' ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Short-Record Guardrail</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    NASA {currentDataset.instrument} operational record duration is under 3 years. Not eligible for multi-decadal trend extrapolation.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Observed Trend (OLS):</span>
                    <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                      {trendResult.olsSlope > 0 ? '+' : ''}
                      {(trendResult.olsSlope * 10).toFixed(3)}{' '}
                      <span className="text-xs font-normal text-slate-600">
                        {trendResult.units}/decade
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block">Sen’s Slope (Median):</span>
                    <div className="text-sm font-semibold font-mono text-slate-800">
                      {trendResult.sensSlope > 0 ? '+' : ''}
                      {(trendResult.sensSlope * 10).toFixed(3)} {trendResult.units}/decade
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block">Cumulative Magnitude:</span>
                    <div className="text-base font-bold font-mono text-slate-900">
                      {trendResult.totalMagnitude > 0 ? '+' : ''}
                      {trendResult.totalMagnitude} {trendResult.units}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Hypothesis Test:</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          trendResult.isSignificant005 ? 'bg-emerald-500' : 'bg-amber-400'
                        }`}
                      />
                      <span className="font-bold text-xs text-slate-900">
                        {trendResult.isSignificant005 ? 'Significant (p < 0.05)' : 'Not Significant'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Mann-Kendall Z = {trendResult.mannKendallZ}
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => setIsCalcModalOpen(true)}
                className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
              >
                How was this calculated?
              </button>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs text-xs space-y-2">
              <span className="font-bold text-slate-900 block mb-1">Investigation Shortcuts</span>
              <button
                onClick={() => onNavigate('/trends')}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-medium flex items-center justify-between"
              >
                <span>Open Full Trend Laboratory</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => onNavigate('/compare')}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-medium flex items-center justify-between"
              >
                <span>Cross-Variable Comparison</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => onNavigate('/investigate')}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-medium flex items-center justify-between"
              >
                <span>Guided 9-Step Storytelling</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM: Synchronized Time-Series Chart */}
        <div className="mt-6">
          <TimeSeriesChart
            observations={observations}
            trendResult={trendResult}
            useAnomalies={useAnomalies}
            onToggleAnomalyMode={setUseAnomalies}
            height={300}
          />
        </div>

        {/* Four Questions Section */}
        <div className="mt-6">
          <FourQuestions
            trendResult={trendResult}
            onNavigateTab={onNavigate}
            showCalculationsModal={() => setIsCalcModalOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <TraceToSourceModal
        isOpen={isTraceModalOpen}
        onClose={() => setIsTraceModalOpen(false)}
        dataset={currentDataset}
        region={selectedRegion}
        trendResult={trendResult}
      />

      <CalculationsModal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
        trendResult={trendResult}
      />
    </div>
  );
};
