import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import {
  ShieldCheck,
  User,
  LogOut,
  Bookmark,
  Trash2,
  ExternalLink,
  ArrowRight,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface SavedInvestigation {
  id: string;
  countryCode: string;
  countryName: string;
  variable: string;
  variableName: string;
  slopePerDecade: number;
  unit: string;
  significant: boolean;
  pValue: number;
  timestamp: string;
  memberNumber?: string;
}

interface ProfilePageProps {
  onNavigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, memberNumber, signOut } = useAuth();
  const [investigations, setInvestigations] = useState<SavedInvestigation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, 'users', user.uid, 'savedInvestigations'), orderBy('timestamp', 'desc'));
      const unsub = onSnapshot(
        q,
        (snap) => {
          const list: SavedInvestigation[] = [];
          snap.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          setInvestigations(list);
          setLoading(false);
        },
        (err) => {
          console.warn('Could not listen to saved investigations:', err);
          setLoading(false);
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Error loading saved investigations:', err);
      setLoading(false);
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'savedInvestigations', id));
    } catch (err) {
      console.error('Failed to delete investigation:', err);
    }
  };

  if (!user) {
    return (
      <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen py-16 px-4 flex items-center justify-center font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-purple-100 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto border border-purple-200">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Researcher Profile Required</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Sign in to access your official member card, sequential investigator ID, and cloud-saved planetary investigations.
          </p>
          <button
            onClick={() => onNavigate('/auth')}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-xs"
          >
            Sign In / Register →
          </button>
        </div>
      </div>
    );
  }

  const activeNumber = memberNumber || 'GTX-M-0100';

  return (
    <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen py-12 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-[11px] font-mono font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              <span>OFFICIAL RESEARCHER CREDENTIAL</span>
            </div>
            <h1 className="text-3xl font-black text-slate-950 tracking-tight mt-1">
              GlobTraceX Member Profile
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/investigate')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <span>Investigation Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={signOut}
              className="px-3 py-2 rounded-xl border border-purple-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Official Member Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-900 via-[#49318F] to-purple-950 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded bg-purple-800/80 border border-purple-700 text-purple-200 font-bold">
                  NASA SPACE APPS CHALLENGE 2026
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-mono font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Investigator
                </span>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-purple-100">
                  GlobTraceX Member — {activeNumber}
                </div>
                <div className="text-xs text-purple-200 font-mono mt-1">
                  {user.email} · Registered Research Node
                </div>
              </div>

              <p className="text-xs text-purple-200/80 leading-relaxed font-sans">
                Authorized for global multi-satellite trend analysis, Theil-Sen regression derivation, and evidence passport certification across all 73 sovereign Earth regions.
              </p>
            </div>

            {/* QR / Token Stamp */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-1 font-mono text-xs shrink-0">
              <div className="text-[10px] text-purple-200 uppercase font-bold tracking-wider">
                MEMBER ID
              </div>
              <div className="text-lg font-black text-white">{activeNumber}</div>
              <div className="text-[9px] text-purple-300">Atomic Sequence</div>
            </div>
          </div>
        </div>

        {/* Saved Investigations Workspace */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-purple-700" />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Saved Investigations ({investigations.length})
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Synced to Firestore Cloud Storage
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-slate-400 bg-white rounded-2xl border border-purple-100">
              Loading investigations...
            </div>
          ) : investigations.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-purple-100 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
                <Bookmark className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-slate-900">No Saved Investigations Yet</div>
              <p className="text-xs text-slate-500 font-sans max-w-md mx-auto leading-relaxed">
                Open the Earth System Trend Investigation Lab, analyze any country or variable, and click "Save Session" to archive your findings here.
              </p>
              <button
                onClick={() => onNavigate('/investigate')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-xs"
              >
                Start an Investigation →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investigations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                        {inv.countryCode} · {inv.variable.toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          inv.significant
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {inv.significant ? 'Significant' : 'Not Significant'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {inv.countryName}
                      </h3>
                      <div className="text-xs font-mono text-purple-900 font-bold mt-0.5">
                        {inv.variableName}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#fafaff] border border-purple-100 space-y-1 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Theil-Sen Slope:</span>
                        <strong className="text-purple-900">
                          {inv.slopePerDecade > 0 ? `+${inv.slopePerDecade}` : inv.slopePerDecade} {inv.unit}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">p-value:</span>
                        <strong className="text-slate-800">
                          p {inv.pValue < 0.001 ? '< 0.001' : `= ${inv.pValue}`}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(inv.timestamp).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete saved session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onNavigate('/investigate')}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-mono font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <span>Reopen</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
