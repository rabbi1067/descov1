import React, { useState } from 'react';
import {
  Gauge,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Wallet,
  Users,
  Search,
  RefreshCw,
  Send,
  Sliders,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Radio,
  Zap,
} from 'lucide-react';
import { useMeters } from '../context/MeterContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { StatCard } from '../components/dashboard/StatCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { DashboardSection, Meter } from '../types';

interface AdminDashboardSectionProps {
  onNavigateSection: (section: DashboardSection) => void;
}

export const AdminDashboardSection: React.FC<AdminDashboardSectionProps> = ({ onNavigateSection }) => {
  const { user } = useAuth();
  const { isBn } = useLanguage();
  const {
    allMeters,
    dispatchRecords,
    isSyncing,
    runGlobalThresholdScan,
    triggerDirectMeterAlert,
    refreshMeterBalance,
  } = useMeters();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'low' | 'healthy'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [sendingAlertId, setSendingAlertId] = useState<string | null>(null);
  const [pollingId, setPollingId] = useState<string | null>(null);

  // Calculate fleet metrics
  const totalMeters = allMeters.length;
  const criticalMeters = allMeters.filter((m) => m.status === 'critical');
  const lowMeters = allMeters.filter((m) => m.status === 'low');
  const healthyMeters = allMeters.filter((m) => m.status === 'healthy');

  const criticalCount = criticalMeters.length;
  const lowCount = lowMeters.length;
  const healthyCount = healthyMeters.length;

  const totalSystemBalance = allMeters.reduce((acc, m) => acc + m.currentBalance, 0);

  // Trigger global threshold scan
  const handleGlobalScan = async () => {
    setIsScanning(true);
    try {
      const res = await runGlobalThresholdScan();
      setActionNotice(
        isBn
          ? `গ্রিড মূল্যায়ন সম্পন্ন: ${res.scanned}টি মিটার স্ক্যান করা হয়েছে, ${res.alertsTriggered}টি সতর্কতা সফলভাবে প্রেরিত হয়েছে।`
          : `Automated scan completed: ${res.scanned} fleet meters scanned, ${res.alertsTriggered} threshold alerts evaluated and dispatched.`
      );
      setTimeout(() => setActionNotice(null), 5000);
    } finally {
      setIsScanning(false);
    }
  };

  // Direct manual alert dispatch for a specific meter
  const handleDirectAlert = async (meter: Meter) => {
    setSendingAlertId(meter.id);
    try {
      const ok = await triggerDirectMeterAlert(meter.id);
      if (ok) {
        setActionNotice(
          isBn
            ? `অ্যালার্ট সফলভাবে প্রেরিত: ${meter.notificationEmail || meter.userEmail} (মিটার #${meter.meterNumber}, ব্যালেন্স: ৳${meter.currentBalance})`
            : `Official alert dispatched to ${meter.notificationEmail || meter.userEmail} for Meter #${meter.meterNumber} (Balance: ৳${meter.currentBalance}).`
        );
        setTimeout(() => setActionNotice(null), 5000);
      }
    } finally {
      setSendingAlertId(null);
    }
  };

  // Force refresh meter
  const handleForcePoll = async (id: string) => {
    setPollingId(id);
    await refreshMeterBalance(id);
    setPollingId(null);
    setActionNotice(
      isBn
        ? `এএমআর গেটওয়ে থেকে সরাসরি টেলিমেট্রি লাইভ রিফ্রেশ করা হয়েছে।`
        : `Telemetry refreshed live from DESCO AMR gateway.`
    );
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Filter meters: prioritize critical and low meters first
  const filteredMeters = allMeters
    .filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.meterNumber.includes(search) ||
        m.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        m.accountNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const score = (status: string) => (status === 'critical' ? 3 : status === 'low' ? 2 : 1);
      return score(b.status) - score(a.status);
    });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Sleek Operations Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 text-white shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[11px] font-bold tracking-wide uppercase">
              {isBn ? 'অপারেশনস কন্ট্রোল' : 'Operations Control'}
            </span>
            <span className="text-xs text-slate-300">
              {isBn ? 'দায়িত্বরত অফিসার:' : 'Officer on Duty:'}{' '}
              <span className="font-semibold text-white">{user?.name}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 ml-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {isBn ? 'লাইভ গ্রিড সিঙ্ক' : 'Live Grid Sync Active'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {isBn ? 'ডেসকো গ্রিড ফ্লিট কমান্ড ড্যাশবোর্ড' : 'DESCO Grid Fleet Command Dashboard'}
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            {isBn
              ? 'রিয়েল-টাইম মিটার টেলিমেট্রি, গ্রাহক ব্যালেন্স নজরদারি ও ঢাকা বিদ্যুৎ বিতরণ নেটওয়ার্কের স্বয়ংক্রিয় ডিসপ্যাচ কন্ট্রোল।'
              : 'Real-time fleet telemetry, consumer balance surveillance, and automated dispatch control for Dhaka electricity distribution.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            disabled={isScanning || isSyncing}
            onClick={handleGlobalScan}
            className="border-slate-600 bg-slate-800/80 text-white hover:bg-slate-700 text-xs cursor-pointer shadow-xs"
            leftIcon={<Activity className={`w-3.5 h-3.5 text-emerald-400 ${isScanning ? 'animate-spin' : ''}`} />}
          >
            {isScanning
              ? isBn
                ? 'গ্রিড স্ক্যান হচ্ছে...'
                : 'Scanning Grid...'
              : isBn
              ? 'গ্লোবাল স্ক্যান চালান'
              : 'Run Global Threshold Scan'}
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => onNavigateSection('meter_management')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs cursor-pointer shadow-xs"
            rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
          >
            {isBn ? 'ফ্লিট ম্যানেজমেন্ট' : 'Fleet Management'}
          </Button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4 Perfectly Balanced Operations KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Fleet Meters */}
        <StatCard
          title={isBn ? 'নজরদারিকৃত ফ্লিট' : 'Monitored Fleet'}
          value={`${totalMeters} ${isBn ? 'টি মিটার' : 'Meters'}`}
          subtitle={isBn ? '১০০% এএমআই টেলিমেট্রি সংযুক্ত' : '100% AMI Telemetry Connected'}
          icon={<Gauge className="w-5 h-5" />}
          statusColor="blue"
          trend={{
            value: `${healthyCount} ${isBn ? 'স্বাভাবিক' : 'Healthy'}`,
            isPositive: true,
            label: isBn ? 'নামমাত্র স্ট্যাটাস' : 'nominal status',
          }}
        />

        {/* KPI 2: Critical Disconnection Risk */}
        <StatCard
          title={isBn ? 'জরুরি শাটডাউন ঝুঁকি' : 'Critical Cutoff Risk'}
          value={`${criticalCount} ${isBn ? 'টি ইউনিট' : `Unit${criticalCount === 1 ? '' : 's'}`}`}
          subtitle={isBn ? 'ব্যালেন্স জরুরি সীমার নিচে' : 'Balance below critical limit'}
          icon={<AlertTriangle className="w-5 h-5" />}
          statusColor={criticalCount > 0 ? 'rose' : 'emerald'}
          badge={
            criticalCount > 0 ? (
              <Badge variant="critical" size="sm">
                {isBn ? 'জরুরি অ্যালার্ট' : 'Emergency Alert'}
              </Badge>
            ) : (
              <Badge variant="healthy" size="sm">
                {isBn ? 'নিরাপদ' : 'Clean'}
              </Badge>
            )
          }
        />

        {/* KPI 3: Low Balance Watchlist */}
        <StatCard
          title={isBn ? 'কম ব্যালেন্স সতর্কতা' : 'Low Balance Warning'}
          value={`${lowCount} ${isBn ? 'টি ইউনিট' : `Unit${lowCount === 1 ? '' : 's'}`}`}
          subtitle={isBn ? 'সতর্কতা সীমার কাছাকাছি' : 'Approaching warning threshold'}
          icon={<ShieldAlert className="w-5 h-5" />}
          statusColor={lowCount > 0 ? 'amber' : 'emerald'}
          badge={
            lowCount > 0 ? (
              <Badge variant="low" size="sm">
                {isBn ? 'মনোযোগ প্রয়োজন' : 'Attention'}
              </Badge>
            ) : (
              <Badge variant="healthy" size="sm">
                {isBn ? 'স্বাভাবিক' : 'Normal'}
              </Badge>
            )
          }
        />

        {/* KPI 4: Consumer Float Monitored */}
        <StatCard
          title={isBn ? 'ফ্লিট ব্যালেন্স রিজার্ভ' : 'Fleet Balance Reserve'}
          value={formatCurrency(totalSystemBalance)}
          subtitle={isBn ? 'মোট গ্রাহক জমা ব্যালেন্স' : 'Aggregate consumer credit'}
          icon={<Wallet className="w-5 h-5" />}
          statusColor="emerald"
          trend={{
            value: `৳${Math.round(totalSystemBalance / (totalMeters || 1))}`,
            isPositive: true,
            label: isBn ? 'গড় / মিটার' : 'avg / meter',
          }}
        />
      </div>

      {/* Streamlined Operational Watchdog Alert Strip */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          criticalCount > 0
            ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200'
            : lowCount > 0
            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200'
            : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                criticalCount > 0
                  ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300'
                  : lowCount > 0
                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300'
                  : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300'
              }`}
            >
              {criticalCount > 0 ? (
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              ) : lowCount > 0 ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">
                  {criticalCount > 0
                    ? isBn
                      ? `অপারেশনস অ্যালার্ট: ${criticalCount}টি মিটারে জরুরি ডিসকানেকশন ঝুঁকি চিহ্নিত`
                      : `Operations Alert: ${criticalCount} meter(s) at emergency disconnection risk`
                    : lowCount > 0
                    ? isBn
                      ? `সতর্কতা অবস্থা: ${lowCount}টি মিটার কম ব্যালেন্স ক্যাটাগরিতে রয়েছে`
                      : `Advisory State: ${lowCount} meter(s) in low balance warning band`
                    : isBn
                    ? `সকল প্যারামিটার স্বাভাবিক: সকল ${totalMeters}টি মিটার নিরাপদ ব্যালেন্স সীমার মধ্যে সচল`
                    : `Grid Status Nominal: All ${totalMeters} fleet meters operating within safe parameters`}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-800/80 border border-current">
                  90s auto-scan
                </span>
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                {criticalCount > 0
                  ? isBn
                    ? 'নিচের ফ্লিট তালিকা থেকে জরুরি মিটারগুলোর অবস্থা পর্যালোচনা করে অবিলম্বে অ্যালার্ট পাঠান অথবা গেটওয়ে সিঙ্ক করুন।'
                    : 'Review the flagged critical meters below to trigger immediate email notices or force AMR balance polling.'
                  : lowCount > 0
                  ? isBn
                    ? 'স্বয়ংক্রিয় নোটিফিকেশন সিস্টেম কার্যকর রয়েছে। গ্রাহকরা এসএমএস/ইমেইলে ওয়ার্নিং পাচ্ছেন।'
                    : 'Automated notification relays are standing by. Citizens receive scheduled low balance advisories.'
                  : isBn
                  ? 'টেলিমেট্রি সার্ভার ১০০% সক্রিয়। সর্বশেষ স্ক্যানে কোনো ব্যর্থতা পাওয়া যায়নি।'
                  : 'AMI Telemetry relay 100% active. Zero connection disconnect alerts pending.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {criticalCount > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('critical')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                {isBn ? 'জরুরি মিটার দেখুন' : 'Filter Critical'}
              </button>
            )}
            {lowCount > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('low')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                {isBn ? 'কম ব্যালেন্স দেখুন' : 'Filter Low'}
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigateSection('audit_logs')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {isBn ? 'ডিসপ্যাচ অডিট' : 'Dispatch Audit'}
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Left 2 Cols (Table) + Right 1 Col (Feed & Controls) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left 2 Columns: Priority Fleet Watchlist Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isBn
                    ? 'মিটার নম্বর, গ্রাহকের ইমেইল বা এলাকা দিয়ে খুঁজুন...'
                    : 'Search meter number, consumer email, or premise name...'
                }
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
              {(['all', 'critical', 'low', 'healthy'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {st === 'all'
                    ? isBn
                      ? `সকল (${allMeters.length})`
                      : `All (${allMeters.length})`
                    : st === 'critical'
                    ? isBn
                      ? `জরুরি (${criticalCount})`
                      : `Critical (${criticalCount})`
                    : st === 'low'
                    ? isBn
                      ? `কম (${lowCount})`
                      : `Low (${lowCount})`
                    : isBn
                    ? `স্বাভাবিক (${healthyCount})`
                    : `Healthy (${healthyCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Fleet Triage Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  {isBn ? 'ফ্লিট টেলিমেট্রি ও থ্রেশহোল্ড নজরদারি' : 'Fleet Telemetry & Threshold Surveillance'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isBn
                    ? `${filteredMeters.length} টি মিটার অপারেশনাল অগ্রাধিকার অনুযায়ী সাজানো`
                    : `Showing ${filteredMeters.length} meters sorted by operational urgency (critical & low first)`}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigateSection('meter_management')}
                className="text-xs"
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                {isBn ? 'সম্পূর্ণ ফ্লিট এডিটর' : 'Full Fleet Editor'}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">{isBn ? 'গ্রাহকের ঠিকানা ও মিটার' : 'Premises & Meter'}</th>
                    <th className="py-3 px-4">{isBn ? 'নিবন্ধিত গ্রাহক' : 'Registered Consumer'}</th>
                    <th className="py-3 px-4">{isBn ? 'বর্তমান ব্যালেন্স' : 'Current Balance'}</th>
                    <th className="py-3 px-4">{isBn ? 'নির্ধারিত সীমা' : 'Thresholds'}</th>
                    <th className="py-3 px-4">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                    <th className="py-3 px-4 text-right">{isBn ? 'অপারেশনস অ্যাকশন' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredMeters.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                        <Gauge className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold text-xs">
                          {isBn ? 'কোনো মিটার পাওয়া যায়নি' : 'No meters match current search or filter'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearch('');
                            setStatusFilter('all');
                          }}
                          className="mt-2 text-[11px] text-blue-600 hover:underline cursor-pointer"
                        >
                          {isBn ? 'ফিল্টার রিসেট করুন' : 'Reset filters'}
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredMeters.map((m) => {
                      const isCrit = m.status === 'critical';
                      const isLow = m.status === 'low';
                      return (
                        <tr
                          key={m.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                            isCrit
                              ? 'bg-rose-50/30 dark:bg-rose-950/20'
                              : isLow
                              ? 'bg-amber-50/20 dark:bg-amber-950/10'
                              : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{m.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-mono">
                              <span className="text-blue-600 dark:text-blue-400 font-bold">#{m.meterNumber}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-400">{m.accountNumber}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[160px]" title={m.userEmail}>
                              {m.userEmail}
                            </p>
                            <p className="text-[10px] text-slate-400">{m.tariffType}</p>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`font-black font-mono text-sm ${
                                isCrit
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : isLow
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {formatCurrency(m.currentBalance)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                            <span className="text-amber-600 dark:text-amber-400">৳{m.lowThreshold}</span>
                            <span className="text-slate-400 mx-1">/</span>
                            <span className="text-rose-600 dark:text-rose-400">৳{m.criticalThreshold}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <Badge variant={m.status} size="sm">
                              {m.status === 'critical'
                                ? isBn
                                  ? 'জরুরি ঝুঁকি'
                                  : 'Critical Cutoff'
                                : m.status === 'low'
                                ? isBn
                                  ? 'কম ব্যালেন্স'
                                  : 'Low Alert'
                                : isBn
                                ? 'স্বাভাবিক'
                                : 'Healthy'}
                            </Badge>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Direct Alert Dispatch Button */}
                              <Button
                                size="sm"
                                variant={isCrit ? 'primary' : 'outline'}
                                isLoading={sendingAlertId === m.id}
                                onClick={() => handleDirectAlert(m)}
                                className={`text-[11px] px-2.5 py-1 ${
                                  isCrit ? 'bg-rose-600 hover:bg-rose-700 text-white border-none' : ''
                                }`}
                                title={
                                  isBn
                                    ? 'গ্রাহককে তাৎক্ষণিক নোটিফিকেশন পাঠান'
                                    : 'Send instant notification dispatch to consumer'
                                }
                                leftIcon={<Send className="w-3 h-3" />}
                              >
                                {isBn ? 'অ্যালার্ট' : 'Dispatch'}
                              </Button>

                              {/* Force Poll Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                isLoading={pollingId === m.id}
                                onClick={() => handleForcePoll(m.id)}
                                title={
                                  isBn
                                    ? 'এএমআর গেটওয়ে থেকে সরাসরি ব্যালেন্স সিঙ্ক করুন'
                                    : 'Force sync live balance from AMR Gateway'
                                }
                                className="px-2"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${pollingId === m.id ? 'animate-spin' : ''}`} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Live Automated Dispatches + Quick Ops Shortcuts */}
        <div className="space-y-4">
          {/* Live Dispatches Feed Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {isBn ? 'সাম্প্রতিক অ্যালার্ট ডিসপ্যাচ' : 'Recent Alert Dispatches'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? 'স্বয়ংক্রিয় ইমেইল ও ইন-অ্যাপ ডেলিভারি' : 'Automated email & in-app delivery audit'}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isBn ? 'লাইভ' : 'Live'}
                </span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {dispatchRecords.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    {isBn ? 'কোনো ডিসপ্যাচ রেকর্ড নেই' : 'No recorded dispatches yet.'}
                  </div>
                ) : (
                  dispatchRecords.slice(0, 6).map((d) => {
                    const isCrit = d.thresholdType === 'critical';
                    return (
                      <div
                        key={d.id}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`font-semibold text-[11px] ${
                              isCrit ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {isCrit
                              ? isBn
                                ? 'জরুরি শাটডাউন অ্যালার্ট'
                                : 'Critical Cutoff Alert'
                              : isBn
                              ? 'কম ব্যালেন্স সতর্কতা'
                              : 'Low Balance Warning'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(d.timestamp, 'relative')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-800 dark:text-slate-200 font-mono font-semibold">
                            #{d.meterNumber}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                            ৳{d.currentBalance}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {isBn ? 'প্রাপক: ' : 'To: '}{' '}
                          <span className="text-slate-700 dark:text-slate-300 font-mono">{d.recipientEmail}</span>
                        </p>

                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-slate-400">
                            {isBn ? 'চ্যানেল: ইমেইল ও পুশ' : 'Channel: Email & In-App'}
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            ✓ {isBn ? 'সফল' : d.deliveryStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => onNavigateSection('notifications')}
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                {isBn ? 'সম্পূর্ণ অ্যালার্ট লেজার দেখুন' : 'View Full Alert Ledger'}
              </Button>
            </div>
          </div>

          {/* Quick Operations Shortcuts */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {isBn ? 'অপারেশনস কুইক কন্ট্রোল' : 'Operations Quick Control'}
            </h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onNavigateSection('users')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {isBn ? 'গ্রাহক অ্যাকাউন্ট তালিকা' : 'Consumer Accounts Directory'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isBn ? 'নিবন্ধিত নাগরিক ও সংযুক্ত মিটার দেখুন' : 'Review registered citizens & assigned meters'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateSection('meter_management')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {isBn ? 'মিটার ফ্লিট কনফিগারেশন' : 'Meter Fleet Configuration'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isBn ? 'মিটার ফিজিক্যাল আইডি ও সতর্কতার সীমা পরিবর্তন' : 'Edit meter physical IDs & warning thresholds'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateSection('audit_logs')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {isBn ? 'অডিট ও টেলিমেট্রি লগ' : 'Audit & Telemetry Logs'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isBn ? 'গেটওয়ে পোলিং হিস্ট্রি ও অথেনটিকেশন রেকর্ড' : 'Gateway poll records & authentication trail'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Telemetry Gateway Health Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5 text-blue-400">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                {isBn ? 'এএমআর গেটওয়ে স্ট্যাটাস' : 'AMR Gateway Status'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                99.8% Uptime
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isBn
                ? 'ডেসকো স্মার্ট মিটার গ্রিড স্বয়ংক্রিয়ভাবে প্রতি ৯০ সেকেন্ডে রিয়েল-টাইম রিডিং সংগ্রহ করছে।'
                : 'DESCO Smart Meter grid automated polling cadence active every 90 seconds with zero queue latency.'}
            </p>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
              <span>Protocol: DLMS/COSEM</span>
              <span>Encrypted TLS 1.3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
