import React, { useState, useMemo } from 'react';
import {
  EARTH_CATEGORIES,
  EARTH_VARIABLES_CATALOG,
  EarthCategory,
  EarthVariableDetail,
} from '../data/earthVariablesCatalog';
import { VariableDetailModal } from '../components/VariableDetailModal';
import {
  Search,
  BookOpen,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Compass,
  Cpu,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface VariableExplorerPageProps {
  onNavigate: (route: string) => void;
}

export const VariableExplorerPage: React.FC<VariableExplorerPageProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalVariable, setActiveModalVariable] = useState<EarthVariableDetail | null>(null);

  // Filtered variables
  const filteredVariables = useMemo(() => {
    let list = EARTH_VARIABLES_CATALOG;
    if (selectedCategory !== 'All') {
      list = list.filter((v) => v.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.shortName.toLowerCase().includes(q) ||
          v.sensor.toLowerCase().includes(q) ||
          v.satelliteMission.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold font-mono w-fit mx-auto">
            <Layers className="w-3.5 h-3.5 text-purple-700" />
            <span>NASA EARTH SYSTEM OBSERVATION REGISTRY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Earth Science Variable Explorer
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-sans">
            Explore 9 core Earth system categories measured by NASA satellite constellations and assimilated models. Each variable includes mathematical definitions, instrument specifications, retrieval algorithms, and statistical rules.
          </p>
        </div>

        {/* Category Filters Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 font-bold">
              EARTH SYSTEM CATEGORIES (9 DOMAINS)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Showing {filteredVariables.length} of {EARTH_VARIABLES_CATALOG.length} variables
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === 'All'
                  ? 'bg-purple-900 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-700 border border-purple-100 hover:bg-purple-50'
              }`}
            >
              All Categories ({EARTH_VARIABLES_CATALOG.length})
            </button>

            {EARTH_CATEGORIES.map((cat) => {
              const count = EARTH_VARIABLES_CATALOG.filter((v) => v.category === cat.id).length;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-900 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-700 border border-purple-100 hover:bg-purple-50'
                  }`}
                >
                  <span>{cat.id}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-purple-800 text-purple-200' : 'bg-purple-50 text-purple-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative pt-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search variables by name, instrument, satellite (e.g. MODIS, GRACE, GPM, IMERG, LST)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-purple-100 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 font-mono shadow-xs"
            />
          </div>
        </div>

        {/* Variables Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVariables.map((v) => (
            <div
              key={v.id}
              className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Badge header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                    {v.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                    {v.units}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-950 group-hover:text-purple-700 transition-colors leading-snug">
                    {v.name}
                  </h3>
                  <div className="text-[11px] font-mono text-purple-700 font-bold mt-0.5">
                    {v.shortName}
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {v.description}
                </p>

                {/* Specs */}
                <div className="space-y-1.5 pt-2 border-t border-purple-100 text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <Cpu className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">Sensor: <strong className="text-slate-700">{v.sensor.split('(')[0]}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Compass className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">Grid: <strong className="text-slate-700">{v.resolution}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">Record: <strong className="text-slate-700">{v.temporalCoverage.split('(')[0]}</strong></span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-5 mt-4 border-t border-purple-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveModalVariable(v)}
                  className="text-xs font-mono font-bold text-purple-700 hover:text-purple-900 transition-colors flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View Specifications</span>
                </button>

                <button
                  onClick={() => onNavigate('/investigate')}
                  className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
                  title="Investigate in Map Lab"
                  aria-label="Investigate in Map Lab"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for variable specifications */}
        <VariableDetailModal
          variable={activeModalVariable}
          isOpen={Boolean(activeModalVariable)}
          onClose={() => setActiveModalVariable(null)}
          onInvestigate={() => onNavigate('/investigate')}
        />
      </div>
    </div>
  );
};
