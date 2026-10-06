import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 'talha',
    name: 'Abdullahil Baki Talha',
    role: 'Team Lead',
  },
  {
    id: 'riyad',
    name: 'Tanzin Rahman Riyad',
    role: 'Lead Developer',
  },
  {
    id: 'fatiha',
    name: 'Sayeda Isma Fatiha',
    role: 'Data Analyst',
  },
  {
    id: 'usha',
    name: 'Moumita Ehasan Usha',
    role: 'Research & Communications Lead',
  },
];

export const TeamPage: React.FC = () => {
  return (
    <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center max-w-2xl mx-auto space-y-4"
        >
          <span className="text-[11px] font-mono tracking-widest uppercase text-purple-700 font-bold">
            PROJECT TEAM • GLOBTRACEX
          </span>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            Team Protichamp
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
            The multidisciplinary research and development team behind GlobTraceX.
          </p>
        </motion.div>

        {/* Four Minimal, Elegant Member Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
              whileHover={{ y: -4 }}
              className="group relative bg-white rounded-3xl p-7 border border-purple-100/80 shadow-xs hover:shadow-lg hover:border-purple-300 transition-all duration-300 flex flex-col items-center text-center space-y-5"
            >
              {/* Neutral Abstract Avatar Placeholder */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-purple-50 to-slate-100 border border-purple-100 flex items-center justify-center text-slate-400 group-hover:text-purple-600 group-hover:border-purple-200 transition-colors">
                <svg
                  className="w-12 h-12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              {/* Name & Role */}
              <div className="space-y-1.5 w-full">
                <h3 className="text-base font-extrabold text-slate-950 tracking-tight group-hover:text-purple-900 transition-colors">
                  {member.name}
                </h3>
                <p className="text-xs font-mono text-purple-700 font-semibold tracking-wide">
                  {member.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Minimal Charter Citation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-6 border-t border-purple-100/70 text-center text-xs text-slate-500 font-mono space-y-1"
        >
          <p>GlobTraceX • Developed by Team Protichamp</p>
          <p className="text-[11px] text-slate-400">NASA Space Apps Challenge 2026 • Challenge 02: Be An Earth System Trend Detective!</p>
        </motion.div>
      </div>
    </div>
  );
};
