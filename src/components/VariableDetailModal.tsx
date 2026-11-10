import React from 'react';
import { EarthVariableDetail } from '../data/earthVariablesCatalog';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
  Calendar,
  Compass,
  AlertTriangle,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface VariableDetailModalProps {
  variable: EarthVariableDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onInvestigate?: (variableId: string) => void;
}

export const VariableDetailModal: React.FC<VariableDetailModalProps> = ({
  variable,
  isOpen,
  onClose,
  onInvestigate,
}) => {
  if (!isOpen || !variable) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-purple-100 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col font-sans">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-purple-100 flex items-center justify-between z-10">
          <div className="space-y-0.5 min-w-0 pr-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 font-bold">
                {variable.category}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                {variable.units}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 truncate">
              {variable.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-purple-50 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Overview Statement */}
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-2">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
              <BookOpen className="w-4 h-4 text-purple-700" />
              <span>Scientific Definition & Earth System Role</span>
            </div>
            <p className="text-slate-700 text-xs leading-relaxed">
              {variable.description}
            </p>
          </div>

          {/* Grid of Key Technical Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-[#fafaff] border border-purple-100">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-sans mb-1">
                <Cpu className="w-3.5 h-3.5 text-purple-600" />
                <span>PRIMARY INSTRUMENT & SENSOR</span>
              </div>
              <div className="font-bold text-slate-900">{variable.sensor}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{variable.satelliteMission}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#fafaff] border border-purple-100">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-sans mb-1">
                <Compass className="w-3.5 h-3.5 text-purple-600" />
                <span>SPATIAL RESOLUTION</span>
              </div>
              <div className="font-bold text-slate-900">{variable.resolution}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{variable.daacOrProvider}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#fafaff] border border-purple-100">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-sans mb-1">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>TEMPORAL COVERAGE</span>
              </div>
              <div className="font-bold text-slate-900">{variable.temporalCoverage}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{variable.updateFrequency}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#fafaff] border border-purple-100">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-sans mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>STATISTICAL SIGNIFICANCE RULE</span>
              </div>
              <div className="font-bold text-purple-900">{variable.significanceRule}</div>
            </div>
          </div>

          {/* Mathematical & Physical Retrieval Methodology */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <span>Retrieval Methodology</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-sans text-slate-700 leading-relaxed text-xs">
              {variable.methodology}
            </div>
          </div>

          {/* Uncertainty, Masking & Observation Limitations */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Uncertainty & Observation Limitations</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-[11px] font-sans">
              {variable.uncertaintyNotes}
            </p>
          </div>

          {/* Recommended Scientific Applications */}
          <div className="space-y-1">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Recommended Investigative Uses
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {variable.recommendedUse}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-purple-100 flex flex-wrap items-center justify-between gap-3">
          <a
            href={variable.nasaDataUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-purple-700 hover:text-purple-900 hover:underline inline-flex items-center gap-1"
          >
            <span>Official NASA Data Repository</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-purple-200 text-slate-700 hover:bg-purple-50 text-xs font-semibold transition-colors"
            >
              Close
            </button>

            {onInvestigate && (
              <button
                onClick={() => {
                  onClose();
                  onInvestigate(variable.id);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
              >
                <span>Investigate in 2D Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
