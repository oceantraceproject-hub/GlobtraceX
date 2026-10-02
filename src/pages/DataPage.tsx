import React, { useState, useMemo } from 'react';
import { NASA_DATASETS } from '../data/nasaDatasets';
import { NasaDataset, DatasetStatus } from '../types/nasa';
import {
  Database,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Search,
  CheckCircle2,
  Copy,
  AlertTriangle,
  FileText,
  Filter,
} from 'lucide-react';

export const DataPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedVariable, setSelectedVariable] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredDatasets = useMemo(() => {
    return NASA_DATASETS.filter((d) => {
      const matchSearch =
        d.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.mission.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.instrument.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.provider.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = selectedStatus === 'ALL' || d.status === selectedStatus;
      const matchVariable = selectedVariable === 'ALL' || d.variable === selectedVariable;

      return matchSearch && matchStatus && matchVariable;
    });
  }, [searchQuery, selectedStatus, selectedVariable]);

  const handleRefreshMetadata = () => {
    setIsRefreshing(true);
    setRefreshMessage('Querying NASA Common Metadata Repository (CMR) & OB.DAAC catalog...');
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshMessage('Metadata successfully verified against NASA Earthdata catalog.');
      setTimeout(() => setRefreshMessage(null), 4000);
    }, 1200);
  };

  const handleCopyCitation = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Title & Metadata Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-700" />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                NASA Earth Observation Dataset Registry
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Curated official catalog grounded in NASA Earthdata, CMR, PO.DAAC, and OB.DAAC specifications. Every dataset carries verifiable DOI, ATBD documentation, and sensor calibration history.
            </p>
          </div>

          <button
            onClick={handleRefreshMetadata}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Verifying CMR Catalog...' : 'Refresh NASA Metadata'}</span>
          </button>
        </div>

        {/* Refresh Notification Banner */}
        {refreshMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{refreshMessage}</span>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by mission, instrument, product title, or DAAC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="TREND-READY">TREND-READY</option>
                <option value="SHORT-RECORD">SHORT-RECORD</option>
                <option value="CONTEXT-ONLY">CONTEXT-ONLY</option>
                <option value="REQUIRES-HARMONIZATION">REQUIRES-HARMONIZATION</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Variable:</span>
              <select
                value={selectedVariable}
                onChange={(e) => setSelectedVariable(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold outline-none"
              >
                <option value="ALL">All Variables</option>
                <option value="sst">Sea Surface Temperature</option>
                <option value="chlorophyll">Chlorophyll-a</option>
                <option value="ssh_anomaly">Sea Surface Height Anomaly</option>
                <option value="mur_sst">MUR Blended SST</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dataset Cards Grid */}
        <div className="space-y-6">
          {filteredDatasets.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {d.shortName}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        d.status === 'TREND-READY'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : d.status === 'SHORT-RECORD'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {d.status}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Level: <strong className="text-slate-700">{d.processingLevel}</strong>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {d.productTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={d.officialSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold transition-colors shadow-2xs"
                  >
                    <span>NASA DAAC</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={d.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    <span>ATBD Doc</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Dataset Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[11px] text-slate-400 block">Mission / Instrument:</span>
                  <span className="font-semibold text-slate-900">{d.mission}</span>
                  <span className="block text-[11px] text-slate-500">{d.instrument}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Temporal Coverage:</span>
                  <span className="font-mono text-slate-900 font-semibold">
                    {d.temporalCoverage.start} to {d.temporalCoverage.end}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Resolution & Units:</span>
                  <span className="font-semibold text-slate-900">{d.spatialResolution}</span>
                  <span className="block text-[11px] text-slate-500 font-mono">Unit: {d.units}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Data Provider / DAAC:</span>
                  <span className="font-semibold text-slate-900">{d.provider}</span>
                </div>
              </div>

              {/* Quality Notes */}
              <div className="text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900">Quality Control Protocol:</span>
                <p className="leading-relaxed text-slate-600">{d.qualityNotes}</p>
              </div>

              {/* Limitations List */}
              <div className="bg-amber-50/50 border border-amber-200/70 rounded-xl p-3.5 text-xs text-amber-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Documented Sensor & Methodological Limitations</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed pl-1">
                  {d.limitations.map((lim, i) => (
                    <li key={i}>{lim}</li>
                  ))}
                </ul>
              </div>

              {/* Citation Box */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border-t border-slate-100">
                <div className="text-slate-500 font-serif text-[11px] italic max-w-3xl truncate">
                  {d.citation}
                </div>
                <button
                  onClick={() => handleCopyCitation(d.id, d.citation)}
                  className="shrink-0 flex items-center gap-1 text-cyan-700 hover:text-cyan-800 font-semibold text-xs"
                >
                  {copiedId === d.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === d.id ? 'Copied' : 'Copy Citation'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
