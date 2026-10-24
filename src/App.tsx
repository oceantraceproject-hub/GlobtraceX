import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';

// Lazy-loaded routes for code-splitting and rapid initial load
const InvestigatePage = lazy(() => import('./pages/InvestigatePage').then((m) => ({ default: m.InvestigatePage })));
const ComparePage = lazy(() => import('./pages/ComparePage').then((m) => ({ default: m.ComparePage })));
const DatasetsPage = lazy(() => import('./pages/DatasetsPage').then((m) => ({ default: m.DatasetsPage })));
const HotHumidDatasetPage = lazy(() => import('./pages/HotHumidDatasetPage').then((m) => ({ default: m.HotHumidDatasetPage })));
const AtlasPage = lazy(() => import('./pages/AtlasPage').then((m) => ({ default: m.AtlasPage })));
const ResearchPage = lazy(() => import('./pages/ResearchPage').then((m) => ({ default: m.ResearchPage })));
const ReferencesPage = lazy(() => import('./pages/ReferencesPage').then((m) => ({ default: m.ReferencesPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const TeamPage = lazy(() => import('./pages/TeamPage').then((m) => ({ default: m.TeamPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then((m) => ({ default: m.AuthPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));

function ScientificLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 rounded-2xl bg-purple-100 border border-purple-300 flex items-center justify-center shadow-xs">
        <div className="w-5 h-5 rounded-full border-2 border-purple-700 border-t-transparent animate-spin" />
      </div>
      <div className="text-xs font-mono font-bold text-purple-900 tracking-wider">
        GlobTraceX • Loading NASA Earth-Observation Module...
      </div>
    </div>
  );
}

export default function App() {
  // Navigation Route State (with browser history support)
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Search Modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard shortcut for search (Cmd+K or '/')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigate = (route: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
  };

  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen flex flex-col bg-[#fafaff] text-slate-900 font-sans selection:bg-purple-600 selection:text-white overflow-x-hidden w-full max-w-full">
          {/* Main Top Navigation Header */}
          <Navbar
            currentRoute={currentRoute}
            onNavigate={navigate}
            onOpenSearch={() => setIsSearchOpen(true)}
          />

          {/* Main Content Router with Suspense */}
          <main className="flex-1">
            <Suspense fallback={<ScientificLoadingFallback />}>
              {currentRoute === '/' && <HomePage onNavigate={navigate} />}

              {(currentRoute === '/investigate' ||
                currentRoute === '/explore' ||
                currentRoute === '/ocean' ||
                currentRoute === '/bangladesh' ||
                currentRoute === '/trends') && (
                <InvestigatePage onNavigate={navigate} />
              )}

              {currentRoute === '/compare' && <ComparePage />}

              {(currentRoute === '/datasets/hot-humid-days' ||
                currentRoute === '/datasets/hot_humid' ||
                currentRoute === '/hot-humid') && (
                <HotHumidDatasetPage onNavigate={navigate} />
              )}

              {(currentRoute === '/datasets' || currentRoute === '/data') && (
                <DatasetsPage onNavigate={navigate} />
              )}

              {(currentRoute === '/atlas') && (
                <AtlasPage onNavigate={navigate} />
              )}

              {(currentRoute === '/community' || currentRoute === '/publish' || currentRoute === '/research') && (
                <ResearchPage onNavigate={navigate} />
              )}

              {(currentRoute === '/references' || currentRoute === '/methodology' || currentRoute === '/sources') && (
                <ReferencesPage />
              )}

              {(currentRoute === '/about' || currentRoute === '/challenge' || currentRoute === '/impact') && (
                <AboutPage onNavigate={navigate} />
              )}

              {currentRoute === '/team' && <TeamPage />}

              {(currentRoute === '/auth' || currentRoute === '/sign-in' || currentRoute === '/account') && (
                <AuthPage onNavigate={navigate} />
              )}

              {currentRoute === '/admin' && <AdminPage onNavigate={navigate} />}

              {/* Fallback 404 handler */}
              {![
                '/',
                '/investigate',
                '/explore',
                '/ocean',
                '/bangladesh',
                '/trends',
                '/countries',
                '/compare',
                '/atlas',
                '/datasets',
                '/datasets/hot-humid-days',
                '/datasets/hot_humid',
                '/hot-humid',
                '/data',
                '/community',
                '/publish',
                '/research',
                '/references',
                '/methodology',
                '/sources',
                '/about',
                '/challenge',
                '/impact',
                '/team',
                '/auth',
                '/sign-in',
                '/account',
                '/admin',
              ].includes(currentRoute) && !currentRoute.startsWith('/country/') && (
                <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-purple-100 shadow-lg space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto font-black text-sm">
                    GTX
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900">Page Not Found</h2>
                  <p className="text-xs text-slate-500 font-mono">
                    The requested route does not exist in the GlobTraceX scientific registry.
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-xs"
                  >
                    Return to Home
                  </button>
                </div>
              )}
            </Suspense>
          </main>

          {/* Global Footer */}
          <Footer onNavigate={navigate} />

          {/* Global Search Command Palette */}
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onNavigate={navigate}
          />
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}
