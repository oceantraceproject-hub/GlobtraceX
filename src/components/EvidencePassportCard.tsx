import React, { useState } from 'react';
import { EvidencePassportData } from '../services/intelligenceEngine';
import { Copy, Check, Download, ShieldCheck, FileText, ExternalLink, QrCode } from 'lucide-react';

interface EvidencePassportCardProps {
  passport: EvidencePassportData;
}

export const EvidencePassportCard: React.FC<EvidencePassportCardProps> = ({ passport }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(passport.rawExportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([passport.rawExportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${passport.passportId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(passport, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${passport.passportId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full bg-slate-900 text-slate-100 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-md space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-purple-400 tracking-wider">
                EVIDENCE PASSPORT
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                NASA VERIFIED
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs sm:max-w-md">
              ID: {passport.passportId}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-bold text-slate-200 transition-colors flex items-center gap-1.5 active:scale-95"
            title="Copy formatted evidence text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Passport'}</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono font-bold transition-colors flex items-center gap-1.5 active:scale-95"
            title="Download evidence passport text file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download .TXT</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Download JSON metadata"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Verified Fields */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Region Target</p>
          <p className="font-bold text-slate-100 truncate">{passport.regionName}</p>
          <p className="text-[10px] text-slate-500">ISO/ID: {passport.regionId}</p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Indicator</p>
          <p className="font-bold text-purple-300 truncate">{passport.indicatorName}</p>
          <p className="text-[10px] text-slate-500">Unit: {passport.units}</p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Theil-Sen Slope</p>
          <p className="font-bold text-emerald-400">
            {passport.theilSenSlopePerDecade > 0 ? '+' : ''}
            {passport.theilSenSlopePerDecade.toFixed(4)} {passport.units}/dec
          </p>
          <p className="text-[10px] text-slate-500">
            95% CI: [{passport.senConfidenceInterval95[0].toFixed(2)}, {passport.senConfidenceInterval95[1].toFixed(2)}]
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Mann-Kendall Rank</p>
          <p className="font-bold text-slate-100">
            p = {passport.mannKendallPValue.toFixed(4)}
          </p>
          <p className="text-[10px] text-slate-500">
            Z-score: {passport.mannKendallZ.toFixed(2)} ({passport.mannKendallPValue <= 0.05 ? 'p ≤ 0.05' : 'p > 0.05'})
          </p>
        </div>
      </div>

      {/* Sensor & Provenance Detail */}
      <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <p className="font-medium text-slate-300 font-mono">
            {passport.sensor} • {passport.datasetId}
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            Provider: {passport.provider} • Coverage: {passport.coveragePct.toFixed(1)}% ({passport.validObservations} valid monthly cycles)
          </p>
        </div>

        <a
          href={`https://doi.org/${passport.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-400 hover:text-purple-300 hover:underline shrink-0"
        >
          <span>DOI: {passport.doi}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
