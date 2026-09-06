import React, { useState, useEffect } from 'react';
import {
  Palette,
  Bell,
  Globe,
  Shield,
  CheckCircle2,
  Sliders,
  Mail,
  Zap,
  Check,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useMeters } from '../context/MeterContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const SettingsSection: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { activeMeter, updateMeter, updateAllMetersThresholds, meters } = useMeters();
  const { user, role } = useAuth();
  const isAdmin = role === 'admin' || role === 'super_admin';

  // Load from localStorage or defaults
  const [notificationEmail, setNotificationEmail] = useState(() => {
    return (
      localStorage.getItem('desco_cfg_email') ||
      activeMeter?.notificationEmail ||
      user?.email ||
      'user@desco.com'
    );
  });

  const [lowThreshold, setLowThreshold] = useState<number>(() => {
    return (
      Number(localStorage.getItem('desco_cfg_low')) ||
      activeMeter?.lowThreshold ||
      300
    );
  });

  const [criticalThreshold, setCriticalThreshold] = useState<number>(() => {
    return (
      Number(localStorage.getItem('desco_cfg_critical')) ||
      activeMeter?.criticalThreshold ||
      100
    );
  });

  const [enableEmail, setEnableEmail] = useState<boolean>(() => {
    return localStorage.getItem('desco_cfg_enable_email') !== 'false';
  });

  const [weeklySummary, setWeeklySummary] = useState<boolean>(() => {
    return localStorage.getItem('desco_cfg_weekly_summary') !== 'false';
  });

  const [privacyMode, setPrivacyMode] = useState<boolean>(() => {
    return localStorage.getItem('desco_cfg_privacy') === 'true';
  });

  const [savedNotice, setSavedNotice] = useState(false);

  // Sync state if active meter changes
  useEffect(() => {
    if (activeMeter) {
      if (activeMeter.lowThreshold) setLowThreshold(activeMeter.lowThreshold);
      if (activeMeter.criticalThreshold) setCriticalThreshold(activeMeter.criticalThreshold);
      if (activeMeter.notificationEmail) setNotificationEmail(activeMeter.notificationEmail);
    }
  }, [activeMeter]);

  const handleLanguageChange = (newLang: 'en' | 'bn') => {
    setLanguage(newLang);
    localStorage.setItem('desco_language', newLang);
    localStorage.setItem('desco_cfg_lang', newLang);
  };

  const handleSave = () => {
    // 1. Persist to browser configuration
    localStorage.setItem('desco_cfg_email', notificationEmail);
    localStorage.setItem('desco_cfg_low', String(lowThreshold));
    localStorage.setItem('desco_cfg_critical', String(criticalThreshold));
    localStorage.setItem('desco_cfg_enable_email', String(enableEmail));
    localStorage.setItem('desco_cfg_weekly_summary', String(weeklySummary));
    localStorage.setItem('desco_cfg_lang', language);
    localStorage.setItem('desco_language', language);
    localStorage.setItem('desco_cfg_privacy', String(privacyMode));

    // 2. Database synchronization:
    // If admin or super admin, apply thresholds globally to all meters in the database
    if (isAdmin) {
      updateAllMetersThresholds(Number(lowThreshold), Number(criticalThreshold));
    }

    // Also update active meter if present
    if (activeMeter) {
      updateMeter(activeMeter.id, {
        lowThreshold: Number(lowThreshold),
        criticalThreshold: Number(criticalThreshold),
        notificationEmail: notificationEmail.trim(),
      });
    }

    // If consumer has multiple meters, ensure user-owned meters are updated
    meters.forEach((m) => {
      if (m.userId === user?.id) {
        updateMeter(m.id, {
          lowThreshold: Number(lowThreshold),
          criticalThreshold: Number(criticalThreshold),
          notificationEmail: notificationEmail.trim(),
        });
      }
    });

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  const isBn = language === 'bn';

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {isBn ? 'সিস্টেম সেটিংস ও পছন্দসমূহ' : t('settings.title', 'Application Settings')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'থিম, ভাষা, স্বয়ংক্রিয় সতর্কতা থ্রেশহোল্ড এবং ডেটাবেজ কনফিগারেশন সেট করুন'
              : t(
                  'settings.subtitle',
                  'Configure appearance, language, automated notification thresholds, and system preferences'
                )}
          </p>
        </div>

        {/* Quick Role & Direct Language Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
            {role === 'super_admin' ? '👑 Super Admin' : role === 'admin' ? '🛡️ Admin' : '👤 Consumer'}
          </span>

          {/* 1-Click Language Switcher at Header */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 text-xs shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-1 mr-0.5" />
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Switch to English"
            >
              ENG
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('bn')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                language === 'bn'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="বাংলা ভাষায় পরিবর্তন করুন"
            >
              বাংলা
            </button>
          </div>
        </div>
      </div>

      {/* Admin Global Database Sync Banner */}
      {isAdmin && (
        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              {isBn
                ? 'অ্যাডমিনিস্ট্রেটর মোড সক্রিয়: থ্রেশহোল্ড পরিবর্তনসমূহ সম্পূর্ণ ডেসকো মিটার ফ্লিট ডাটাবেজে সংরক্ষিত ও কার্যকর হবে।'
                : 'Administrator Mode: Threshold adjustments apply globally across the live DESCO meter fleet.'}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold shrink-0">
            {isBn ? 'ডাটাবেজ সিঙ্ক' : 'DB SYNCHRONIZED'}
          </span>
        </div>
      )}

      {/* Success Notification */}
      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">
              {t(
                'settings.saved_msg',
                'All system preferences successfully saved and language updated.'
              )}
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded font-mono">
            {isBn ? 'সংরক্ষিত' : 'Saved'}
          </span>
        </div>
      )}

      {/* 1. Language & Regional Selection (PRIMARY) */}
      <Card className="p-5 space-y-4 border-2 border-emerald-500/20 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('settings.lang_title', 'Language & Regional Format')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                'settings.lang_desc',
                'Switch between English and Bengali (বাংলা) across all admin and user panels'
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* English Card Button */}
          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`p-4 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
              language === 'en'
                ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100 ring-2 ring-emerald-500/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">🇬🇧</span>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  English (International / BD)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Standard English terminology with Bangladeshi Taka (৳) metrics.
              </p>
            </div>
            {language === 'en' && (
              <span className="p-1 rounded-full bg-emerald-500 text-white shrink-0">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </button>

          {/* Bengali (বাংলা) Card Button */}
          <button
            type="button"
            onClick={() => handleLanguageChange('bn')}
            className={`p-4 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
              language === 'bn'
                ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100 ring-2 ring-emerald-500/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">🇧🇩</span>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  বাংলা (Bengali)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                সকল মেনু, নোটিফিকেশন, মিটার তথ্য ও ড্যাশবোর্ড সম্পূর্ণ বাংলায়।
              </p>
            </div>
            {language === 'bn' && (
              <span className="p-1 rounded-full bg-emerald-500 text-white shrink-0">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </button>
        </div>
      </Card>

      {/* 2. Appearance & Theme */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('settings.theme_title', 'Appearance & Theme')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                'settings.theme_desc',
                'Customize light, dark, or system matching visual aesthetics'
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {t('settings.active_theme', 'Active Color Theme')}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isBn ? 'বর্তমান মোড:' : 'Current mode:'}{' '}
              <span className="font-semibold capitalize text-emerald-600 dark:text-emerald-400">
                {theme}
              </span>
            </p>
          </div>
          <ThemeToggle variant="segmented" />
        </div>
      </Card>

      {/* 3. Notification Preferences & Meter Thresholds */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('settings.notif_title', 'Notification Preferences & Thresholds')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                'settings.notif_desc',
                'Configure emergency low-balance alert boundaries and dispatch rules'
              )}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Notification Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {t('settings.email_label', 'Official Notification Email')}
            </label>
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              placeholder="e.g. user@desco.com"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {isBn
                ? 'ব্যালেন্স সতর্কতা এবং রিচার্জ টোকেন কনফার্মেশন এই ঠিকানায় পাঠানো হবে।'
                : 'Emergency low balance alerts and recharge receipts will be dispatched to this address.'}
            </p>
          </div>

          {/* Threshold Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1.5">
              <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200">
                {t('settings.low_label', 'Low Balance Warning Threshold (৳)')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-amber-600">৳</span>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  value={lowThreshold}
                  onChange={(e) => setLowThreshold(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-xs font-bold rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <span className="text-[10px] text-amber-700 dark:text-amber-300 block">
                {isBn ? 'ডিফল্ট: ৳৩০০ (হলুদ ওয়ার্নিং এলার্ট)' : 'Standard: ৳300 (Warning badge & notification)'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-1.5">
              <label className="block text-xs font-semibold text-rose-900 dark:text-rose-200">
                {t('settings.crit_label', 'Critical Emergency Cutoff Threshold (৳)')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-rose-600">৳</span>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={criticalThreshold}
                  onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-xs font-bold rounded-lg border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <span className="text-[10px] text-rose-700 dark:text-rose-300 block">
                {isBn ? 'ডিফল্ট: ৳১০০ (জরুরি অ্যালার্ম ও রিচার্জ প্রস্তাবনা)' : 'Standard: ৳100 (Immediate alert & auto recharge CTA)'}
              </span>
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-2 space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer select-none border border-slate-100 dark:border-slate-800/80 transition-colors">
              <input
                type="checkbox"
                checked={enableEmail}
                onChange={(e) => setEnableEmail(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
              />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t('settings.enable_email', 'Enable Immediate Email Dispatch')}
                </p>
                <p className="text-[11px] text-slate-400">
                  {t(
                    'settings.enable_email_sub',
                    'Receive instant notifications when balance falls below threshold'
                  )}
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer select-none border border-slate-100 dark:border-slate-800/80 transition-colors">
              <input
                type="checkbox"
                checked={weeklySummary}
                onChange={(e) => setWeeklySummary(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
              />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t('settings.weekly_digest', 'Enable Weekly AI Digest')}
                </p>
                <p className="text-[11px] text-slate-400">
                  {t(
                    'settings.weekly_digest_sub',
                    'Get Monday morning consumption summaries with 7-day runout forecast'
                  )}
                </p>
              </div>
            </label>
          </div>
        </div>
      </Card>

      {/* 4. Privacy & Telemetry */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('settings.privacy_title', 'Telemetry & Diagnostics')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('settings.privacy_desc', 'Manage diagnostic logging and telemetry metrics')}
            </p>
          </div>
        </div>

        <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer select-none border border-slate-100 dark:border-slate-800/80 transition-colors">
          <input
            type="checkbox"
            checked={privacyMode}
            onChange={(e) => setPrivacyMode(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
          />
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {t('settings.privacy_label', 'Enhanced Diagnostics Mode')}
            </p>
            <p className="text-[11px] text-slate-400">
              {t(
                'settings.privacy_sub',
                'Log real-time latency and packet health metrics'
              )}
            </p>
          </div>
        </label>
      </Card>

      {/* Bottom Save Action */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-[11px] text-slate-400">
          {isBn
            ? 'পছন্দসমূহ সরাসরি ব্রাউজার ডাটাবেজ এবং সার্ভার মেমরিতে সংরক্ষিত হয়।'
            : 'Preferences are saved persistently across all sessions.'}
        </p>
        <Button variant="primary" onClick={handleSave} className="flex items-center gap-2 px-6">
          <Check className="w-4 h-4" />
          {t('settings.save_btn', 'Save Settings & Preferences')}
        </Button>
      </div>
    </div>
  );
};
