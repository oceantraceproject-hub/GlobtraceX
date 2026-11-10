import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Award, Sparkles, Globe, Cpu, Database, BookOpen, CheckCircle2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  objectPosition: string;
  focus: string;
  badge: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 'talha',
    name: 'Abdullahil Baki Talha',
    role: 'Team Lead',
    image: '/assets/aistudio/4A1D9AA2-7BFF-4B0B-B1C9-021421492A4E_60e1f5fb.png',
    objectPosition: 'object-[center_22%]',
    focus: 'Planetary Geospatial Strategy, Scientific Direction & Research Coordination',
    badge: 'Project Lead',
  },
  {
    id: 'riyad',
    name: 'Tanzin Rahman Riyad',
    role: 'Lead Developer',
    image: '/assets/aistudio/74A04688-0F0B-4E98-9D1D-76BF0DB20F09_374fb2c3.png',
    objectPosition: 'object-[center_25%]',
    focus: 'Full-Stack Architecture, 2D Vector Mapping Engine & Non-Parametric Algorithms',
    badge: 'Core Architecture',
  },
  {
    id: 'fatiha',
    name: 'Sayeda Isma Fatiha',
    role: 'Data Analyst',
    image: '/assets/aistudio/5dc5f31a-ab1e-415f-8860-443eabafe83c_c2b7c0e9.jpeg',
    objectPosition: 'object-[center_22%]',
    focus: 'Multi-Satellite Telemetry Analysis, Trend Verification & Climatological Baselines',
    badge: 'Data Modeling',
  },
  {
    id: 'usha',
    name: 'Moumita Ehasan Usha',
    role: 'Research & Communications Lead',
    image: '/assets/aistudio/4ffe7b2f-594a-437b-a968-1537c71c882b_7e55022b.jpeg',
    objectPosition: 'object-[center_20%]',
    focus: 'Environmental Impact Synthesis, Scientific Documentation & Public Outreach',
    badge: 'Scientific Research',
  },
];

export const TeamPage: React.FC = () => {
  return (
    <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen py-14 sm:py-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold font-mono shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse shrink-0" />
            <span>NASA SPACE APPS CHALLENGE 2026 • CHALLENGE 02</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            Team Protichamp
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto">
            Meet the multidisciplinary research and engineering team behind <strong className="text-purple-900 font-semibold">GlobTraceX</strong> — united to transform complex NASA Earth-observation telemetry into actionable, transparent, and statistically verified planetary intelligence.
          </p>
        </motion.div>

        {/* Four Distinctive, Elegantly Framed Team Member Profiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 items-stretch">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
              whileHover={{ y: -6 }}
              className="group bg-white rounded-3xl p-5 border border-purple-100 shadow-xs hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Refined Image Container with Balanced 4:5 Aspect Ratio */}
                <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border border-purple-100 relative shadow-2xs group-hover:shadow-md transition-shadow">
                  <img
                    src={member.image}
                    alt={member.name}
                    className={`w-full h-full object-cover ${member.objectPosition} group-hover:scale-104 transition-transform duration-500 ease-out`}
                    loading="lazy"
                  />
                  {/* Subtle Gradient Shade at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />
                </div>

                {/* Name & Role Section */}
                <div className="space-y-1 pt-1 text-center sm:text-left">
                  <h2 className="text-lg font-black text-slate-950 tracking-tight leading-snug group-hover:text-purple-900 transition-colors">
                    {member.name}
                  </h2>
                  <p className="text-xs font-mono font-bold text-purple-700 tracking-wider uppercase">
                    {member.role}
                  </p>
                </div>

                {/* Focus Description */}
                <p className="text-xs text-slate-600 leading-relaxed font-sans text-center sm:text-left">
                  {member.focus}
                </p>
              </div>

              {/* Verified Contributor Tag */}
              <div className="mt-5 pt-3.5 border-t border-purple-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-slate-500">Team Protichamp</span>
                <span className="flex items-center gap-1 text-purple-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Verified</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team Research Philosophy & Operational Pillars */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-purple-900 via-[#49318F] to-purple-950 text-white shadow-xl relative overflow-hidden space-y-8">
          <div className="absolute -right-12 -top-12 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-purple-200 font-bold px-3 py-1 rounded-full bg-purple-800/80 border border-purple-700/80 inline-block">
              OUR INVESTIGATIVE MISSION
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Science Over Speculation
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed font-sans">
              Team Protichamp designed GlobTraceX around four non-negotiable standards to ensure the platform serves as a credible, production-ready scientific research instrument.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
              <ShieldCheck className="w-5 h-5 text-purple-300" />
              <div className="text-xs font-bold text-white font-mono uppercase">1. Zero Mock Data</div>
              <p className="text-[11px] text-purple-200/80 leading-relaxed font-sans">
                Every calculation originates directly from authentic NASA Earth-observation datasets.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
              <Cpu className="w-5 h-5 text-purple-300" />
              <div className="text-xs font-bold text-white font-mono uppercase">2. Deterministic Math</div>
              <p className="text-[11px] text-purple-200/80 leading-relaxed font-sans">
                Theil-Sen median slopes and Mann-Kendall tests are mathematically computed without LLM fabrication.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
              <Globe className="w-5 h-5 text-purple-300" />
              <div className="text-xs font-bold text-white font-mono uppercase">3. Real Geometries</div>
              <p className="text-[11px] text-purple-200/80 leading-relaxed font-sans">
                Accurate boundaries across 73 sovereign nations and all 64 districts of Bangladesh.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
              <BookOpen className="w-5 h-5 text-purple-300" />
              <div className="text-xs font-bold text-white font-mono uppercase">4. Full Provenance</div>
              <p className="text-[11px] text-purple-200/80 leading-relaxed font-sans">
                Transparent DAAC lineage, instrument sensors, mission records, and uncertainty disclaimers.
              </p>
            </div>
          </div>
        </div>

        {/* Official Charter Citation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-6 border-t border-purple-100 text-center text-xs text-slate-500 font-mono space-y-1"
        >
          <p className="font-bold text-purple-900">GlobTraceX • Developed by Team Protichamp</p>
          <p className="text-[11px] text-slate-400">
            2026 NASA Space Apps Challenge • Challenge 02: “Be an Earth System Trend Detective!”
          </p>
        </motion.div>
      </div>
    </div>
  );
};
