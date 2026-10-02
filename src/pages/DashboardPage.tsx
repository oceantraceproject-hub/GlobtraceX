import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SavedInvestigation, SavedComparison } from '../types/nasa';
import { db } from '../lib/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import {
  Bookmark,
  GitCompare,
  Trash2,
  ExternalLink,
  Layers,
  ArrowRight,
  User as UserIcon,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export const DashboardPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [investigations, setInvestigations] = useState<SavedInvestigation[]>([]);
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Fetch saved investigations
      const invRef = collection(db, 'users', user.uid, 'savedInvestigations');
      const invSnap = await getDocs(invRef);
      const invList: SavedInvestigation[] = [];
      invSnap.forEach((d) => invList.push(d.data() as SavedInvestigation));
      setInvestigations(invList);

      // Fetch saved comparisons
      const compRef = collection(db, 'users', user.uid, 'savedComparisons');
      const compSnap = await getDocs(compRef);
      const compList: SavedComparison[] = [];
      compSnap.forEach((d) => compList.push(d.data() as SavedComparison));
      setComparisons(compList);
    } catch (err) {
      console.warn('Error fetching user saved items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleDeleteInvestigation = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'savedInvestigations', id));
      setInvestigations((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleDeleteComparison = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'savedComparisons', id));
      setComparisons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 shadow-md text-center space-y-4">
        <UserIcon className="w-10 h-10 text-cyan-700 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sign In to View Dashboard</h2>
        <p className="text-xs text-slate-500">
          Sign in to access your personal research workspace, saved ocean investigations, and cross-variable comparisons.
        </p>
        <button
          onClick={() => onNavigate('/sign-in')}
          className="w-full py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs shadow-xs transition-colors"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-lg">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {user.displayName || 'Research Workspace'}
              </h1>
              <p className="text-xs text-slate-500 font-mono">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/explore')}
              className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>New Exploration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Saved Investigations */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-cyan-700" />
              <h2 className="text-base font-bold text-slate-900">
                My Saved Investigations ({investigations.length})
              </h2>
            </div>
          </div>

          {investigations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No saved investigations yet. Explore an ocean region on the{' '}
              <button
                onClick={() => onNavigate('/explore')}
                className="text-cyan-700 font-bold hover:underline"
              >
                Explore page
              </button>{' '}
              and click "Save Investigation".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investigations.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 text-sm">{inv.title}</span>
                      <button
                        onClick={() => handleDeleteInvestigation(inv.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Period: {inv.timeRange}
                    </div>
                    <div className="text-cyan-800 font-semibold font-mono mt-1">
                      Trend: {inv.trendEstimate}
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed">{inv.statisticalResult}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Saved: {new Date(inv.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => onNavigate('/explore')}
                      className="text-cyan-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Open in Explorer</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Comparisons */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-cyan-700" />
              <h2 className="text-base font-bold text-slate-900">
                My Saved Comparisons ({comparisons.length})
              </h2>
            </div>
          </div>

          {comparisons.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No saved comparisons yet. Run a cross-variable comparison on the{' '}
              <button
                onClick={() => onNavigate('/compare')}
                className="text-cyan-700 font-bold hover:underline"
              >
                Compare page
              </button>{' '}
              and click "Save Comparison".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparisons.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 text-sm">{comp.title}</span>
                      <button
                        onClick={() => handleDeleteComparison(comp.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Period: {comp.timeRange}
                    </div>
                    <div className="text-emerald-800 font-semibold font-mono mt-1">
                      Correlation: {comp.correlation}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Saved: {new Date(comp.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => onNavigate('/compare')}
                      className="text-cyan-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Open in Compare</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
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
