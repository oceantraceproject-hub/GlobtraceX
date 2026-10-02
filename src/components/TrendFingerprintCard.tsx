import React from 'react';
import { RegionFingerprint } from '../compute/types';
import { ArrowUpRight, ArrowDownRight, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface TrendFingerprintCardProps {
  fingerprint: RegionFingerprint;
  onSelectVariable?: (variable: string) => void;
}

export const TrendFingerprintCard: React.FC<TrendFingerprintCardProps> = ({
  fingerprint,
  onSelectVariable,
}) => {
  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            INNOVATION FEATURE
          </span>
          <h3 className="text-sm font-bold text-white mt-1">
            Trend Fingerprint: <span className="text-cyan-300 capitalize">{fingerprint.regionName}</span>
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Multi-Variable Signature</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {fingerprint.items.map((item) => {
          const isUp = item.direction === 'increasing';
          const isDown = item.direction === 'decreasing';
          return (
            <div
              key={item.variable}
              onClick={() => onSelectVariable && onSelectVariable(item.variable)}
              className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300">{item.name}</span>
                  <span
                    className={`font-bold flex items-center gap-0.5 text-xs ${
                      isUp ? 'text-rose-400' : isDown ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  >
                    {isUp && <ArrowUpRight className="w-3.5 h-3.5" />}
                    {isDown && <ArrowDownRight className="w-3.5 h-3.5" />}
                    {!isUp && !isDown && <ArrowRight className="w-3.5 h-3.5" />}
                    <span>{isUp ? 'Rising' : isDown ? 'Declining' : 'Stable'}</span>
                  </span>
                </div>

                <div className="text-lg font-bold font-mono text-white mt-1">
                  {item.slopePerDecade > 0 ? '+' : ''}
                  {item.slopePerDecade}{' '}
                  <span className="text-xs font-normal text-slate-400">{item.unit}/dec</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <div className="flex items-center gap-1">
                  <span>Data:</span>
                  <span className="text-emerald-400">
                    {'●'.repeat(item.dataCompletenessScore)}
                    {'○'.repeat(5 - item.dataCompletenessScore)}
                  </span>
                </div>
                <div>
                  Uncertainty:{' '}
                  <span className={item.uncertaintyLevel === 'Low' ? 'text-emerald-400' : 'text-amber-400'}>
                    {item.uncertaintyLevel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory Scientific Guardrail */}
      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>Co-occurring observed trends:</strong> Represents synchronized spatial/temporal observations; does <em>not</em> imply direct physical or biological causality.
        </span>
      </div>
    </div>
  );
};
