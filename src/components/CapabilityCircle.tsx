import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  TrendingUp,
  GitCompare,
  CloudRain,
  Thermometer,
  Sprout,
  Waves,
  Flame,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CapabilityNode {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  route: string;
  icon: any;
  color: string;
  badge: string;
}

const CAPABILITIES: CapabilityNode[] = [
  {
    id: 'explore',
    number: '01',
    title: 'EXPLORE EARTH',
    tagline: 'Procedural 3D Earth System',
    description:
      'Inspect 73 sovereign nations across realistic procedural terrain and vector grids with real-time NASA observational layers.',
    route: '/investigate',
    icon: Globe,
    color: '#8b5cf6',
    badge: '3D WEBGL EARTH',
  },
  {
    id: 'investigate',
    number: '02',
    title: 'DISCOVER TRENDS',
    tagline: 'Deterministic Climatology Pipeline',
    description:
      'Evaluate non-parametric Theil-Sen median slopes and Mann-Kendall rank hypothesis tests for statistically validated change.',
    route: '/investigate',
    icon: TrendingUp,
    color: '#a855f7',
    badge: 'STATISTICS',
  },
  {
    id: 'compare',
    number: '03',
    title: 'COMPARE COUNTRIES',
    tagline: 'Cross-Regional Dynamics',
    description:
      'Directly juxtapose environmental trajectories of any two sovereign nations with synchronized multi-decadal time-series.',
    route: '/compare',
    icon: GitCompare,
    color: '#6366f1',
    badge: 'DUAL ANALYSIS',
  },
  {
    id: 'rainfall',
    number: '04',
    title: 'TRACK RAINFALL',
    tagline: 'NASA GPM IMERG Precipitation',
    description:
      'Quantify monthly precipitation shifts, monsoon variability, and multi-year anomalies from orbital radar and radiometers.',
    route: '/investigate',
    icon: CloudRain,
    color: '#3b82f6',
    badge: 'IMERG V07B',
  },
  {
    id: 'temperature',
    number: '05',
    title: 'TRACK TEMPERATURE',
    tagline: 'MODIS Terra Land Surface Temp',
    description:
      'Unpack 26-year diurnal land skin thermal anomalies with generalized split-window infrared retrievals at 0.05° CMG.',
    route: '/investigate',
    icon: Thermometer,
    color: '#f59e0b',
    badge: 'MOD11C3.061',
  },
  {
    id: 'vegetation',
    number: '06',
    title: 'TRACK VEGETATION',
    tagline: 'Harmonized MODIS / VIIRS NDVI',
    description:
      'Monitor continental canopy health, agricultural biomass dynamics, and regional greening or browning trajectories.',
    route: '/investigate',
    icon: Sprout,
    color: '#10b981',
    badge: 'MOD13C2.061',
  },
  {
    id: 'water',
    number: '07',
    title: 'TRACK WATER',
    tagline: 'GRACE Mascon Groundwater',
    description:
      'Trace subterranean aquifer depletion and total terrestrial water column anomalies using satellite gravimetry solutions.',
    route: '/investigate',
    icon: Waves,
    color: '#06b6d4',
    badge: 'GRACE-FO JPL',
  },
  {
    id: 'hot_humid',
    number: '08',
    title: 'HOT & HUMID DAYS',
    tagline: 'NASA POWER Compound Heat Stress',
    description:
      'Quantify co-occurring thermal and moisture extremes (T2M_MAX ≥ 32°C & RH2M ≥ 70%) to monitor human physiological stress.',
    route: '/datasets/hot-humid-days',
    icon: Flame,
    color: '#ef4444',
    badge: 'DERIVED INDICATOR',
  },
  {
    id: 'evidence',
    number: '09',
    title: 'TRACE EVIDENCE',
    tagline: 'Immutable Provenance Ledger',
    description:
      'Inspect every underlying NASA mission, DOI, SHA-256 checksum, collection version, and peer-reviewed algorithmic paper.',
    route: '/references',
    icon: ShieldCheck,
    color: '#ec4899',
    badge: 'PROVENANCE',
  },
  {
    id: 'publish',
    number: '10',
    title: 'PUBLISH RESEARCH',
    tagline: 'Open Scientific Exchange',
    description:
      'Contribute peer community analyses and reproducible findings subject to transparent scientific labeling standards.',
    route: '/references',
    icon: BookOpen,
    color: '#14b8a6',
    badge: 'COMMUNITY',
  },
];

