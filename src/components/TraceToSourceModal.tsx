import React from 'react';
import { NasaDataset, OceanRegion, TrendAnalysisResult } from '../types/nasa';
import { X, ExternalLink, ShieldCheck, CheckCircle2, Copy, FileText, Database } from 'lucide-react';

interface TraceToSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: NasaDataset;
  region: OceanRegion;
  trendResult?: TrendAnalysisResult;
}

export const TraceToSourceModal: React.FC<TraceToSourceModalProps> = ({
  isOpen,
  onClose,
  dataset,
  region,
  trendResult,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(dataset.citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Scientific Provenance & Traceability
              </h2>
              <p className="text-xs text-cyan-200/80">
                End-to-end verification from Ocean Trace back to the official NASA DAAC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Step 1: Trace Flow Hierarchy */}
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Provenance Chain
            </h3>
            <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {/* Step 1 */}
              <div className="relative flex items-start gap-3 pl-1">
                <div className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold shrink-0 z-10">
                  1
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex-1 text-xs">
                  <div className="font-bold text-slate-900">Ocean Trace Scientific Analysis</div>
                  <div className="text-slate-600 mt-0.5">
                    Evaluated for <span className="font-semibold text-slate-800">{region.name}</span>{' '}
                    ({region.coordinates.latMin}°N–{region.coordinates.latMax}°N, {region.coordinates.lonMin}°E–{region.coordinates.lonMax}°E).
                  </div>
                  {trendResult && (
                    <div className="font-mono text-[11px] text-cyan-800 mt-1 bg-cyan-50/80 p-1.5 rounded border border-cyan-200">
                      Slope: {(trendResult.olsSlope * 10).toFixed(3)} {trendResult.units}/decade | Mann-Kendall Z = {trendResult.mannKendallZ} | p = {trendResult.mannKendallPValue < 0.001 ? '<0.001' : trendResult.mannKendallPValue.toFixed(3)}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-3 pl-1">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 z-10">
                  2
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex-1 text-xs">
                  <div className="font-bold text-slate-900">Harmonized Monthly Climatology & Anomalies</div>
                  <div className="text-slate-600 mt-0.5">
                    Spatial aggregation across valid 4km ocean grid cells within bounding coordinates. Reference baseline: 2002–2020 climatological monthly mean.
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-3 pl-1">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 z-10">
                  3
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex-1 text-xs">
                  <div className="font-bold text-slate-900">Official NASA Data Product</div>
                  <div className="text-slate-800 font-semibold mt-0.5">{dataset.productTitle}</div>
                  <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                    Identifier: {dataset.shortName} | Processing: {dataset.processingLevel} | Version: {dataset.version}
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start gap-3 pl-1">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 z-10">
                  4
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex-1 text-xs">
                  <div className="font-bold text-slate-900">Mission & Distributed Active Archive Center (DAAC)</div>
                  <div className="text-slate-700 mt-0.5">
                    Mission: <strong className="text-slate-900">{dataset.mission}</strong> ({dataset.instrument})
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Provider: <span className="font-medium text-slate-900">{dataset.provider}</span>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                    DOI: {dataset.doi}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dataset Official Metadata Grid */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-cyan-600" />
              <span>Official NASA Metadata Specifications</span>
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-slate-600">
              <div>
                <span className="text-slate-400 block text-[11px]">Temporal Coverage:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {dataset.temporalCoverage.start} to {dataset.temporalCoverage.end}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Spatial Resolution:</span>
                <span className="font-semibold text-slate-800">{dataset.spatialResolution}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Quality Control Flagging:</span>
                <span className="text-slate-800">{dataset.qualityNotes}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Last Metadata Verification:</span>
                <span className="font-mono text-emerald-700 font-medium">
                  {new Date(dataset.lastVerified).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Official Citation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-600" />
                Official Scientific Citation
              </span>
              <button
                onClick={handleCopyCitation}
                className="flex items-center gap-1 text-[11px] text-cyan-700 hover:text-cyan-800 font-medium"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Citation'}</span>
              </button>
            </div>
            <div className="bg-slate-100/80 p-3 rounded-lg border border-slate-200/90 text-xs font-serif text-slate-800 select-all leading-relaxed">
              {dataset.citation}
            </div>
          </div>

          {/* Links to Official NASA portals */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={dataset.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>NASA OceanColor / DAAC Web</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={dataset.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-xs transition-colors"
            >
              <span>Algorithm Theoretical Basis Doc (ATBD)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Ocean Trace NASA Space Apps 2026 Submission</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
