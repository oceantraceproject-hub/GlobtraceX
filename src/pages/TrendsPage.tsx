import React, { useState, useMemo } from 'react';
import { OceanRegion, VariableType, MonthlyObservation } from '../types/nasa';
import { OCEAN_REGIONS } from '../data/oceanRegions';
import { NASA_DATASETS } from '../data/nasaDatasets';
import { TimeSeriesChart } from '../components/TimeSeriesChart';
import { TraceToSourceModal } from '../components/TraceToSourceModal';
import { CalculationsModal } from '../components/CalculationsModal';
import { getObservationsForRegion, computeTrendAnalysis } from '../lib/scienceEngine';
import {
  TrendingUp,
  Download,
  ShieldCheck,
  FileSpreadsheet,
  FileCode,
  BookOpen,
  Info,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface TrendsPageProps {
  selectedRegion: OceanRegion;
  onSelectRegion: (region: OceanRegion) => void;
  selectedVariable: VariableType;
  onSelectVariable: (variable: VariableType) => void;
  onNavigate: (route: string) => void;
}

export const TrendsPage: React.FC<TrendsPageProps> = ({
  selectedRegion,
  onSelectRegion,
  selectedVariable,
  onSelectVariable,
  onNavigate,
}) => {
  const [useAnomalies, setUseAnomalies] = useState(true);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);

  // Available datasets
  const availableDatasets = useMemo(() => {
    return NASA_DATASETS.filter((d) => d.variable === selectedVariable);
  }, [selectedVariable]);

  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(
    availableDatasets[0]?.id || NASA_DATASETS[0].id
  );

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

  const observations = useMemo(() => {
    return getObservationsForRegion(selectedRegion.id, selectedVariable, currentDataset.id);
  }, [selectedRegion.id, selectedVariable, currentDataset.id]);

  const trendResult = useMemo(() => {
    return computeTrendAnalysis(selectedRegion, currentDataset, observations, useAnomalies);
  }, [selectedRegion, currentDataset, observations, useAnomalies]);

  // Export observations to CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date,Year,Month,ObservedRaw,ClimatologyBaseline,DeseasonalizedAnomaly,Unit,QualityFlag\n';
    observations.forEach((row) => {
      csvContent += `${row.date},${row.year},${row.month},${row.rawValue},${row.climatologyBaseline},${row.anomaly},${trendResult.units},${row.qualityFlag}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `OceanTrace_${selectedRegion.id}_${selectedVariable}_${trendResult.timeRange.start}_${trendResult.timeRange.end}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export configuration and trend statistics to JSON
  const handleExportJSON = () => {
    const exportData = {
      project: 'Ocean Trace (NASA Space Apps Challenge 2026)',
      dataset: {
        id: currentDataset.id,
        title: currentDataset.productTitle,
        mission: currentDataset.mission,
        doi: currentDataset.doi,
        citation: currentDataset.citation,
      },
      region: {
        id: selectedRegion.id,
        name: selectedRegion.name,
        coordinates: selectedRegion.coordinates,
      },
      analysis: {
        variable: selectedVariable,
        units: trendResult.units,
        period: trendResult.timeRange,
        baseline: trendResult.baselinePeriod,
        olsSlopePerYear: trendResult.olsSlope,
        olsSlopePerDecade: parseFloat((trendResult.olsSlope * 10).toFixed(4)),
        sensSlopePerDecade: parseFloat((trendResult.sensSlope * 10).toFixed(4)),
        totalMagnitude: trendResult.totalMagnitude,
        mannKendallZ: trendResult.mannKendallZ,
        mannKendallPValue: trendResult.mannKendallPValue,
        isSignificant005: trendResult.isSignificant005,
        timestamp: new Date().toISOString(),
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `OceanTrace_Analysis_${selectedRegion.id}_${selectedVariable}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Title & Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-700" />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Scientific Trend Analysis Laboratory
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rigorous parameter estimation: Ordinary Least Squares (OLS), Sen’s slope, and Mann-Kendall rank-based significance testing on NASA satellite time series.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 shadow-2xs transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-600" />
              <span>Export Analysis JSON</span>
            </button>
            <button
              onClick={() => setIsTraceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Trace to NASA Source</span>
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Region */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Region
            </label>
            <select
              value={selectedRegion.id}
              onChange={(e) => {
                const r = OCEAN_REGIONS.find((reg) => reg.id === e.target.value);
                if (r) onSelectRegion(r);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-cyan-500 outline-none"
            >
              {OCEAN_REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.isFeatured ? '★' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Variable */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Variable
            </label>
            <select
              value={selectedVariable}
              onChange={(e) => onSelectVariable(e.target.value as VariableType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-cyan-500 outline-none"
            >
              <option value="sst">Sea Surface Temperature (SST)</option>
              <option value="chlorophyll">Chlorophyll-a Concentration</option>
              <option value="ssh_anomaly">Sea Surface Height Anomaly (SWOT)</option>
            </select>
          </div>

          {/* Dataset */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Dataset Product
            </label>
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-cyan-500 outline-none"
            >
              {availableDatasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.instrument} ({d.status})
                </option>
              ))}
            </select>
          </div>

          {/* Period status */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Observation Period
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-medium text-slate-800 flex items-center justify-between">
              <span>{trendResult.timeRange.start} → {trendResult.timeRange.end}</span>
              <span className="text-[10px] text-cyan-700 font-bold">{trendResult.timeRange.totalMonths} mos</span>
            </div>
          </div>
        </div>

        {/* Large Main Time-Series Chart */}
        <TimeSeriesChart
          observations={observations}
          trendResult={trendResult}
          useAnomalies={useAnomalies}
          onToggleAnomalyMode={setUseAnomalies}
          height={380}
        />

        {/* Quantitative Result Matrix Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                Evaluation Output
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Quantitative Trend Assessment Summary
              </h2>
            </div>
            <button
              onClick={() => setIsCalcModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-lg border border-cyan-200 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Inspect Mathematical Formulas</span>
            </button>
          </div>

          {/* Metric Badges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Observed Slope (OLS):</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {trendResult.dataset.status === 'SHORT-RECORD' ? (
                  <span className="text-amber-700 text-sm">Short Record</span>
                ) : (
                  <>
                    {trendResult.olsSlope > 0 ? '+' : ''}
                    {(trendResult.olsSlope * 10).toFixed(3)}{' '}
                    <span className="text-xs font-normal text-slate-600">
                      {trendResult.units}/decade
                    </span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Standard Error: {trendResult.olsStdErr}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Sen’s Slope (Non-Parametric):</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {trendResult.dataset.status === 'SHORT-RECORD' ? (
                  <span className="text-amber-700 text-sm">Short Record</span>
                ) : (
                  <>
                    {trendResult.sensSlope > 0 ? '+' : ''}
                    {(trendResult.sensSlope * 10).toFixed(3)}{' '}
                    <span className="text-xs font-normal text-slate-600">
                      {trendResult.units}/decade
                    </span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Median Pairwise Slopes
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Cumulative Magnitude:</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {trendResult.dataset.status === 'SHORT-RECORD' ? (
                  <span className="text-amber-700 text-sm">N/A</span>
                ) : (
                  <>
                    {trendResult.totalMagnitude > 0 ? '+' : ''}
                    {trendResult.totalMagnitude} {trendResult.units}
                  </>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Over {trendResult.timeRange.totalMonths} months record
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Mann-Kendall Test:</span>
              <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                {trendResult.dataset.status === 'SHORT-RECORD' ? (
                  <span className="text-amber-700 text-sm">Short Record</span>
                ) : (
                  <>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        trendResult.isSignificant005 ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}
                    />
                    <span>{trendResult.isSignificant005 ? 'Significant' : 'Not Significant'}</span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                p = {trendResult.mannKendallPValue < 0.001 ? '<0.001' : trendResult.mannKendallPValue.toFixed(3)} (Z = {trendResult.mannKendallZ})
              </span>
            </div>
          </div>

          {/* Scientific Interpretation Statement */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-700" />
              <span>Scientific Interpretation & Caveats</span>
            </h4>
            <p className="text-slate-700 leading-relaxed">
              {trendResult.assessmentSummary}
            </p>
            <p className="text-slate-500 text-[11px] leading-relaxed pt-1 border-t border-slate-200/80">
              {trendResult.methodologyNotes}
            </p>
          </div>
        </div>
      </div>

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
