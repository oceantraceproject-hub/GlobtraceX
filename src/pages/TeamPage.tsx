import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Award,
  ShieldCheck,
  Compass,
  ArrowRight,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Terminal,
  BarChart2,
  FileText,
  Workflow,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  Search,
  BookOpen,
  Share2,
} from 'lucide-react';

import talhaPhoto from '../assets/images/team_lead_talha_1791027222139.jpg';
import riyadPhoto from '../assets/images/lead_dev_riyad_1791027235854.jpg';
import fatihaPhoto from '../assets/images/data_analyst_fatiha_1791027247160.jpg';
import ushaPhoto from '../assets/images/research_lead_usha_1791027262068.jpg';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  discipline: string;
  stepNumber: string;
  contributionPillar: string;
  bio: string;
  photoUrl: string;
  initials: string;
  color: string;
  badgeColor: string;
  responsibilities: string[];
  systemInput: string;
  systemOutput: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export const TeamPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState<string>('01');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Official Team Protichamp Roster
  const teamMembers: TeamMember[] = [
    {
      id: 'talha',
      name: 'Abdullahil Baki Talha',
      role: 'Team Lead',
      discipline: 'Project Direction & Systems Architecture',
      stepNumber: '01',
      contributionPillar: 'Project Direction',
      photoUrl: talhaPhoto,
      bio: 'Coordinates overall platform scope, systems integration, and alignment with NASA Earth-system science objectives. Directs project roadmap milestones and ensures continuous structural coherence across software engineering, data analysis, and scientific communication.',
      initials: 'ABT',
      color: 'from-purple-700 to-indigo-900',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
      responsibilities: [
        'Defines overall platform vision, architecture, and scope',
        'Ensures adherence to NASA Space Apps challenge scientific criteria',
        'Coordinates milestone delivery across engineering, analytics, and research',
        'Oversees systems integration between analytical models and client interfaces',
      ],
      systemInput: 'NASA Challenge Criteria & Mission Requirements',
      systemOutput: 'Platform Scope, Milestone Roadmap & Architecture Blueprint',
      githubUrl: 'https://github.com',
      linkedinUrl: 'https://linkedin.com',
    },
    {
      id: 'riyad',
      name: 'Tanzin Rahman Riyad',
      role: 'Lead Developer',
      discipline: 'Software Engineering & 3D Interactive Systems',
      stepNumber: '02',
      contributionPillar: 'Development',
      photoUrl: riyadPhoto,
      bio: 'Architects the WebGL 3D planetary visualization engine, deterministic analytical calculation pipeline, responsive interfaces, and client performance. Bridges complex multi-decadal geospatial data into fluid, accessible user interactions.',
      initials: 'TRR',
      color: 'from-indigo-600 to-purple-800',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
      responsibilities: [
        'Builds interactive Three.js / WebGL 3D planetary globe instrument',
        'Engineers deterministic in-browser statistical calculation pipelines',
        'Develops responsive, accessible user interfaces and visualization suites',
        'Optimizes client memory, geometry tessellation, and frame rates',
      ],
      systemInput: 'Architecture Blueprint & Statistical Formulation',
      systemOutput: 'Interactive 3D Engine, Fast Compute Pipeline & Interface',
      githubUrl: 'https://github.com',
      linkedinUrl: 'https://linkedin.com',
    },
    {
      id: 'fatiha',
      name: 'Sayeda Isma Fatiha',
      role: 'Data Analyst',
      discipline: 'Spatial Data Modeling & Statistical Rigor',
      stepNumber: '03',
      contributionPillar: 'Data Analysis',
      photoUrl: fatihaPhoto,
      bio: 'Formulates spatial aggregations across multi-sensor NASA Earth-observation datasets and validates non-parametric trend computation methodologies. Audits data completeness, variance ties, and statistical hypothesis testing.',
      initials: 'SIF',
      color: 'from-purple-800 to-violet-950',
      badgeColor: 'bg-violet-100 text-violet-900 border-violet-200',
      responsibilities: [
        'Formulates spatial aggregations across multi-sensor NASA datasets',
        'Implements Theil-Sen median slopes and Mann-Kendall rank tests',
        'Calculates variance tie corrections and 95% confidence intervals',
        'Audits observation completeness, missing values, and data validity',
      ],
      systemInput: 'Gridded Satellite Records & Demarcated Polygons',
      systemOutput: 'Validated Non-Parametric Statistics & Trend Verification',
      githubUrl: 'https://github.com',
      linkedinUrl: 'https://linkedin.com',
    },
    {
      id: 'usha',
      name: 'Moumita Ehasan Usha',
      role: 'Research & Communications Lead',
      discipline: 'Scientific Synthesis & Editorial Integrity',
      stepNumber: '04',
      contributionPillar: 'Research & Scientific Communication',
      photoUrl: ushaPhoto,
      bio: 'Directs literature synthesis, peer-reviewed methodology documentation, data provenance validation, and bilingual scientific communication. Ensures strict adherence to scientific accuracy without unsupported causal claims.',
      initials: 'MEU',
      color: 'from-violet-700 to-purple-900',
      badgeColor: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200',
      responsibilities: [
        'Verifies NASA Earthdata provenance, DAAC sources, and DOIs',
        'Synthesizes peer-reviewed citations for mathematical methodologies',
        'Reviews copy for scientific rigor, avoiding unsupported causal claims',
        'Maintains bilingual English and Bengali terminology accuracy',
      ],
      systemInput: 'Statistical Results & Technical Implementations',
      systemOutput: 'Peer-Reviewed Provenance Chain & Clear Scientific Communication',
      githubUrl: 'https://github.com',
      linkedinUrl: 'https://linkedin.com',
    },
  ];

  const selectedMember = teamMembers.find((m) => m.stepNumber === activeStep) || teamMembers[0];

  return (
    <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen py-10 sm:py-16 font-['Manrope']">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Editorial Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold font-mono tracking-wider shadow-2xs">
            <Award className="w-3.5 h-3.5 text-purple-700" />
            <span>NASA SPACE APPS CHALLENGE 2026 • CHALLENGE 02</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight font-['Space_Grotesk']">
            Team Protichamp
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            GlobTraceX is engineered through multidisciplinary collaboration: uniting project direction, software engineering, spatial data analysis, and scientific communication into one cohesive research platform.
          </p>
        </div>

        {/* The Complementary Four-Part System Flow */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 pb-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-purple-700 font-bold block">
                COMPLEMENTARY DISCIPLINES • ONE INTEGRATED SYSTEM
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 font-['Space_Grotesk']">
                How GlobTraceX is Built: From Direction to Scientific Evidence
              </h2>
            </div>
            <span className="text-xs font-mono text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 font-bold">
              Sequential Pipeline
            </span>
          </div>

          {/* Connected 4-Step Architecture Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamMembers.map((member, i) => {
              const isActive = activeStep === member.stepNumber;
              return (
                <div
                  key={member.id}
                  onClick={() => setActiveStep(member.stepNumber)}
                  className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isActive
                      ? 'bg-purple-900 text-white border-purple-900 shadow-lg ring-2 ring-purple-600/30'
                      : 'bg-[#fafaff] text-slate-900 border-purple-100 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isActive ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        STEP {member.stepNumber}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                          isActive ? 'text-purple-300' : 'text-slate-400'
                        }`}
                      >
                        {member.contributionPillar.split(' ')[0]}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-extrabold font-['Space_Grotesk'] tracking-tight ${
                        isActive ? 'text-white' : 'text-slate-950'
                      }`}
                    >
                      {member.role}
                    </h3>

                    <p
                      className={`text-xs font-bold font-mono truncate ${
                        isActive ? 'text-purple-200' : 'text-purple-900'
                      }`}
                    >
                      {member.name}
                    </p>

                    <p
                      className={`text-[11px] leading-relaxed line-clamp-3 ${
                        isActive ? 'text-purple-200/90' : 'text-slate-600'
                      }`}
                    >
                      {member.discipline}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-purple-200/30 flex items-center justify-between text-[11px] font-mono">
                    <span className={isActive ? 'text-purple-300 font-bold' : 'text-purple-700'}>
                      {isActive ? 'Active Pipeline Stage' : 'View Role Focus →'}
                    </span>
                  </div>

                  {i < 3 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-purple-300 font-black text-sm pointer-events-none">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interactive Pipeline Stage Detail Callout */}
          <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                <span className="text-xs font-mono font-bold text-purple-950 uppercase tracking-wider">
                  Stage {selectedMember.stepNumber}: {selectedMember.contributionPillar} in Action
                </span>
              </div>
              <span className="text-[11px] font-mono text-purple-700 font-semibold">
                Member: {selectedMember.name} ({selectedMember.role})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-white rounded-xl border border-purple-100 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                  System Input
                </span>
                <p className="text-slate-700 font-medium">{selectedMember.systemInput}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-purple-100 space-y-1">
                <span className="text-[10px] text-purple-600 uppercase tracking-wider block font-bold">
                  System Output
                </span>
                <p className="text-slate-900 font-bold">{selectedMember.systemOutput}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Official Team Member Profiles */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-purple-700 font-bold block">
                OFFICIAL RESEARCH ROSTER
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-['Space_Grotesk']">
                The Four Official Team Members
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500 font-bold bg-white px-3 py-1 rounded-full border border-purple-100">
              4 Multidisciplinary Leads
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member) => {
              const hasImgError = imageErrors[member.id];
              return (
                <div
                  key={member.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-sm hover:border-purple-300 transition-all duration-300 flex flex-col justify-between space-y-6 group"
                >
                  <div className="space-y-5">
                    {/* Header: Photo, Name & Role */}
                    <div className="flex items-start gap-4">
                      {/* Member Photo Frame */}
                      <div className="relative shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-md border-2 border-white ring-2 ring-purple-100 bg-slate-100 flex items-center justify-center">
                          {!hasImgError ? (
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                              onError={() => handleImageError(member.id)}
                            />
                          ) : (
                            <div
                              className={`w-full h-full bg-gradient-to-br ${member.color} text-white flex flex-col items-center justify-center font-['Space_Grotesk'] font-black`}
                            >
                              <span className="text-xl tracking-wider">{member.initials}</span>
                              <span className="text-[8px] font-mono tracking-widest uppercase opacity-80">
                                {member.stepNumber}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Sequence Badge */}
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-purple-950 text-purple-100 font-mono text-[9px] font-bold border border-white shadow-2xs">
                          {member.stepNumber}
                        </span>
                      </div>

                      {/* Name, Role & Discipline */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-mono font-bold border border-purple-200">
                          {member.role}
                        </div>

                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-950 font-['Space_Grotesk'] tracking-tight">
                          {member.name}
                        </h3>

                        <p className="text-xs font-mono text-purple-900 font-semibold leading-snug">
                          {member.discipline}
                        </p>
                      </div>
                    </div>

                    {/* Short Professional Role Description */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 font-bold block">
                        Official Project Role Description
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        {member.bio}
                      </p>
                    </div>

                    {/* Specific System Responsibilities */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                        Key Responsibilities in GlobTraceX
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {member.responsibilities.map((r, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                            <span className="leading-snug">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer with Role Status & Social Links */}
                  <div className="pt-4 border-t border-purple-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[11px] text-slate-600 font-medium">
                        Official Project Member
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {member.githubUrl && (
                        <a
                          href={member.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-purple-100 text-slate-600 hover:text-purple-800 transition-colors"
                          title={`${member.name} GitHub`}
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {member.linkedinUrl && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-purple-100 text-slate-600 hover:text-purple-800 transition-colors"
                          title={`${member.name} LinkedIn`}
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Multidisciplinary Collaboration Matrix */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest uppercase text-purple-700 font-bold block">
              COLLABORATION ARCHITECTURE
            </span>
            <h2 className="text-xl font-black text-slate-950 font-['Space_Grotesk']">
              Cross-Disciplinary Synergy in GlobTraceX
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              No single discipline can solve planetary trend investigation alone. Team Protichamp combines project direction, software engineering, spatial data analysis, and scientific communication into an interconnected workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {[
              {
                title: 'Direction → Engineering',
                subtitle: 'Vision to Implementation',
                desc: 'Project Lead guides the software engineer on modular system boundaries, client performance thresholds, and NASA Space Apps submission standards.',
                badge: 'System Architecture',
              },
              {
                title: 'Engineering → Data Analysis',
                subtitle: 'Pipeline to Computation',
                desc: 'Software Engineer and Data Analyst partner to translate mathematical Theil-Sen formulas and Mann-Kendall loops into fast, deterministic TypeScript routines.',
                badge: 'Algorithm Design',
              },
              {
                title: 'Data Analysis → Research',
                subtitle: 'Statistics to Provenance',
                desc: 'Data Analyst provides exact p-values, tie-corrected variances, and confidence bounds; Research Lead validates sensor documentation and peer-reviewed methods.',
                badge: 'Scientific Rigor',
              },
              {
                title: 'Research → Direction',
                subtitle: 'Evidence to Coherence',
                desc: 'Research Lead verifies that all platform claims strictly adhere to statistical correlation without implying unsupported causal assertions, feeding back to Project Direction.',
                badge: 'Integrity Audit',
              },
            ].map((col, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#fafaff] border border-purple-100 space-y-2 hover:border-purple-300 transition-colors"
              >
                <span className="text-[9px] font-mono uppercase tracking-wider text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded inline-block">
                  {col.badge}
                </span>
                <h4 className="text-xs font-black text-slate-900 font-['Space_Grotesk']">
                  {col.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {col.subtitle}
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {col.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Independent Student Project Charter Notice */}
        <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm flex flex-col sm:flex-row items-start gap-4">
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 text-xs">
            <h4 className="font-black text-slate-950 font-['Space_Grotesk'] text-sm">
              Official NASA Space Apps Challenge 2026 Student Charter
            </h4>
            <p className="text-slate-600 leading-relaxed font-sans">
              GlobTraceX is an independent student research project conceived and built by <strong>Team Protichamp</strong> for the NASA Space Apps Challenge 2026, competing in Challenge 02: “Be An Earth System Trend Detective!” All NASA datasets, satellite imagery, and mission references are utilized in accordance with official NASA open data distribution policies. GlobTraceX is developed independently and does not represent an official NASA website, agency product, or commercial endorsement.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] font-mono text-purple-900 font-bold">
              <span>Challenge 02: Be An Earth System Trend Detective!</span>
              <span>•</span>
              <span>Team: Team Protichamp</span>
              <span>•</span>
              <span>Platform: GlobTraceX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
