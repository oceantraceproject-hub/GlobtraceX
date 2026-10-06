import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { GlobTraceLogo } from './GlobTraceLogo';
import { ShieldCheck, ExternalLink, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-[#fbfaff] text-slate-600 text-xs border-t border-purple-100 mt-auto font-['Manrope']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Purpose */}
          <div className="lg:col-span-2 space-y-3">
            <GlobTraceLogo variant="full" size="md" />

            <p className="text-purple-700 font-mono text-xs uppercase tracking-wider font-bold">
              TRACE EARTH. REVEAL THE CHANGE.
            </p>

            <p className="text-slate-600 text-xs leading-relaxed max-w-md">
              A scientific Earth-system trend investigation platform by Team Protichamp. Combining authentic NASA Earth-observation satellite data with deterministic non-parametric Theil-Sen regression and Mann-Kendall hypothesis testing.
            </p>

            {/* Official Independent Project Disclaimer */}
            <div className="pt-2 flex items-start gap-2.5 text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-purple-100 max-w-md">
              <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span>
                <strong>Official Disclaimer:</strong> GlobTraceX is an independent student project developed by Team Protichamp for the NASA Space Apps Challenge 2026, Challenge 02: “Be An Earth System Trend Detective!” Not an official NASA product or endorsement.
              </span>
            </div>
          </div>

          {/* Scientific Workflows */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Workflows
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/investigate')}
                  className="hover:text-purple-700 transition-colors"
                >
                  Trend Investigation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/compare')}
                  className="hover:text-purple-700 transition-colors"
                >
                  Two-District Comparison
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/datasets')}
                  className="hover:text-purple-700 transition-colors"
                >
                  NASA Data Registry
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/datasets/hot-humid-days')}
                  className="hover:text-purple-700 transition-colors text-purple-700 font-bold"
                >
                  Hot &amp; Humid Days (Derived)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/atlas')}
                  className="hover:text-purple-700 transition-colors"
                >
                  Spatiotemporal Atlas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/references')}
                  className="hover:text-purple-700 transition-colors"
                >
                  Scientific References
                </button>
              </li>
            </ul>
          </div>

          {/* NASA Data Missions */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              NASA Missions
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://power.larc.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-700 flex items-center gap-1 transition-colors"
                >
                  <span>NASA POWER</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://modis.gsfc.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-700 flex items-center gap-1 transition-colors"
                >
                  <span>MODIS Terra & Aqua</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://gpm.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-700 flex items-center gap-1 transition-colors"
                >
                  <span>GPM IMERG (GES DISC)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://grace.jpl.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-700 flex items-center gap-1 transition-colors"
                >
                  <span>GRACE / GRACE-FO (PO.DAAC)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Project & Team */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Project
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-purple-700 transition-colors"
                >
                  About GlobTraceX
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/team')}
                  className="hover:text-purple-700 transition-colors"
                >
                  Team Protichamp
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/auth')}
                  className="hover:text-purple-700 transition-colors"
                >
                  Researcher Sign In
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-purple-100 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div>
            GlobTraceX • NASA Space Apps Challenge 2026 Submission • Team Protichamp
          </div>
          <div className="flex items-center gap-4">
            <span>Deterministic Analysis Engine</span>
            <span>•</span>
            <span>100% Traceable NASA Earthdata</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
