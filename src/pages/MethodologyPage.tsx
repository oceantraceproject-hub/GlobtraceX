import React, { useState } from 'react';
import { BookOpen, Eye, Layers, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'scientific' | 'simple'>('scientific');

  const steps = [
    {
      num: '01',
      title: 'Data Acquisition & Ingestion',
      scientific:
        'Level-3 mapped satellite radiometer files retrieved via NASA Common Metadata Repository (CMR) and OB.DAAC/PO.DAAC HTTPS REST APIs. Raw HDF/NetCDF datasets parsed for calibrated geophysical variables.',
      simple:
        'We retrieve real satellite measurements directly from NASA official data centers without modifying the original satellite sensor readings.',
    },
    {
      num: '02',
      title: 'Quality Control & Masking',
      scientific:
        'Strict bitwise quality flag enforcement: for SST, qual_sst=0 (good); for Chlorophyll-a, exclusion of cloud-covered pixels, high solar zenith (>70°), stray light, and turbid coastal Case-2 flags.',
      simple:
        'We filter out clouds, satellite glare, and dirty coastal sediments so only clear, reliable ocean measurements are used.',
    },
    {
      num: '03',
      title: 'Spatial Harmonization',
      scientific:
        'Reprojection of sinusoidal and along-track swaths onto a uniform 4.63 km equidistant cylindrical grid. Bounding box coordinates define regional study domains.',
      simple:
        'We line up measurements from different satellites into matching geographic ocean regions so they can be compared fairly.',
    },
    {
      num: '04',
      title: 'Temporal Harmonization',
      scientific:
        'Monthly compositing of daily daytime swaths using observation-weighted arithmetic means to minimize diurnal heating bias while maximizing valid spatial coverage.',
      simple:
        'Daily measurements are grouped into monthly averages to smooth out daily weather changes while tracking long-term shifts.',
    },
    {
      num: '05',
      title: 'Baseline Climatology Construction',
      scientific:
        'Establishment of a 19-year reference climatology (2002–2020). For each calendar month m ∈ [1, 12], the long-term climatological mean C(m) is computed across the historical record.',
      simple:
        'We calculate what the normal temperature was for every month between 2002 and 2020 to serve as our scientific yardstick.',
    },
    {
      num: '06',
      title: 'Deseasonalized Anomaly Generation',
      scientific:
        'Monthly anomalies A(y, m) = X(y, m) - C(m). This removes the cyclical seasonal amplitude, isolating anthropogenic thermodynamic and biogeochemical drift.',
      simple:
        'We subtract the normal seasonal cycle (summer heating vs winter cooling) so we can see if the ocean is actually warming overall.',
    },
    {
      num: '07',
      title: 'Trend Estimation (OLS & Sen’s Slope)',
      scientific:
        'Ordinary Least Squares regression determines slope β with standard error. Concurrently, non-parametric Sen’s slope estimator evaluates the median of all pairwise gradients to guard against outlier bias.',
      simple:
        'We draw mathematical trend lines using two different methods to make sure a single hot summer does not distort the true long-term direction.',
    },
    {
      num: '08',
      title: 'Statistical Significance (Mann-Kendall)',
      scientific:
        'Non-parametric Mann-Kendall test computes test statistic S and standardized Z-score. Two-tailed p-value tests null hypothesis H₀: no monotonic trend at α = 0.05.',
      simple:
        'A formal scientific test checks whether the rise is too big and consistent to be a random fluke. If p < 0.05, we are 95% confident it is a real trend.',
    },
    {
      num: '09',
      title: 'Cross-Variable Correlation',
      scientific:
        'Parametric Pearson r and non-parametric Spearman rank ρ assess co-occurrence without presuming causal directionality. Explicit caveat against confusing correlation with causation.',
      simple:
        'We compare how temperature and algae move together, while making sure never to claim one caused the other without physical proof.',
    },
    {
      num: '10',
      title: 'Scientific Traceability & Provenance',
      scientific:
        'Every visualization maintains atomic metadata bindings: satellite sensor, calibration version (e.g. R2022.0), DOI, ATBD documentation URL, and DAAC publisher citation.',
      simple:
        'Every single number and chart can be traced directly back to the official NASA satellite mission and scientific paper.',
    },
  ];

  return (
    <div className="w-full bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Title & View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-700" />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Methodology & Scientific Pipeline
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              End-to-end analytical architecture: from raw satellite radiances to quality control, deseasonalization, and non-parametric hypothesis testing.
            </p>
          </div>

          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('scientific')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'scientific'
                  ? 'bg-white text-cyan-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Scientific View</span>
            </button>
            <button
              onClick={() => setViewMode('simple')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'simple'
                  ? 'bg-white text-cyan-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Simple View (Plain Language)</span>
            </button>
          </div>
        </div>

        {/* 10-Step Pipeline Grid */}
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start gap-5 hover:border-slate-300 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 font-extrabold text-lg flex items-center justify-center shrink-0">
                {step.num}
              </div>
              <div className="flex-1 space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {viewMode === 'scientific' ? step.scientific : step.simple}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Strict Limitations Section */}
        <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold">Documented Scientific & Sensor Limitations</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            In accordance with open science practices and NASA data standards, Ocean Trace explicitly publishes known limitations of remote sensing observations:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-semibold">1. Skin vs Bulk Temperature</strong>
              <p className="text-slate-600 leading-relaxed">
                Infrared radiometers on Aqua MODIS detect radiative emissions from the top 10–20 micrometers (ocean skin). While tightly coupled to bulk upper mixed layer temperatures, diurnal stratification can create slight daytime offsets.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-semibold">2. Ocean Color & Phytoplankton Proxies</strong>
              <p className="text-slate-600 leading-relaxed">
                Chlorophyll-a is an optical pigment concentration estimate, not a direct count of total biomass or deep subsurface chlorophyll maxima. Turbid coastal river discharge can also scatter light and elevate optical readings.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-semibold">3. Short Operational Records (SWOT & PACE)</strong>
              <p className="text-slate-600 leading-relaxed">
                Satellites launched within the past 1–3 years (e.g. SWOT in 2022, PACE in 2024) lack sufficient temporal baseline for multi-decadal trend analysis and are classified strictly as SHORT-RECORD context.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-semibold">4. Cloud Obstruction & Gap Handling</strong>
              <p className="text-slate-600 leading-relaxed">
                Infrared and optical sensors cannot penetrate cloud cover. Persistent monsoonal cloudiness (such as during the peak southwest monsoon in the Bay of Bengal) creates missing pixels that must not be blindly interpolated.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
