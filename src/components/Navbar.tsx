import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { GlobTraceLogo } from './GlobTraceLogo';
import { TrendAlertModal } from './TrendAlertModal';
import {
  Compass,
  GitCompare,
  Database,
  BookOpen,
  Info,
  Users,
  Menu,
  X,
  Globe,
  Layers,
  User,
  LogOut,
  ShieldCheck,
  Search,
  Bell,
  LogIn,
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate, onOpenSearch }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, signOut, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  const navLinks = [
    { label: t('nav.home'), route: '/', icon: Globe },
    { label: t('nav.investigate'), route: '/investigate', icon: Compass },
    { label: 'Atlas', route: '/atlas', icon: Layers },
    { label: t('nav.compare'), route: '/compare', icon: GitCompare },
    { label: t('nav.datasets'), route: '/datasets', icon: Database },
    { label: t('nav.team'), route: '/team', icon: Users },
    { label: t('nav.about'), route: '/about', icon: Info },
  ];

  const handleNav = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-2xs font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-6 min-w-0 shrink">
          <button
            onClick={() => handleNav('/')}
            className="flex items-center text-left group transition-transform active:scale-98 min-w-0"
            aria-label="GlobTraceX Home"
          >
            {/* Show full logo on sm+, compact on mobile (320px–480px) */}
            <div className="hidden xs:block">
              <GlobTraceLogo variant="full" size="md" />
            </div>
            <div className="xs:hidden">
              <GlobTraceLogo variant="compact" size="sm" />
            </div>
          </button>

          {/* Desktop Nav Links (xl:flex to prevent collision on tablets/laptops) */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentRoute === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => handleNav(link.route)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Actions Toolbar: Search + Alerts + Language + Sign In + Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Global Search Button */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-purple-50 rounded-xl transition-colors border border-purple-100 shrink-0"
              title="Search Datasets & Locations"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Trend Alert Subscription Trigger */}
          <button
            onClick={() => setAlertModalOpen(true)}
            className="px-2 py-1.5 sm:px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs shrink-0"
            title="Subscribe to Ocean & Climate Critical Trend Alerts"
            aria-label="Trend Alerts"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
            <span className="hidden md:inline">{language === 'bn' ? 'ট্রেন্ড অ্যালার্ট' : 'Trend Alerts'}</span>
          </button>

          {/* Bilingual Toggle: EN / বাংলা */}
          <button
            onClick={toggleLanguage}
            className="px-2 py-1.5 sm:px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-mono font-bold flex items-center gap-1 transition-all active:scale-95 shrink-0"
            title="Toggle between English and Bangla (বাংলা)"
            aria-label="Toggle Language"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Authentication State: Always accessible on every device! */}
          {user ? (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => handleNav(isAdmin ? '/admin' : '/auth')}
                className="p-1.5 sm:p-2 rounded-xl bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors flex items-center gap-1 text-xs font-semibold"
                title={user.email || 'User Account'}
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline max-w-[90px] truncate">{user.email?.split('@')[0]}</span>
              </button>
              <button
                onClick={signOut}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNav('/auth')}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-semibold text-xs transition-all shadow-xs shrink-0 whitespace-nowrap"
              aria-label="Sign In"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('nav.auth')}</span>
            </button>
          )}

          {/* Mobile / Tablet Menu Button (shown below xl) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors border border-purple-100 shrink-0"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden p-4 bg-white border-b border-purple-100 space-y-2.5 animate-in slide-in-from-top-2 shadow-lg">
          {/* Quick Sign In button inside mobile drawer if not authenticated */}
          {!user && (
            <div className="pb-2 border-b border-purple-100">
              <button
                onClick={() => handleNav('/auth')}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('nav.auth')} — Access Research & Alerts</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentRoute === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => handleNav(link.route)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-purple-100 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setAlertModalOpen(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
            >
              <Bell className="w-4 h-4 text-amber-600" />
              <span>{language === 'bn' ? 'ট্রেন্ড অ্যালার্ট সাবস্ক্রিপশন' : 'Trend Alert Subscriptions'}</span>
            </button>

            {user && (
              <button
                onClick={signOut}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user.email?.split('@')[0]})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Global Trend Alert Modal */}
      <TrendAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        defaultParameter="sst"
      />
    </header>
  );
};
