import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, ArrowRight, Menu, X, UserPlus, LogIn } from 'lucide-react';
import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const PublicHeader: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');

  const isLoginActive = location.pathname === '/login';
  const isRegisterActive = location.pathname === '/register';

  const navLinks = [
    { id: 'home', label: t('nav.home', 'Home'), href: '/#home' },
    { id: 'about', label: t('nav.about', 'About'), href: '/#about' },
    { id: 'features', label: t('nav.features', 'Features'), href: '/#features' },
    { id: 'ai-preview', label: t('nav.ai_forecaster', 'AI Forecaster'), href: '/#ai-preview' },
    { id: 'testimonials', label: t('nav.reviews', 'Customer Reviews'), href: '/#testimonials' },
    { id: 'faq', label: t('nav.faq', 'FAQ'), href: '/#faq' },
    { id: 'contact', label: t('nav.contact', 'Contact'), href: '/#contact' },
  ];

  // Scroll-spy observer to highlight active section like dashboard sidebar
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sectionIds = ['home', 'about', 'features', 'ai-preview', 'testimonials', 'faq', 'contact'];

    const handleScroll = () => {
      // Near bottom of document: activate contact
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80) {
        setActiveSection('contact');
        return;
      }

      // If near the top, highlight home
      if (window.scrollY < 180) {
        setActiveSection('home');
        return;
      }

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const sectionEl = document.getElementById(sectionIds[i]);
        if (sectionEl) {
          const rect = sectionEl.getBoundingClientRect();
          if (rect.top <= 180) {
            setActiveSection(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleNavClick = (id: string, _href: string) => {
    setMobileMenuOpen(false);
    setActiveSection(id);

    if (location.pathname === '/') {
      if (id === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      navigate('/' + (id === 'home' ? '' : `#${id}`));
      setTimeout(() => {
        if (id === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 150);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              DESCO{' '}
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                Smart
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links with Active Indicator Highlighting like Dashboard Sidebar */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id && location.pathname === '/';
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id, link.href)}
                className={`px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Tools & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <LanguageToggle />

          {/* Theme Switcher */}
          <ThemeToggle variant="icon" />

          {/* Auth Action Buttons */}
          {isAuthenticated ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/dashboard')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="hidden sm:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-500/20"
            >
              {t('nav.dashboard', 'Dashboard')}
            </Button>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              {/* Sign In Button - Stays always visible, active highlight when on /login */}
              <Link to="/login">
                <button
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isLoginActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                      : 'text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('nav.signin', 'Sign In')}</span>
                </button>
              </Link>

              {/* Register Button - Stays always visible, active highlight when on /register */}
              <Link to="/register">
                <button
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isRegisterActive
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/40 ring-2 ring-emerald-400 dark:ring-emerald-300 ring-offset-2 dark:ring-offset-slate-950 scale-[1.02]'
                      : 'text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t('nav.register', 'Register Meter')}</span>
                </button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 space-y-3 shadow-xl">
          <nav className="flex flex-col space-y-1.5 pt-2 text-sm font-semibold">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id && location.pathname === '/';
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id, link.href)}
                  className={`text-left py-2.5 px-3.5 rounded-xl transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {!isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    className={`w-full py-2.5 px-4 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      isLoginActive
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{t('nav.signin', 'Sign In')}</span>
                  </button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    className={`w-full py-2.5 px-4 text-sm font-bold text-white rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isRegisterActive
                        ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-slate-950'
                        : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{t('nav.register', 'Register Meter')}</span>
                  </button>
                </Link>
              </div>
            ) : (
              <Button
                variant="primary"
                className="w-full py-2.5 justify-center font-bold"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
              >
                {t('nav.dashboard', 'Go to Dashboard')}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
