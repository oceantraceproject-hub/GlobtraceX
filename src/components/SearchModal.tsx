import React, { useState, useMemo } from 'react';
import { NASA_DATASET_REGISTRY } from '../data/nasaRegistry';
import { GLOBAL_COUNTRIES } from '../data/globalCountries';
import { BANGLADESH_DISTRICTS } from '../data/bangladeshData';
import { Search, X, Database, Compass, BookOpen, ArrowRight, MapPin, Globe } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  const methodologyTerms = [
    { term: 'Ordinary Least Squares (OLS)', route: '/references', cat: 'Statistical Method' },
    { term: 'Theil–Sen Robust Median Slope', route: '/references', cat: 'Statistical Method' },
    { term: 'Mann-Kendall Significance Test', route: '/references', cat: 'Statistical Method' },
    { term: 'Deseasonalized Climatological Anomaly', route: '/references', cat: 'Algorithm' },
    { term: 'Gilbert (1987) 95% Confidence Interval', route: '/references', cat: 'Statistical Method' },
    { term: 'NASA POWER Climatology API', route: '/datasets', cat: 'NASA Mission' },
    { term: 'MODIS Terra Land Surface Temperature', route: '/datasets', cat: 'NASA Mission' },
    { term: 'GPM IMERG Final Precipitation', route: '/datasets', cat: 'NASA Mission' },
    { term: 'GRACE / GRACE-FO Tellus Water Storage', route: '/datasets', cat: 'NASA Mission' },
    { term: 'MODIS / VIIRS Vegetation Greenness (NDVI)', route: '/datasets', cat: 'NASA Mission' },
  ];

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matchedCountries = GLOBAL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nameBn.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.code3.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.continent.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q)
    ).map((c) => ({
      title: `${c.name} (${c.code3})`,
      subtitle: `${c.region}, ${c.continent} • Capital: ${c.capital}`,
      badge: 'Country',
      route: '/investigate',
      icon: Globe,
    }));

    const matchedDatasets = NASA_DATASET_REGISTRY.filter(
      (d) =>
        d.dataset_name.toLowerCase().includes(q) ||
        d.dataset_id.toLowerCase().includes(q) ||
        d.mission.toLowerCase().includes(q) ||
        d.variable_name.toLowerCase().includes(q)
    ).map((d) => ({
      title: d.dataset_name,
      subtitle: `${d.mission} • ${d.source_agency}`,
      badge: d.data_readiness,
      route: '/datasets',
      icon: Database,
    }));

    const matchedDistricts = BANGLADESH_DISTRICTS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.divisionName.toLowerCase().includes(q) ||
        d.ecologicalSystem.toLowerCase().includes(q)
    ).map((d) => ({
      title: `${d.name} District, Bangladesh`,
      subtitle: `${d.divisionName} Division • ${d.isCoastal ? 'Coastal Zone' : 'Inland Basin'}`,
      badge: d.isCoastal ? 'Coastal' : 'District',
      route: '/investigate',
      icon: MapPin,
    }));

    const matchedTerms = methodologyTerms
      .filter((t) => t.term.toLowerCase().includes(q))
      .map((t) => ({
        title: t.term,
        subtitle: t.cat,
        badge: 'Science',
        route: t.route,
        icon: BookOpen,
      }));

    return [...matchedCountries, ...matchedDatasets, ...matchedDistricts, ...matchedTerms];
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-xs p-4 pt-20">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="p-4 border-b border-purple-100 flex items-center gap-3 bg-purple-50/30">
          <Search className="w-5 h-5 text-purple-600" />
          <input
            type="text"
            placeholder="Search NASA datasets, districts, statistical methods, missions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-xs font-mono text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 p-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="p-4 text-xs text-slate-500 font-mono">
              <span className="font-semibold text-slate-700 block mb-2 font-sans">Suggested searches:</span>
              <div className="flex flex-wrap gap-1.5">
                {['Cox’s Bazar', 'Satkhira', 'MODIS LST', 'GPM IMERG', 'Theil-Sen', 'Mann-Kendall', 'GRACE TWS'].map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-mono border border-purple-200 transition-colors"
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 font-mono">
              No matching NASA datasets or districts found for "{query}".
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((res, i) => {
                const Icon = res.icon;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      onNavigate(res.route);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-50/60 text-left flex items-center justify-between group transition-colors border border-transparent hover:border-purple-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100/60 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 group-hover:text-purple-900">
                          {res.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {res.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        {res.badge}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
