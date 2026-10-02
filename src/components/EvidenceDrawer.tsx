import React, { useState } from 'react';
import { StructuredScientificResult } from '../compute/globTraceScience';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Database,
  FileCode,
  Layers,
  Calendar,
  Lock,
} from 'lucide-react';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  result: StructuredScientificResult;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ isOpen, onClose, result }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl border-l border-purple-100 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50/80 via-white to-purple-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-purple-700 font-bold block">
                {t('evidence.evidenceDrawerTitle')}
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">
                {result.region.name} • {result.variableName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-purple-100/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Official Verification Badge */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-emerald-900 text-xs block">
                {t('evidence.verifiedSource')}
              </span>
              <p className="text-emerald-700 text-[11px] leading-relaxed">
                This scientific result was computed deterministically from calibrated NASA Earth-observing satellite radiances distributed through {result.provenance.source_agency}. Zero synthetic or unverified values.
              </p>
            </div>
          </div>

          {/* NASA Provenance Chain */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-900">
              NASA DATASET PROVENANCE
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              <div className="p-3 rounded-xl bg-slate-50 border border-purple-100/80">
                <span className="text-[10px] text-slate-400 block font-sans">Dataset ID</span>
                <span className="font-bold text-purple-950 text-xs">{result.provenance.dataset_id}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-purple-100/80">
                <span className="text-[10px] text-slate-400 block font-sans">Product Version</span>
                <span className="font-bold text-purple-950 text-xs">{result.provenance.product_version}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-purple-100/80">
                <span className="text-[10px] text-slate-400 block font-sans">NASA Mission</span>
                <span className="font-bold text-purple-950 text-xs">{result.provenance.mission}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-purple-100/80">
                <span className="text-[10px] text-slate-400 block font-sans">Instrument / Sensor</span>
                <span className="font-bold text-purple-950 text-xs">{result.provenance.instrument}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-purple-100/80 sm:col-span-2">
                <span className="text-[10px] text-slate-400 block font-sans">Official DOI</span>
                <span className="font-bold text-purple-700 text-xs break-all">
                  https://doi.org/{result.provenance.doi}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-purple-100/80 sm:col-span-2">
                <span className="text-[10px] text-slate-400 block font-sans">SHA-256 Checksum</span>
                <span className="text-[10px] text-slate-600 break-all">
                  {result.provenance.checksum_sha256}
                </span>
              </div>
            </div>
          </div>

          {/* Mathematical & Statistical Derivation */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-900">
              DETERMINISTIC STATISTICAL DERIVATION
            </h3>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2.5 font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Theil-Sen Robust Median Slope:</span>
                <span className="font-bold text-purple-900">{result.slope.valuePerDecade} {result.slope.unit}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">95% Confidence Interval:</span>
                <span className="font-bold text-purple-900">
                  [{result.slope.ci_low}, {result.slope.ci_high}] {result.units}/dec
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Mann-Kendall Rank Statistic S:</span>
                <span className="font-bold text-purple-900">{result.trend.mannKendallS}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Standardized Z-Score:</span>
                <span className="font-bold text-purple-900">{result.trend.mannKendallZ}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Two-Tailed p-value:</span>
                <span className="font-bold text-purple-900">
                  p {result.trend.p_value < 0.001 ? '< 0.001' : `= ${result.trend.p_value}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Valid Observations / Coverage:</span>
                <span className="font-bold text-purple-900">
                  {result.observations.validCount} / {result.observations.totalExpected} ({result.observations.coveragePct}%)
                </span>
              </div>
            </div>
          </div>

          {/* Raw Structured Output Inspection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" />
                <span>{t('evidence.rawStructuredOutput')}</span>
              </h3>
              <button
                onClick={handleCopyJson}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : t('evidence.copyPayload')}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 text-purple-200 text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>

        {/* Drawer Footer with Direct NASA Link */}
        <div className="p-4 border-t border-purple-100 bg-white flex items-center justify-between gap-3">
          <a
            href={result.provenance.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <span>Open NASA Distribution Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href={result.provenance.documentation_url}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <span>Technical ATBD</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
