import React, { useState } from 'react';
import { ShieldAlert, Server, Activity, Database, CheckCircle2, Check, Sliders } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { useLanguage } from '../context/LanguageContext';
import { useMeters } from '../context/MeterContext';

export const SystemSection: React.FC = () => {
  const { language, isBn, t } = useLanguage();
  const { updateAllMetersThresholds } = useMeters();

  const [defaultLow, setDefaultLow] = useState(() => Number(localStorage.getItem('desco_cfg_low')) || 300);
  const [defaultCritical, setDefaultCritical] = useState(() => Number(localStorage.getItem('desco_cfg_critical')) || 100);
  const [pollIntervalMinutes, setPollIntervalMinutes] = useState(60);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('desco_cfg_low', String(defaultLow));
    localStorage.setItem('desco_cfg_critical', String(defaultCritical));
    localStorage.setItem('desco_language', language);
    localStorage.setItem('desco_cfg_lang', language);

    // Synchronize to the live meter fleet database
    updateAllMetersThresholds(defaultLow, defaultCritical);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {isBn ? 'গ্লোবাল সিস্টেম প্যারামিটার ও হেলথ' : 'Global System Parameters & Health'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'সুপার-অ্যাডমিন ইঞ্জিন সেটিংস, টেলিমেট্রি ক্রন ফ্রিকোয়েন্সি এবং গেটওয়ে ডাটাবেজ সমন্বয়'
              : 'Super-Admin engine settings, telemetry cron frequency, and gateway database synchronization'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ThemeToggle variant="segmented" />
        </div>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              {isBn
                ? 'গ্লোবাল সিস্টেম প্যারামিটার ও ডাটাবেজ থ্রেশহোল্ড সফলভাবে আপডেট করা হয়েছে।'
                : 'Global system parameters and meter fleet database thresholds successfully updated.'}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold">
            {isBn ? 'ডাটাবেজ সিঙ্কড' : 'DB SYNCED'}
          </span>
        </div>
      )}

      {/* Health Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">{isBn ? 'ডেসকো গেটওয়ে লিংক' : 'DESCO Gateway Link'}</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Online (100% SLA)</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">{isBn ? 'গড় পোলিং লেটেন্সি' : 'Average Polling Latency'}</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">142ms</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">{isBn ? 'স্টোরেজ আর্কিটেকচার' : 'Storage Architecture'}</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Live Browser DB / LocalStorage</p>
          </div>
        </div>
      </div>

      {/* Global Defaults */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
          {isBn ? 'মিটারসমূহের জন্য গ্লোবাল ডিফল্ট কনফিগারেশন' : 'Default Pre-configuration for Fleet Meters'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'গ্লোবাল ডিফল্ট লো থ্রেশহোল্ড (৳)' : 'Global Default Low Threshold (৳)'}
            </label>
            <input
              type="number"
              value={defaultLow}
              onChange={(e) => setDefaultLow(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'গ্লোবাল ডিফল্ট ক্রিটিক্যাল থ্রেশহোল্ড (৳)' : 'Global Default Critical Threshold (৳)'}
            </label>
            <input
              type="number"
              value={defaultCritical}
              onChange={(e) => setDefaultCritical(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'অটোমেটেড গেটওয়ে সিঙ্ক ফ্রিকোয়েন্সি (মিনিট)' : 'Automated Gateway Sync Frequency (Minutes)'}
            </label>
            <input
              type="number"
              value={pollIntervalMinutes}
              onChange={(e) => setPollIntervalMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
            />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isBn ? 'সিস্টেম রক্ষণাবেক্ষণ লকডাউন' : 'System Maintenance Lockdown'}
              </p>
              <p className="text-[11px] text-slate-400">
                {isBn
                  ? 'সাধারণ গ্রাহকদের রক্ষণাবেক্ষণ বিজ্ঞপ্তি প্রদর্শন করে কিন্তু প্রশাসনিক নিয়ন্ত্রণ সচল রাখে'
                  : 'Shows a maintenance advisory banner to regular consumers while allowing administrative overrides'}
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-3">
          <Button variant="primary" onClick={handleSave}>
            {isBn ? 'প্যারামিটার সংরক্ষণ ও ডাটাবেজ আপডেট' : 'Save Parameters & Update Database'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
