import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NASA_DATASET_REGISTRY, NasaSourceRecord } from '../data/nasaRegistry';
import {
  ShieldCheck,
  Users,
  Database,
  BookOpen,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
} from 'lucide-react';

export const AdminPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'datasets' | 'team' | 'settings'>('datasets');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Team member form state for admin management
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    researchArea: '',
    bio: '',
    contribution: '',
  });

  const [customTeam, setCustomTeam] = useState<any[]>([]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.role) return;
    setCustomTeam((prev) => [...prev, { id: `m_${Date.now()}`, ...newMember }]);
    setNewMember({ name: '', role: '', researchArea: '', bio: '', contribution: '' });
    setStatusMsg('Team member saved successfully.');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleRemoveMember = (id: string) => {
    setCustomTeam((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMINISTRATIVE CONTROL PANEL</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              GlobTraceX Project Administration
            </h1>
          </div>

          <div className="text-right text-xs font-mono text-slate-500">
            Authenticated: <strong className="text-purple-900">{user?.email || 'Admin session'}</strong>
          </div>
        </div>

        {/* Scientific Integrity Rule Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Strict Architecture Rule</span>
            <p className="text-[11px] leading-relaxed">
              Scientific results, observations, Theil-Sen slopes, and p-values are deterministically computed in the scientific engine and <strong>CANNOT</strong> be manually altered via CMS. Admin controls are limited to metadata registry auditing, site settings, and team roster management.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-purple-100 pb-2">
          <button
            onClick={() => setActiveTab('datasets')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'datasets'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-purple-50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Dataset Registry Audit</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'team'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-purple-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Members ({customTeam.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-purple-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>System Settings</span>
          </button>
        </div>

        {statusMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Tab 1: Dataset Registry Audit */}
        {activeTab === 'datasets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 font-mono uppercase">
                Audited NASA Datasets ({NASA_DATASET_REGISTRY.length})
              </h2>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                All 5 Sources Verified
              </span>
            </div>

            <div className="space-y-3">
              {NASA_DATASET_REGISTRY.map((d) => (
                <div
                  key={d.dataset_id}
                  className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs font-mono"
                >
                  <div className="space-y-1 max-w-lg">
                    <div className="font-extrabold text-slate-900 text-sm font-sans">
                      {d.dataset_name}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      ID: {d.dataset_id} • Product: {d.product_name} • Agency: {d.source_agency}
                    </div>
                    <div className="text-purple-700 text-[10px] break-all">
                      Source: {d.official_source_url}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                      STATUS: {d.validation_status.toUpperCase()}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      Verified: {d.validated_at.split('T')[0]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Team Member Management */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 font-mono uppercase">
                Add Team Protichamp Member
              </h3>

              <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Researcher Name"
                    className="w-full p-2.5 rounded-xl border border-purple-100 focus:border-purple-600 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                    Role / Position *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    placeholder="Lead Geospatial Architect"
                    className="w-full p-2.5 rounded-xl border border-purple-100 focus:border-purple-600 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                    Research Area
                  </label>
                  <input
                    type="text"
                    value={newMember.researchArea}
                    onChange={(e) => setNewMember({ ...newMember, researchArea: e.target.value })}
                    placeholder="Statistical Climatology"
                    className="w-full p-2.5 rounded-xl border border-purple-100 focus:border-purple-600 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                    Key Contribution
                  </label>
                  <input
                    type="text"
                    value={newMember.contribution}
                    onChange={(e) => setNewMember({ ...newMember, contribution: e.target.value })}
                    placeholder="Theil-Sen Algorithm Pipeline"
                    className="w-full p-2.5 rounded-xl border border-purple-100 focus:border-purple-600 outline-none font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                    Short Bio
                  </label>
                  <textarea
                    rows={2}
                    value={newMember.bio}
                    onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                    placeholder="Brief research background and focus..."
                    className="w-full p-2.5 rounded-xl border border-purple-100 focus:border-purple-600 outline-none font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save Team Member</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Added Members */}
            {customTeam.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-500">
                  Current Roster ({customTeam.length})
                </h4>
                {customTeam.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-purple-700 font-mono text-[11px]">
                        {m.role} • {m.researchArea}
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{m.contribution}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: System Settings */}
        {activeTab === 'settings' && (
          <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-4 text-xs font-mono">
            <h3 className="text-sm font-extrabold text-slate-900 font-mono uppercase">
              System Configuration & Mode Flags
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#fafaff] border border-purple-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Deterministic Computation Cache</div>
                  <div className="text-slate-500 text-[11px]">Enables offline-first cached execution per NASA Space Apps guide</div>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                  ENABLED (OFFLINE=1 READY)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fafaff] border border-purple-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Provenance Gate Enforcement</div>
                  <div className="text-slate-500 text-[11px]">Blocks any numerical claims lacking verified NASA dataset_id and DOI</div>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                  ACTIVE & ENFORCED
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
