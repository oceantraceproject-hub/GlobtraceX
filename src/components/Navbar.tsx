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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-2xs font-['Manrope']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Descriptor */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleNav('/')}
            className="flex items-center text-left group transition-transform active:scale-98"
          >
            <GlobTraceLogo variant="full" size="md" />
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentRoute === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => handleNav(link.route)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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

        {/* Right Actions: Single Language Toggle + Search + Auth */}
        <div className="flex items-center gap-2.5">
          {/* Global Search Button */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-purple-50 rounded-xl transition-colors border border-purple-100"
              title="Search Datasets & Districts"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Trend Alert Subscription Trigger */}
          <button
            onClick={() => setAlertModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
            title="Subscribe to Ocean & Climate Critical Trend Alerts"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span className="hidden sm:inline">{language === 'bn' ? 'ট্রেন্ড অ্যালার্ট' : 'Trend Alert'}</span>
          </button>

          {/* Single Bilingual Toggle: EN / বাংলা */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95"
            title="Toggle between English and Bangla (বাংলা)"
          >
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Authentication State */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNav(isAdmin ? '/admin' : '/auth')}
                className="p-1.5 rounded-xl bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                title={user.email || 'User Account'}
              >
                <User className="w-4 h-4" />
              </button>
              <button
                onClick={signOut}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNav('/auth')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs"
            >
              <span>{t('nav.auth')}</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden p-4 bg-white border-b border-purple-100 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentRoute === link.route;
            return (
              <button
                key={link.route}
                onClick={() => handleNav(link.route)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setAlertModalOpen(true);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200"
          >
            <Bell className="w-4 h-4 text-amber-600" />
            <span>{language === 'bn' ? 'ট্রেন্ড অ্যালার্ট সাবস্ক্রিপশন' : 'Trend Alert Subscriptions'}</span>
          </button>
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
