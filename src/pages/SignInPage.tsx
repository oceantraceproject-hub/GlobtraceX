import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogIn, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';

export const SignInPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, error, clearError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  // If already signed in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      onNavigate('/dashboard');
    }
  }, [user, onNavigate]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      onNavigate('/dashboard');
    } catch (err) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
      onNavigate('/dashboard');
    } catch (err) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-12 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 mx-auto mb-2">
            <LogIn className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {isRegister ? 'Create Researcher Account' : 'Sign In to Ocean Trace'}
          </h2>
          <p className="text-xs text-slate-300">
            Save investigations, export datasets, and access personal research bookmarks.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="font-bold ml-2">×</button>
            </div>
          )}

          {/* Primary Action: Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2.5 active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2 text-[11px] text-slate-400 uppercase tracking-wider font-mono absolute">
              Or with email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@institution.org"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs shadow-xs transition-colors mt-2"
            >
              {loading ? 'Please wait...' : isRegister ? 'Register Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle Register / Sign In */}
          <div className="pt-2 text-center text-xs text-slate-500">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => setIsRegister(false)}
                  className="text-cyan-700 font-bold hover:underline"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Need an account?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-cyan-700 font-bold hover:underline"
                >
                  Register here
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
