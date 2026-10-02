import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

interface AuthPageProps {
  onNavigate: (route: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, signOut } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        onNavigate('/investigate');
      } else if (mode === 'signup') {
        await signUpWithEmail(email, password);
        onNavigate('/investigate');
      } else {
        await resetPassword(email);
        setMessage('Password reset instructions have been sent to your email.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onNavigate('/investigate');
    } catch (err: any) {
      setError(err?.message || 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#fafaff] text-slate-900 min-h-screen py-16 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-purple-100 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-700 text-white font-black text-sm flex items-center justify-center mx-auto shadow-sm">
            GTX
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {user ? 'Researcher Profile' : mode === 'signin' ? 'Sign In to GlobTraceX' : mode === 'signup' ? 'Create Researcher Account' : 'Reset Password'}
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            {user ? 'Authenticated Session Active' : 'Access saved investigations and audit logs'}
          </p>
        </div>

        {/* User Already Signed In State */}
        {user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs font-mono space-y-1">
              <div className="text-slate-500">Authenticated Email:</div>
              <div className="text-sm font-bold text-purple-900">{user.email}</div>
              <div className="text-[10px] text-slate-400">UID: {user.uid}</div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => onNavigate('/investigate')}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Go to Investigation Lab</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={signOut}
                className="w-full py-2.5 rounded-xl border border-purple-200 text-slate-700 hover:bg-purple-50 font-semibold text-xs transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Feedback Notifications */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Google Authentication Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-purple-50/50 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-2xs active:scale-98"
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

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-purple-100" />
              <span className="flex-shrink mx-3 text-slate-400 text-[10px] font-mono uppercase">Or with email</span>
              <div className="flex-grow border-t border-purple-100" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@university.edu"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-purple-100 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none font-mono"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-purple-100 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
              >
                <span>{mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}</span>
              </button>
            </form>

            {/* Form Mode Toggle Footer */}
            <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500">
              {mode === 'signin' ? (
                <>
                  <button
                    onClick={() => setMode('forgot')}
                    className="text-purple-700 hover:underline"
                  >
                    Forgot Password?
                  </button>
                  <button
                    onClick={() => setMode('signup')}
                    className="text-purple-700 font-bold hover:underline"
                  >
                    Sign Up →
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setMode('signin')}
                  className="w-full text-center text-purple-700 font-bold hover:underline"
                >
                  Already have an account? Sign In →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
