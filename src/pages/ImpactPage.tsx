import React from 'react';
import { Globe, Users, GraduationCap, Compass, ShieldCheck } from 'lucide-react';

export const ImpactPage: React.FC = () => {
  return (
    <div className="w-full bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-700" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Real-World Societal & Scientific Impact
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            How open access to calibrated NASA Earth observations empowers ocean literacy, regional fisheries research, and climate education without exaggerated claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Regional Oceanographic Investigation</h3>
            <p className="text-slate-600 leading-relaxed">
              Provides coastal researchers and artisanal fishery planners in developing basins like the Bay of Bengal with instant, serverless access to multi-decadal sea surface temperature anomalies and chlorophyll dynamics without requiring expensive high-performance computing clusters.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Environmental Data Literacy & STEM</h3>
            <p className="text-slate-600 leading-relaxed">
              Demystifies satellite remote sensing for university students and educators by offering dual "Scientific" and "Simple" explanation layers. Teaches students why deseasonalization is mandatory and how to conduct hypothesis testing with Mann-Kendall statistics.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Combating Climate Misinformation</h3>
            <p className="text-slate-600 leading-relaxed">
              By enforcing atomic source traceability back to official NASA DAAC DOIs and adhering strictly to the principle that correlation does not equal causation, Ocean Trace sets a gold standard for defensible, transparent climate communication.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Open Science Reproducibility</h3>
            <p className="text-slate-600 leading-relaxed">
              Every trend calculation, slope estimate, and monthly time series can be exported in standardized CSV, JSON, and BibTeX formats. Independent researchers can immediately verify and reproduce any statistical finding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
