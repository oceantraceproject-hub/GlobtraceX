import React from 'react';
import { BookOpen, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export const ResearchPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const studies = [
    {
      title: 'Bay of Bengal Post-Monsoon Stratification & Marine Heatwaves',
      region: 'Bay of Bengal (Northern Indian Ocean)',
      variable: 'Sea Surface Temperature & Chlorophyll-a',
      sensor: 'Aqua MODIS L3 Mapped',
      period: '2002–2026 (288 months)',
      result: '+0.18°C / decade warming (p < 0.01). Significant thermal accumulation since 2016.',
      limitation: 'Monsoonal cloud cover limits optical coverage from June to August.',
      implication: 'Increased upper-layer thermal stratification suppresses vertical nutrient pumping, coinciding with reduced post-monsoon pelagic phytoplankton yields.',
    },
    {
      title: 'Mediterranean Accelerated Thermodynamic Warming Hotspot',
      region: 'Western Mediterranean Basin',
      variable: 'Sea Surface Temperature',
      sensor: 'Aqua MODIS L3 Mapped',
      period: '2002–2026',
      result: '+0.36°C / decade warming (p < 0.001). Exceeds global open ocean rate by 2.4x.',
      limitation: 'High coastal proximity introduces land-pixel adjacency effects.',
      implication: 'Accelerating summer marine heatwaves trigger widespread mass mortality in endemic benthic gorgonian and seagrass habitats.',
    },
    {
      title: 'Equatorial Pacific ENSO Coupled Teleconnections',
      region: 'Equatorial Pacific (Niño 3.4)',
      variable: 'SST Anomaly vs Climatology',
      sensor: 'Aqua MODIS L3 Mapped',
      period: '2002–2026',
      result: 'Interannual swings of -2.5°C to +3.0°C; background warming rate of +0.14°C / decade.',
      limitation: 'High interannual variance requires multi-decadal record to establish monotonic slope.',
      implication: 'Strong warm anomalies during 2015-16 and 2023-24 El Niños suppress equatorial upwelling and export productivity.',
    },
  ];

  return (
    <div className="w-full bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-700" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Featured Research Investigations & Case Studies
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Detailed scientific evaluations grounded in NASA Earth-observation datasets. Every study follows an explicit Question → Data → Method → Result → Limitation structure.
          </p>
        </div>

        <div className="space-y-6">
          {studies.map((study, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  CASE STUDY #{idx + 1}
                </span>
                <span className="text-xs font-mono text-slate-500">{study.period}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{study.title}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Region: {study.region} • Sensor: {study.sensor}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Quantitative Result:</span>
                  <p className="text-slate-700 font-mono text-cyan-900 font-semibold">{study.result}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Ecological & Oceanographic Implication:</span>
                  <p className="text-slate-600 leading-relaxed">{study.implication}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-amber-900 bg-amber-50/70 p-3 rounded-lg border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Documented Limitation:</strong> {study.limitation}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onNavigate('/explore')}
                  className="text-xs text-cyan-700 hover:text-cyan-800 font-bold flex items-center gap-1"
                >
                  <span>Replicate Investigation in Explorer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
