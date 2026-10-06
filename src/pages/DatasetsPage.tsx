import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { NASA_DATASET_REGISTRY, NasaSourceRecord } from '../data/nasaRegistry';
import {
  Database,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Search,
  Layers,
  Lock,
} from 'lucide-react';

export const DatasetsPage: React.FC<{ onNavigate?: (route: string) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');

  const filteredDatasets = React.useMemo(() => {
    if (selectedCategory === 'ALL') return NASA_DATASET_REGISTRY;
    return NASA_DATASET_REGISTRY.filter((d) => d.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold font-mono">
            <Database className="w-3.5 h-3.5" />
            <span>CENTRAL SOURCE REGISTRY</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {t('datasetsPage.title')}
          </h1>
          <p className="text-sm text-slate-600">
            {t('datasetsPage.subtitle')}
          </p>
        </div>

        {/* Provenance Gate & Authenticity Rule Card */}
        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs flex items-start gap-4 max-w-4xl mx-auto">
          <ShieldCheck className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-extrabold text-slate-900">
              Absolute NASA Authenticity & Provenance Gate
            </h3>
            <p className="text-slate-600 leading-relaxed">
              GlobTraceX enforces a strict provenance validation gate. Every scientific observation originates from authentic NASA-controlled distributions (NASA LP DAAC, GES DISC, PO.DAAC, LaRC). Derived indicators (such as Hot &amp; Humid Days) are explicitly attributed to their underlying NASA meteorological pipelines.
            </p>
          </div>
        </div>

        {/* Category Filter Tabs (Section 9) */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {['ALL', 'NASA SOURCE', 'GLOBTRACEX DERIVED', 'GLOBTRACEX VERIFIED', 'COMMUNITY PUBLISHED'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white hover:bg-purple-50 text-slate-600 border border-purple-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Connected Dataset Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDatasets.map((dataset) => (
            <div
              key={dataset.dataset_id}
              className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col justify-between space-y-5 hover:border-purple-300 transition-all hover:shadow-md"
            >
              <div className="space-y-3">
                {/* Status Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      {dataset.mission}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      dataset.category === 'GLOBTRACEX DERIVED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      {dataset.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{t('datasetsPage.verifiedBadge')}</span>
                  </span>
                </div>

                {/* Title & Product */}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {dataset.dataset_name}
                  </h3>
                  <p className="text-xs text-purple-700 font-mono mt-0.5 font-bold">
                    Product: {dataset.product_name}
                  </p>
                  {dataset.underlying_source && (
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Underlying NASA Source: <strong className="text-slate-800">{dataset.underlying_source}</strong>
                    </p>
                  )}
                </div>

                {/* Technical Specifications Matrix */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2.5 rounded-xl bg-[#fafaff] border border-purple-100">
                    <span className="text-[10px] text-slate-400 block font-sans">Instrument</span>
                    <span className="font-bold text-slate-800">{dataset.instrument}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#fafaff] border border-purple-100">
                    <span className="text-[10px] text-slate-400 block font-sans">Version / Level</span>
                    <span className="font-bold text-slate-800">{dataset.product_version} • {dataset.processing_level}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#fafaff] border border-purple-100">
                    <span className="text-[10px] text-slate-400 block font-sans">Spatial Resolution</span>
                    <span className="font-bold text-slate-800">{dataset.spatial_resolution}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#fafaff] border border-purple-100">
                    <span className="text-[10px] text-slate-400 block font-sans">Temporal Coverage</span>
                    <span className="font-bold text-slate-800">{dataset.temporal_coverage.start} → {dataset.temporal_coverage.end}</span>
                  </div>
                </div>

                {/* Processing Method & Limitations */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div>
                    <strong className="text-slate-800 font-mono">Algorithm:</strong> {dataset.processing_method}
                  </div>
                  <div>
                    <strong className="text-slate-800 font-mono">DOI:</strong>{' '}
                    <span className="font-mono text-purple-700 font-semibold">{dataset.doi}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-purple-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <a
                    href={dataset.official_source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all flex items-center gap-1.5 shadow-xs font-mono"
                  >
                    <span>{t('datasetsPage.openSource')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={dataset.official_documentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold transition-all flex items-center gap-1 border border-purple-200 font-mono"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t('datasetsPage.docsLink')}</span>
                  </a>
                </div>

                {dataset.variable === 'hot_humid' && onNavigate && (
                  <button
                    onClick={() => onNavigate('/datasets/hot-humid-days')}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-mono font-bold transition-all"
                  >
                    Hot &amp; Humid Workbench →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