export const CapabilityCircle: React.FC<{
  onNavigate?: (route: string) => void;
}> = ({ onNavigate }) => {
  const [activeNodeId, setActiveNodeId] = useState<string>('hot_humid');
  const activeNode = CAPABILITIES.find((c) => c.id === activeNodeId) || CAPABILITIES[0];

  // Circle dimensions
  const radius = 230; // Radius in pixels
  const center = { x: 300, y: 300 };

  return (
    <section className="py-20 bg-gradient-to-b from-[#fafaff] via-white to-purple-50/30 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>INTERACTIVE SCIENTIFIC CAPABILITY NETWORK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            What Can You Discover With GlobTraceX?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
            A cohesive architecture connecting raw NASA Earth-observational feeds to reproducible non-parametric trend intelligence.
          </p>
        </div>

        {/* Interactive Radial Graph + Detail Panel Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Radial Visualization (Left 7 Cols) */}
          <div className="lg:col-span-7 flex justify-center items-center relative overflow-hidden py-6">
            <div className="relative w-[340px] h-[340px] sm:w-[600px] sm:h-[600px] flex items-center justify-center">
              {/* SVG Connector Web */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 600">
                <defs>
                  <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Orbit Rings */}
                <circle cx="300" cy="300" r={radius} fill="url(#ringGlow)" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="300" cy="300" r={radius * 0.65} fill="none" stroke="#ede9fe" strokeWidth="1" strokeDasharray="2 4" />

                {/* Spokes to each node */}
                {CAPABILITIES.map((node, i) => {
                  const angle = (i * 2 * Math.PI) / CAPABILITIES.length - Math.PI / 2;
                  const x = center.x + radius * Math.cos(angle);
                  const y = center.y + radius * Math.sin(angle);
                  const isSelected = node.id === activeNodeId;

                  return (
                    <line
                      key={node.id}
                      x1="300"
                      y1="300"
                      x2={x}
                      y2={y}
                      stroke={isSelected ? node.color : '#e2e8f0'}
                      strokeWidth={isSelected ? 2.5 : 1}
                      strokeOpacity={isSelected ? 0.9 : 0.4}
                      strokeDasharray={isSelected ? 'none' : '2 3'}
                    />
                  );
                })}
              </svg>

              {/* Central Nucleus (GLOBTRACEX) */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white shadow-2xl flex flex-col items-center justify-center text-center p-3 border-2 border-purple-400/50 cursor-pointer"
                onClick={() => onNavigate && onNavigate('/investigate')}
              >
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping mb-1" />
                <span className="text-[10px] font-mono tracking-widest text-purple-300 font-bold uppercase">
                  NUCLEUS
                </span>
                <span className="text-sm sm:text-base font-black tracking-tight text-white">
                  GLOBTRACEX
                </span>
                <span className="text-[9px] font-mono text-slate-300 mt-0.5">
                  10 SIGNALS
                </span>
              </motion.div>

              {/* 10 Peripheral Nodes */}
              {CAPABILITIES.map((node, i) => {
                const angle = (i * 2 * Math.PI) / CAPABILITIES.length - Math.PI / 2;
                // Scale radius slightly for responsive viewBox
                const x = center.x + radius * Math.cos(angle);
                const y = center.y + radius * Math.sin(angle);
                const isSelected = node.id === activeNodeId;
                const Icon = node.icon;

                return (
                  <motion.button
                    key={node.id}
                    onClick={() => setActiveNodeId(node.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      left: `calc(50% + ${(radius * Math.cos(angle)).toFixed(1)}px - 24px)`,
                      top: `calc(50% + ${(radius * Math.sin(angle)).toFixed(1)}px - 24px)`,
                    }}
                    className={`absolute z-20 w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
                      isSelected
                        ? 'bg-slate-950 text-white ring-4 ring-purple-400/60 shadow-xl'
                        : 'bg-white text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300'
                    }`}
                    title={node.title}
                  >
                    <Icon className="w-5 h-5" style={{ color: isSelected ? node.color : undefined }} />
                    <span className="absolute -bottom-5 text-[9px] font-mono font-bold text-slate-600 hidden sm:block whitespace-nowrap">
                      {node.number}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Interactive Feature Reveal Card (Right 5 Cols) */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNode.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-8 border border-purple-100 shadow-xl space-y-6 relative overflow-hidden"
              >
                {/* Glow accent */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 pointer-events-none"
                  style={{ backgroundColor: activeNode.color }}
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    FEATURE {activeNode.number} • {activeNode.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    AUTHENTIC NASA DATA
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                    {activeNode.title}
                  </h3>
                  <p className="text-xs font-mono font-bold text-purple-700 uppercase tracking-wide">
                    {activeNode.tagline}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                  {activeNode.description}
                </p>

                {/* Quick stats or specs */}
                <div className="p-4 rounded-2xl bg-[#fafaff] border border-purple-100 text-xs font-mono space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verification Engine:</span>
                    <span className="font-bold text-slate-900">Deterministic Non-Parametric</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Supported Scope:</span>
                    <span className="font-bold text-purple-700">73 Sovereign Nations</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate && onNavigate(activeNode.route)}
                    className="w-full py-3.5 px-5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 font-mono"
                  >
                    <span>Launch {activeNode.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
