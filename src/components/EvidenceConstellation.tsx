import React from 'react';
import { DimensionFingerprint } from '../compute/globTraceScience';
import {
  Thermometer,
  CloudRain,
  Sprout,
  Waves,
  Sun,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Info,
} from 'lucide-react';

interface EvidenceConstellationProps {
  signals: DimensionFingerprint[];
  activeVariable: 'lst' | 'rainfall' | 'ndvi' | 'tws' | 'solar';
  onSelectVariable: (variable: 'lst' | 'rainfall' | 'ndvi' | 'tws' | 'solar') => void;
  countryName: string;
}

export const EvidenceConstellation: React.FC<EvidenceConstellationProps> = ({
  signals,
  activeVariable,
  onSelectVariable,
  countryName,
}) => {
  // Node coordinates on a 420x260 SVG space
  const nodePositions: Record<string, { x: number; y: number; label: string; icon: any }> = {
    lst: { x: 210, y: 45, label: 'LST Temperature', icon: Thermometer },
    rainfall: { x: 80, y: 130, label: 'Precipitation', icon: CloudRain },
    tws: { x: 340, y: 130, label: 'Water Storage', icon: Waves },
    ndvi: { x: 130, y: 215, label: 'Vegetation (NDVI)', icon: Sprout },
    solar: { x: 290, y: 215, label: 'Solar Irradiance', icon: Sun },
  };

  // Co-occurrence analytical couplings (Non-causal analytical co-occurrence)
  const analyticalEdges = [
    { from: 'lst', to: 'rainfall', label: 'Hydro-Thermal Coupling' },
    { from: 'lst', to: 'tws', label: 'Evaporative Drawdown' },
    { from: 'rainfall', to: 'tws', label: 'Aquifer Recharge' },
    { from: 'rainfall', to: 'ndvi', label: 'Moisture Bio-Response' },
    { from: 'tws', to: 'ndvi', label: 'Rootzone Vitality' },
    { from: 'solar', to: 'lst', label: 'Radiative Forcing' },
  ];

  return (
    <div className="w-full bg-gradient-to-b from-[#120e2e] via-[#1a1442] to-[#0c0822] rounded-3xl p-5 border border-purple-800/40 text-white shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/30">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-purple-300 font-bold block">
              FUTURISTIC ANALYTICAL EVIDENCE CONSTELLATION
            </span>
            <h3 className="text-sm font-black text-white font-['Space_Grotesk']">
              Multi-Signal Observational Topology • {countryName}
            </h3>
          </div>
        </div>

        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-500/30 font-bold">
          Non-Causal Co-occurrence Network
        </span>
      </div>

      {/* Interactive Constellation SVG Canvas */}
      <div className="relative w-full overflow-hidden flex items-center justify-center py-2">
        <svg viewBox="0 0 420 260" className="w-full h-auto max-h-[260px] select-none">
          <defs>
            <radialGradient id="nodeActiveGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Analytical Co-Occurrence Edge Lines */}
          {analyticalEdges.map((edge, i) => {
            const p1 = nodePositions[edge.from];
            const p2 = nodePositions[edge.to];
            const isHighlighted = activeVariable === edge.from || activeVariable === edge.to;
            return (
              <line
                key={`edge-${i}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={isHighlighted ? '#c084fc' : '#4c1d95'}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeDasharray={isHighlighted ? '4 2' : '2 3'}
                opacity={isHighlighted ? 0.9 : 0.4}
              />
            );
          })}

          {/* Connected Variable Nodes */}
          {signals.map((sig) => {
            const pos = nodePositions[sig.variableKey] || { x: 210, y: 130, label: sig.variableName, icon: Sparkles };
            const isSelected = activeVariable === sig.variableKey;
            const Icon = pos.icon;

            return (
              <g
                key={sig.variableKey}
                onClick={() => onSelectVariable(sig.variableKey)}
                className="cursor-pointer group"
                transform={`translate(${pos.x}, ${pos.y})`}
              >
                {/* Glow ring if selected */}
                {isSelected && (
                  <circle cx="0" cy="0" r="32" fill="url(#nodeActiveGlow)" className="animate-pulse" />
                )}

                {/* Node Outer Ring */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? 22 : 17}
                  fill={isSelected ? '#6d28d9' : '#1e1b4b'}
                  stroke={isSelected ? '#ffffff' : sig.significant ? '#a855f7' : '#64748b'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="transition-all duration-200"
                />

                {/* Trend Direction Indicator Badge inside node */}
                <circle
                  cx="0"
                  cy="0"
                  r="6"
                  fill={
                    sig.direction === 'increasing'
                      ? '#ef4444'
                      : sig.direction === 'decreasing'
                      ? '#3b82f6'
                      : '#94a3b8'
                  }
                />

                {/* Node Label Text */}
                <text
                  x="0"
                  y={isSelected ? 36 : 28}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : '#c4b5fd'}
                  fontSize={isSelected ? '11' : '9.5'}
                  fontWeight={isSelected ? '800' : '600'}
                  fontFamily="Space Grotesk, sans-serif"
                >
                  {pos.label}
                </text>

                {/* Subtext Slope Rate */}
                <text
                  x="0"
                  y={isSelected ? 48 : 38}
                  textAnchor="middle"
                  fill={isSelected ? '#e9d5ff' : '#94a3b8'}
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {sig.slopePerDecade > 0 ? '+' : ''}
                  {sig.slopePerDecade} {sig.units}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Scientific Honesty Disclaimer */}
      <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/60 text-[10px] font-mono text-purple-200/90 leading-relaxed flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
        <span>
          <strong>Scientific Topology Notice:</strong> Interconnecting nodes denote observed analytical co-occurrence across satellite sensors (e.g. warming and drying trends). They do not imply or prove direct causality without mechanistic hydrodynamic modeling.
        </span>
      </div>
    </div>
  );
};
