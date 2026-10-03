import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  BookOpen,
  ExternalLink,
  ShieldCheck,
  FileText,
  Calculator,
  Layers,
  MapPin,
} from 'lucide-react';

export const ReferencesPage: React.FC = () => {
  const { t } = useLanguage();

  const references = [
    {
      category: 'Statistical Climatology & Non-Parametric Estimation',
      items: [
        {
          citation: 'Mann, H. B. (1945). Nonparametric tests against trend. Econometrica: Journal of the Econometric Society, 13(3), 245-259.',
          doi: '10.2307/1907187',
          description: 'The mathematical foundation of the rank-based test for monotonic trends in time-series data without assuming normality.',
        },
        {
          citation: 'Kendall, M. G. (1975). Rank Correlation Methods. 4th Edition, Charles Griffin, London.',
          doi: '10.2307/2332828',
          description: 'Formulation of ties correction in S-score variance and standardized normal Z-distribution approximation.',
        },
        {
          citation: 'Sen, P. K. (1968). Estimates of the regression coefficient based on Kendall’s tau. Journal of the American Statistical Association, 63(324), 1379-1389.',
          doi: '10.1080/01621459.1968.10480934',
          description: 'Non-parametric median pairwise slope estimator robust to extreme observational outliers and skewed distributions.',
        },
        {
          citation: 'Gilbert, R. O. (1987). Statistical Methods for Environmental Pollution Monitoring. John Wiley & Sons, New York.',
          doi: '10.1002/bimj.4710300713',
          description: 'Rank-order methodology for exact two-tailed 95% confidence interval bounds on Theil-Sen regression slopes.',
        },
      ],
    },
    {
      category: 'NASA Earth-Observation Data Products & ATBD Guides',
      items: [
        {
          citation: 'Wan, Z., Hook, S., & Hulley, G. (2021). MODIS/Terra Land Surface Temperature/Emissivity Monthly L3 Global 0.05Deg CMG V061. NASA EOSDIS Land Processes DAAC.',
          doi: '10.5067/MODIS/MOD11C3.061',
          description: 'Algorithm Theoretical Basis Document (ATBD) for split-window thermal infrared daytime LST retrieval.',
        },
        {
          citation: 'Huffman, G. J., Bolvin, D. T., Braithwaite, D., Hsu, K., Joyce, R., Kidd, C., Nelkin, E. J., Sorooshian, S., Tan, J., & Xie, P. (2023). NASA Global Precipitation Measurement (GPM) Integrated Multi-satellitE Retrievals for GPM (IMERG) Version 07. NASA GES DISC.',
          doi: '10.5067/GPM/IMERG/3B-MONTH/07',
          description: 'Intercalibration of microwave constellation radiances, dual-frequency radar, and GPCC ground rain gauge networks.',
        },
        {
          citation: 'Didan, K. (2021). MODIS/Terra Vegetation Indices Monthly L3 Global 0.05Deg CMG V061. NASA EOSDIS Land Processes DAAC.',
          doi: '10.5067/MODIS/MOD13C2.061',
          description: 'Maximum value composited red and near-infrared reflectance indices for terrestrial photosynthesis monitoring.',
        },
        {
          citation: 'Tapley, B. D., Watkins, M. M., Flechtner, F., Reigber, C., Bettadpur, S., Rodell, M., Sasgen, I., Famiglietti, J. S., Landerer, F. W., et al. (2019). Contributions of GRACE to understanding climate change. Nature Climate Change, 9(5), 358-369.',
          doi: '10.1038/s41558-019-0456-2',
          description: 'Satellite gravimetry retrieval of terrestrial water storage anomalies and regional aquifer depletion signals.',
        },
      ],
    },
    {
      category: 'Geographic Boundaries & Cartographic Baselines',
      items: [
        {
          citation: 'Natural Earth & UN Cartographic Section (2024). Global Country & Sovereign State Boundaries (1:10m Physical & Cultural Vector Dataset).',
          doi: '10.1016/j.ecoinf.2023.102148',
          description: 'Official global sovereign country boundary polygons and geographic coordinate reference baselines.',
        },
        {
          citation: 'GADM Database of Global Administrative Areas (2022). GADM Version 4.1 Global and Bangladesh Administrative Boundaries.',
          doi: '10.1016/j.ecoinf.2012.03.007',
          description: 'Official administrative boundary shapefiles for nations, provinces, divisions, and districts.',
        },
        {
          citation: 'NASA SEDAC (Socioeconomic Data and Applications Center) (2020). Global Low Elevation Coastal Zone (LECZ) Urban-Rural Population and Land Area Estimates.',
          doi: '10.7927/d36h-f522',
          description: 'Elevation thresholding and coastal exposure indexing for the deltaic coastal zone.',
        },
      ],
    },
  ];

  return (
    <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold font-mono">
            <BookOpen className="w-3.5 h-3.5" />
            <span>SCIENTIFIC DOCUMENTATION & CITATIONS</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Scientific References & Methodology
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Every mathematical algorithm, statistical equation, and NASA Earth-observation dataset utilized by GlobTraceX is fully documented and peer-reviewed.
          </p>
        </div>

        {/* References by Category */}
        <div className="space-y-8">
          {references.map((section, sIdx) => (
            <div key={sIdx} className="space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-mono border-b border-purple-100 pb-2">
                <span className="text-purple-700">0{sIdx + 1}.</span>
                <span>{section.category}</span>
              </h2>

              <div className="space-y-3">
                {section.items.map((ref, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-2 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-xs font-extrabold text-slate-900 leading-relaxed font-sans">
                        {ref.citation}
                      </p>
                      <a
                        href={`https://doi.org/${ref.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                        title="Open DOI"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {ref.description}
                    </p>

                    <div className="text-[11px] font-mono text-purple-700 font-semibold pt-1">
                      DOI: https://doi.org/{ref.doi}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
