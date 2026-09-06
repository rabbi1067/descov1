import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  RefreshCw,
  Plus,
  Zap,
  ChevronDown,
  Check,
  ShieldCheck,
  ExternalLink,
  User,
  Settings,
  LogOut,
  Sliders,
  PhoneCall,
  AlertCircle,
  Activity,
  Layers,
  Globe,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMeters } from '../../context/MeterContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { ThemeToggle } from '../common/ThemeToggle';
import { LanguageToggle } from '../common/LanguageToggle';
import { Button } from '../common/Button';
import { DashboardSection } from '../../types';

interface HeaderProps {
  onOpenMobileNav: () => void;
  onOpenAddMeter: () => void;
  onOpenRecharge: () => void;
  onSelectSection: (section: DashboardSection) => void;
  currentSectionTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileNav,
  onOpenAddMeter,
  onOpenRecharge,
  onSelectSection,
  currentSectionTitle,
}) => {
  const { user, role, logout } = useAuth();
  const { language, setLanguage, isBn, t } = useLanguage();
  const navigate = useNavigate();
  const {
    meters,
    allMeters,
    activeMeter,
    setActiveMeterId,
    unreadCount,
    isSyncing,
    refreshMeterBalance,
    notifications,
    markNotificationRead,
    runGlobalThresholdScan,
  } = useMeters();

  const [meterDropdownOpen, setMeterDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isScanningGrid, setIsScanningGrid] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const meterRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isAdminOrSuper = role === 'admin' || role === 'super_admin';
  const alertingCount = allMeters.filter((m) => m.status === 'critical' || m.status === 'low').length;

  const handleScanGrid = async () => {
    setIsScanningGrid(true);
    try {
      const res = await runGlobalThresholdScan();
      setScanMessage(`Scan complete: ${res.alertsTriggered} meters below threshold`);
      setTimeout(() => setScanMessage(null), 3500);
    } finally {
      setIsScanningGrid(false);
    }
  };

  // Close dropdowns on click outside or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (meterRef.current && !meterRef.current.contains(e.target as Node)) {
        setMeterDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMeterDropdownOpen(false);
        setNotifDropdownOpen(false);
        setProfileDropdownOpen(false);
        setShowLogoutModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleRefresh = async () => {
    if (activeMeter) {
      await refreshMeterBalance(activeMeter.id);
    }
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    setProfileDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left side: Hamburger + Section title */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 mr-1 sm:mr-3">
          <button
            onClick={onOpenMobileNav}
            className="p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden cursor-pointer shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white truncate">
              {currentSectionTitle}
            </h1>
            {role === 'super_admin' && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800 shrink-0">
                <ShieldCheck className="w-3 h-3" /> Super Admin
              </span>
            )}
            {role === 'admin' && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800 shrink-0">
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Right side: Active meter selector (for users) OR Fleet Ops Pill (for admins), actions, theme toggle, notifications, profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Admin / Super Admin Fleet Operations Widget - desktop only to preserve mobile space */}
          {isAdminOrSuper ? (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-slate-500 dark:text-slate-400">Fleet:</span>
                <span className="font-bold text-slate-900 dark:text-white">{allMeters.length} Meters</span>
                {alertingCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    {alertingCount} Alerting
                  </span>
                )}
              </div>

              {/* Instant Global Threshold Scan Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleScanGrid}
                disabled={isScanningGrid || isSyncing}
                className="text-xs px-2.5 py-1 hidden lg:inline-flex cursor-pointer"
                leftIcon={<Activity className={`w-3.5 h-3.5 text-emerald-500 ${isScanningGrid ? 'animate-spin' : ''}`} />}
              >
                {isScanningGrid ? 'Scanning Grid...' : 'Scan Grid'}
              </Button>
            </div>
          ) : (
            /* Citizen Consumer Active Meter Switcher - hidden on small mobile to avoid header squish */
            meters.length > 0 && activeMeter && (
              <div className="relative hidden sm:block" ref={meterRef}>
                <button
                  onClick={() => {
                    setMeterDropdownOpen(!meterDropdownOpen);
                    setNotifDropdownOpen(false);
                    setProfileDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      activeMeter.status === 'healthy'
                        ? 'bg-emerald-500'
                        : activeMeter.status === 'low'
                        ? 'bg-amber-500'
                        : 'bg-rose-500 animate-pulse'
                    }`}
                  />
                  <span className="hidden md:inline truncate max-w-[110px]">{activeMeter.name}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {formatCurrency(activeMeter.currentBalance)}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${meterDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {meterDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Active Meter
                    </div>
                    {meters.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setActiveMeterId(m.id);
                          setMeterDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">#{m.meterNumber}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(m.currentBalance)}
                          </span>
                          {activeMeter.id === m.id && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                        </div>
                      </button>
                    ))}

                    <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1 px-2">
                      <button
                        onClick={() => {
                          setMeterDropdownOpen(false);
                          onOpenAddMeter();
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Meter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* Sync / Refresh Button - hidden on small mobile to give room to essentials */}
          <button
            onClick={handleRefresh}
            disabled={isSyncing}
            title="Poll live prepaid meter status"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer hidden sm:flex shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          {/* Quick Recharge Header Button (for standard consumers only) */}
          {!isAdminOrSuper && (
            <Button
              size="sm"
              variant="primary"
              onClick={onOpenRecharge}
              className="hidden md:inline-flex text-xs px-3 shrink-0"
              leftIcon={<Zap className="w-3.5 h-3.5" />}
            >
              Recharge
            </Button>
          )}

          {/* Notification Bell with Dropdown */}
          <div className="relative shrink-0" ref={notifRef}>
            <button
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                setMeterDropdownOpen(false);
                setProfileDropdownOpen(false);
              }}
              className="p-2 relative rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Notifications ({unreadCount} unread)
                  </span>
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(false);
                      onSelectSection('notifications');
                    }}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    View All <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto py-2 space-y-2">
                  {notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                        n.read
                          ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                          : 'bg-emerald-50/50 dark:bg-emerald-950/30 text-slate-800 dark:text-slate-200 border-l-2 border-emerald-500'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold truncate">{n.title}</p>
                        {n.deliveryStatus && (
                          <span className="text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded shrink-0">
                            Sent
                          </span>
                        )}
                      </div>
                      {(n.meterNumber || n.userName) && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {n.meterNumber && <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">#{n.meterNumber}</span>}
                          {n.userName && <span className="truncate">{n.userName}</span>}
                        </div>
                      )}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Toggle (Bangla / English) - Available for all roles */}
          <div className="shrink-0">
            <LanguageToggle variant="badge" />
          </div>

          {/* Theme Toggle */}
          <div className="shrink-0">
            <ThemeToggle variant="icon" />
          </div>

          {/* Professional Profile Dropdown Trigger */}
          <div className="relative shrink-0" ref={profileRef}>
            <button
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setMeterDropdownOpen(false);
                setNotifDropdownOpen(false);
              }}
              className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
              title="Profile & Session"
            >
              <div className="relative shrink-0">
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                  }}
                  alt={user?.name || 'Profile'}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30 dark:ring-emerald-400/20"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>

              {/* User Name & Role on desktop */}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[110px] leading-tight">
                  {user?.name || 'DESCO User'}
                </span>
                <span className="text-[10px] text-slate-400 capitalize truncate max-w-[110px] leading-tight">
                  {role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Operations Admin' : 'Citizen Consumer'}
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${
                  profileDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Professional Profile Menu Dropdown Card */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95">
                {/* User Info Header */}
                <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        user?.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      }
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                      }}
                      alt={user?.name || 'Profile'}
                      className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/40"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {user?.name || 'DESCO Consumer'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
                        {user?.email || 'citizen@desco.org.bd'}
                      </p>
                      <div className="mt-1">
                        {role === 'super_admin' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                            <ShieldCheck className="w-3 h-3" /> Super Administrator
                          </span>
                        )}
                        {role === 'admin' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                            Operations Administrator
                          </span>
                        )}
                        {role === 'user' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <Check className="w-3 h-3" /> Verified Citizen Consumer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active Meter Snippet (Citizens only) or Fleet Scope (Admins) */}
                  {!isAdminOrSuper && activeMeter && (
                    <div className="mt-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] text-slate-400 block font-medium">Active Meter</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {activeMeter.name}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block font-medium">Balance</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatCurrency(activeMeter.currentBalance)}
                        </span>
                      </div>
                    </div>
                  )}

                  {isAdminOrSuper && (
                    <div className="mt-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] text-slate-400 block font-medium">Administrative Scope</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {role === 'super_admin' ? 'Root System Clearance' : 'Operations Fleet Scope'}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block font-medium">Monitored Fleet</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                          {allMeters.length} Meters
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Navigation Links */}
                <div className="py-2 px-2 space-y-0.5">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onSelectSection('profile');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>
                      {role === 'super_admin'
                        ? (isBn ? 'সুপার অ্যাডমিন প্রোফাইল' : 'Super Admin Profile')
                        : role === 'admin'
                        ? (isBn ? 'অ্যাডমিনিস্ট্রেটর প্রোফাইল' : 'Administrator Profile')
                        : (isBn ? 'আমার প্রোফাইল' : 'My Profile')}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onSelectSection('settings');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>System & Alert Preferences</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onSelectSection('reports');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <Sliders className="w-4 h-4 text-slate-400" />
                    <span>Statements & Ledger</span>
                  </button>
                </div>

                {/* Quick Language Toggle in Profile Menu */}
                <div className="mx-2 mb-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  <div className="px-1 pb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      {language === 'bn' ? 'ভাষা / Language' : 'System Language'}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-semibold font-mono">
                      {language === 'bn' ? 'বাংলা' : 'English'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        language === 'en'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>🇬🇧 English</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('bn')}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        language === 'bn'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>🇧🇩 বাংলা</span>
                    </button>
                  </div>
                </div>

                {/* DESCO Helpline Callout */}
                <div className="mx-2 mb-2 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                      DESCO 24/7 Helpline
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                    16120
                  </span>
                </div>

                {/* Logout Button */}
                <div className="pt-2 px-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <LogOut className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                      <span>Sign Out from Monitor</span>
                    </div>
                    <span className="text-[10px] text-rose-400 font-normal">End Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Grid Scan Feedback Toast */}
      {scanMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md transition-all">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>{scanMessage}</span>
          </div>
          <button
            onClick={() => setScanMessage(null)}
            className="text-emerald-200 hover:text-white text-xs cursor-pointer ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Professional Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Confirm Sign Out
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to end your current session for <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.name}</span>? You can sign back in at any time.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                className="flex-1 text-xs"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                className="flex-1 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleConfirmLogout}
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

