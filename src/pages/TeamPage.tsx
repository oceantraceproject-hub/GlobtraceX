import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Award,
  ShieldCheck,
  UserPlus,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const TeamPage: React.FC = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  // Team records left empty per instructions. No fabricated people.
  const teamMembers: any[] = [];

  return (
    <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold font-mono">
            <Award className="w-3.5 h-3.5" />
            <span>NASA SPACE APPS CHALLENGE 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Team Protichamp
          </h1>
          <p className="text-purple-700 font-mono text-xs uppercase tracking-widest font-bold">
            CHALLENGE 02: BE AN EARTH SYSTEM TREND DETECTIVE!
          </p>
        </div>

        {/* Project Statement Card */}
        <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-3">
          <h2 className="text-base font-extrabold text-slate-900 font-mono flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Independent Student Research Team</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Team Protichamp is an interdisciplinary student research team uniting software engineering, statistical climatology, geospatial information systems (GIS), and Earth-observation data science. GlobTraceX represents our submission to investigate multi-decadal planetary environmental signals with transparent provenance and mathematical integrity.
          </p>
        </div>

        {/* Team Members Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              RESEARCH TEAM MEMBERS
            </h3>
            {isAdmin && (
              <span className="text-xs font-mono text-purple-700 font-bold">
                Admin Mode: Manage members in /admin
              </span>
            )}
          </div>

          {teamMembers.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-purple-100 shadow-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-sm font-extrabold text-slate-900">
                  Team Protichamp Roster
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-mono">
                  Official team member profiles will be configured by team administrators prior to final submission judging. All scientific contributions adhere to the NASA Space Apps honor code and open-source licensing.
                </p>
              </div>

              {isAdmin && (
                <div className="pt-2">
                  <a
                    href="/admin"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Member Profile</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Member cards rendered here when populated */}
            </div>
          )}
        </div>

        {/* Scientific Integrity Guarantee */}
        <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs text-slate-700 leading-relaxed flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-900 block">Scientific Integrity Commitment</span>
            <p className="text-slate-600 text-[11px]">
              Team Protichamp guarantees that no numbers, slopes, p-values, or dataset identifiers in GlobTraceX are synthetic or AI-hallucinated. Every result reflects genuine, reproducible calculations from authentic NASA telemetry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
