import React from 'react';
import { TrendAnalysisResult } from '../compute/types';
import { buildEvidenceChain } from '../compute/scienceEngine';
import { X, ExternalLink, ShieldCheck, CheckCircle2, Copy } from 'lucide-react';

interface EvidenceChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: TrendAnalysisResult;
}

export const EvidenceChainModal: React.FC<EvidenceChainModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const chain = buildEvidenceChain(result);

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(
      `${result.datasetName} (${result.datasetId}). DOI: ${result.doi}. Retrieved from NASA DAAC open distribution.`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden my-8 animate-in fade-in duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Scientific Evidence Chain & Audit Trail
              </h2>
              <p className="text-xs text-cyan-300/80">
                Verifiable provenance: NASA satellite observation to statistical output
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

        {/* Chain Flow */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-700 space-y-3">
            {chain.map((node) => (
              <div key={node.step} className="relative flex items-start gap-4 pl-1">
                <div className="w-7 h-7 rounded-full bg-cyan-700 text-white flex items-center justify-center text-xs font-bold font-mono shrink-0 z-10 shadow-md">
                  {node.step}
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex-1 text-xs space-y-1 hover:border-cyan-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{node.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                      {node.badge}
                    </span>
                  </div>
                  <div className="text-slate-400">{node.detail}</div>
                  <div className="font-mono text-[11px] text-cyan-300 font-semibold pt-1 flex items-center justify-between">
                    <span>{node.sourceValue}</span>
                    {node.url && (
                      <a
                        href={node.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-cyan-300 inline-flex items-center gap-1 text-[10px]"
                      >
                        <span>Open Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Citation Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Official NASA Citation</span>
              <button
                onClick={handleCopyCitation}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Citation'}</span>
              </button>
            </div>
            <div className="font-serif italic text-slate-300 text-[11px] select-all leading-relaxed">
              {result.datasetName} ({result.datasetId}). NASA Earth Observing System Open Data Archive. DOI: {result.doi}.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>NASA Space Apps 2026 Evidence Framework</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
