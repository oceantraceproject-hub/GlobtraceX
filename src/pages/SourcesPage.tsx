import React, { useState } from 'react';
import { NASA_DATASETS } from '../data/nasaDatasets';
import { ExternalLink, Database, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';

export const SourcesPage: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const officialSources = [
    {
      title: 'NASA Earthdata Search',
      url: 'https://search.earthdata.nasa.gov/',
      category: 'Primary Discovery',
      description: 'The primary search interface for discovering and accessing all NASA Earth Science data products across all 12 Distributed Active Archive Centers (DAACs).',
    },
    {
      title: 'NASA Common Metadata Repository (CMR)',
      url: 'https://cmr.earthdata.nasa.gov/',
      category: 'Catalog System',
      description: 'A high-performance spatial/temporal metadata registry storing comprehensive records for all NASA Earth Science data.',
    },
    {
      title: 'NASA Ocean Biology DAAC (OB.DAAC)',
      url: 'https://oceancolor.gsfc.nasa.gov/',
      category: 'Ocean Color & Biology',
      description: 'Responsible for ocean biology and biogeochemistry data products from missions including MODIS, SeaWiFS, VIIRS, and PACE.',
    },
    {
      title: 'NASA PO.DAAC (Physical Oceanography)',
      url: 'https://podaac.jpl.nasa.gov/',
      category: 'Physical Oceanography',
      description: 'Archiving and distributing data for sea surface temperature, ocean surface winds, sea surface salinity, gravity, and ocean circulation (SWOT, MUR, Jason).',
    },
    {
      title: 'NASA PACE Ocean Color Web',
      url: 'https://pace.oceancolor.gsfc.nasa.gov/',
      category: 'Hyperspectral Ocean Color',
      description: 'The science team portal for the Plankton, Aerosol, Cloud, ocean Ecosystem (PACE) mission launched February 2024.',
    },
    {
      title: 'NASA Worldview',
      url: 'https://worldview.earthdata.nasa.gov/',
      category: 'Visual Earth Browser',
      description: 'Interactive browsing of full-resolution satellite imagery layers from NASA Earth-observing satellites.',
    },
  ];

  return (
    <div className="w-full bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Title */}
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-700" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Official NASA Sources & Data Provenance
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Ocean Trace is built exclusively on official NASA Earth Science Open Data repositories. No third-party scrapes, synthetic fabrications, or unofficial blogs are used.
          </p>
        </div>

        {/* Primary Data Systems */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Official NASA Data Distribution Systems
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {officialSources.map((source, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                      {source.category}
                    </span>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-cyan-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-2">{source.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {source.description}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-700 hover:text-cyan-800 font-bold flex items-center gap-1"
                  >
                    <span>Visit Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Scientific Citation & DOI Directory */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            NASA Satellite Product Citation Index
          </h2>

          <div className="divide-y divide-slate-100">
            {NASA_DATASETS.map((d) => (
              <div key={d.id} className="py-4 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-slate-900 text-sm">{d.productTitle}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500">DOI: {d.doi}</span>
                    <button
                      onClick={() => handleCopy(d.id, d.citation)}
                      className="flex items-center gap-1 text-cyan-700 hover:text-cyan-800 font-semibold"
                    >
                      {copiedId === d.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === d.id ? 'Copied' : 'Copy Citation'}</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-serif italic text-slate-800 leading-relaxed select-all">
                  {d.citation}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                  <span>Provider: <strong className="text-slate-700">{d.provider}</strong></span>
                  <span>Short Name: <code className="font-mono text-slate-700">{d.shortName}</code></span>
                  <span>Processing: <strong className="text-slate-700">{d.processingLevel}</strong></span>
                  <span>Status: <strong className="text-emerald-700">{d.status}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
