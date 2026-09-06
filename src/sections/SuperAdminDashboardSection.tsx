import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Users,
  Gauge,
  Wallet,
  Activity,
  Server,
  Mail,
  Sliders,
  CheckCircle2,
  KeyRound,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Send,
  Database,
  Radio,
  Cpu,
  Lock,
  Camera,
  Phone,
  MapPin,
  Edit3,
} from 'lucide-react';
import { useMeters } from '../context/MeterContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { mockUsers } from '../data/mockUsers';
import { mockAuditLogs } from '../data/mockLogs';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { StatCard } from '../components/dashboard/StatCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { DashboardSection, Meter, User } from '../types';

interface SuperAdminDashboardSectionProps {
  onNavigateSection: (section: DashboardSection) => void;
}

export const SuperAdminDashboardSection: React.FC<SuperAdminDashboardSectionProps> = ({
  onNavigateSection,
}) => {
  const { user } = useAuth();
  const { isBn, t } = useLanguage();
  const {
    allMeters,
    dispatchRecords,
    isSyncing,
    runGlobalThresholdScan,
    triggerDirectMeterAlert,
    refreshMeterBalance,
  } = useMeters();

  const [isScanning, setIsScanning] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [sendingAlertId, setSendingAlertId] = useState<string | null>(null);
  const [pollingId, setPollingId] = useState<string | null>(null);

  // System aggregations
  const totalMeters = allMeters.length;
  const criticalMeters = allMeters.filter((m) => m.status === 'critical');
  const lowMeters = allMeters.filter((m) => m.status === 'low');
  const healthyMeters = allMeters.filter((m) => m.status === 'healthy');

  const criticalCount = criticalMeters.length;
  const lowCount = lowMeters.length;
  const healthyCount = healthyMeters.length;

  const totalSystemBalance = allMeters.reduce((acc, m) => acc + m.currentBalance, 0);

  const adminUsers = mockUsers.filter((u) => u.role === 'admin' || u.role === 'super_admin');
  const citizenUsers = mockUsers.filter((u) => u.role === 'user');

  // Trigger grid-wide threshold scan
  const handleGlobalScan = async () => {
    setIsScanning(true);
    try {
      const res = await runGlobalThresholdScan();
      setActionNotice(
        isBn
          ? `রুট গ্রিড স্ক্যান সম্পন্ন: ${res.scanned}টি মিটার যাচাই করা হয়েছে, ${res.alertsTriggered}টি সতর্কতা মূল্যায়ন করা হয়েছে।`
          : `Root grid scan executed: ${res.scanned} fleet meters verified, ${res.alertsTriggered} threshold warnings evaluated and queued.`
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
            ? `সুপার-অ্যাডমিন অগ্রাধিকার নোটিশ পাঠানো হয়েছে: ${meter.notificationEmail || meter.userEmail} (মিটার #${meter.meterNumber})`
            : `Super-Admin priority dispatch sent to ${meter.notificationEmail || meter.userEmail} for Meter #${meter.meterNumber}.`
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
    setActionNotice(isBn ? `এএমআর গেটওয়ে থেকে লাইভ টেলিমেট্রি রিফ্রেশ করা হয়েছে।` : `Live telemetry refreshed from AMR gateway.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Super Admin Executive Governance Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-800/40 text-white shadow-xl shadow-purple-950/20">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> {isBn ? 'রুট ক্লিয়ারেন্স লেভেল-১' : 'Root Clearance Level-1'}
            </span>
            <span className="text-xs text-slate-300">
              {isBn ? 'লগইন:' : 'Session:'} <span className="font-semibold text-white">{user?.name}</span> ({isBn ? 'প্রধান পরিচালনা অধিকর্তা' : 'Chief Operations Director'})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
            {isBn ? 'ডেসকো গ্রিড গভর্ন্যান্স ও নির্বাহী নিয়ন্ত্রণ' : 'DESCO Grid Governance & Executive Control'}
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/80 max-w-2xl">
            {isBn
              ? 'সিস্টেমব্যাপী গ্রিড নজরদারি, অ্যাডমিনিস্ট্রেটর পরিচিতি ব্যবস্থাপনা, গেটওয়ে রিলে অবস্থা এবং প্রিপেইড রেভিনিউ পর্যবেক্ষণ।'
              : 'System-wide grid surveillance, administrator identity management, gateway relay health, and macroscopic prepaid revenue oversight.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            disabled={isScanning || isSyncing}
            onClick={handleGlobalScan}
            className="border-purple-600/60 bg-purple-950/60 text-purple-200 hover:bg-purple-900 text-xs cursor-pointer"
            leftIcon={<Activity className={`w-3.5 h-3.5 text-purple-400 ${isScanning ? 'animate-spin' : ''}`} />}
          >
            {isScanning
              ? isBn
                ? 'গ্রিড স্ক্যান হচ্ছে...'
                : 'Scanning Grid...'
              : isBn
              ? 'গ্রিড অডিট স্ক্যান'
              : 'Run Global Grid Scan'}
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => onNavigateSection('admin_management')}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs cursor-pointer"
            leftIcon={<KeyRound className="w-3.5 h-3.5" />}
          >
            {isBn ? 'অ্যাডমিন নিয়োগ' : 'Provision Admin'}
          </Button>
        </div>
      </div>

      {/* Action Notice Toast */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-300 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
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

      {/* Top 5 Executive Governance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: Registered Accounts */}
        <StatCard
          title={isBn ? 'মোট একাউন্ট' : 'Total Accounts'}
          value={`${mockUsers.length} ${isBn ? 'জন' : 'Users'}`}
          subtitle={
            isBn
              ? `${adminUsers.length} কর্মকর্তা • ${citizenUsers.length} নাগরিক`
              : `${adminUsers.length} Staff • ${citizenUsers.length} Citizens`
          }
          icon={<Users className="w-5 h-5" />}
          statusColor="blue"
          trend={{
            value: `${adminUsers.length} ${isBn ? 'অ্যাডমিন' : 'Admins'}`,
            isPositive: true,
            label: isBn ? 'সক্রিয় অনুমোদন' : 'active clearance',
          }}
        />

        {/* Card 2: Monitored Fleet */}
        <StatCard
          title={isBn ? 'পর্যবেক্ষণাধীন মিটার' : 'Monitored Fleet'}
          value={`${totalMeters} ${isBn ? 'টি মিটার' : 'Meters'}`}
          subtitle={
            isBn
              ? `${healthyCount} নিরাপদ • ${lowCount} সতর্ক`
              : `${healthyCount} Healthy • ${lowCount} Low`
          }
          icon={<Gauge className="w-5 h-5" />}
          statusColor="emerald"
          badge={
            <Badge variant="healthy" size="sm">
              {isBn ? '১০০% অনলাইন' : '100% Online'}
            </Badge>
          }
        />

        {/* Card 3: Grid Disconnection Risk */}
        <StatCard
          title={isBn ? 'সংযোগ বিচ্ছিন্ন ঝুঁকি' : 'Disconnection Hazard'}
          value={`${criticalCount} ${isBn ? 'টি ইউনিট' : `Unit${criticalCount === 1 ? '' : 's'}`}`}
          subtitle={
            isBn
              ? `${Math.round(((criticalCount + lowCount) / totalMeters) * 100)}% মিটার নজরদারিতে`
              : `${Math.round(((criticalCount + lowCount) / totalMeters) * 100)}% of fleet on watchlist`
          }
          icon={<AlertTriangle className="w-5 h-5" />}
          statusColor={criticalCount > 0 ? 'rose' : 'amber'}
          badge={
            criticalCount > 0 ? (
              <Badge variant="critical" size="sm">
                {isBn ? 'জরুরি ঝুঁকি' : 'Urgent Hazard'}
              </Badge>
            ) : undefined
          }
        />

        {/* Card 4: Network Prepaid Float */}
        <StatCard
          title={isBn ? 'সিস্টেম প্রিপেইড ব্যালেন্স' : 'System Prepaid Float'}
          value={formatCurrency(totalSystemBalance)}
          subtitle={isBn ? 'গ্রিডের সামগ্রিক জমা ব্যালেন্স' : 'Total network prepaid credit'}
          icon={<Wallet className="w-5 h-5" />}
          statusColor="emerald"
          trend={{
            value: '+4.5%',
            isPositive: true,
            label: isBn ? 'মাসিক রিচার্জ প্রবৃদ্ধি' : 'monthly recharge flow',
          }}
        />

        {/* Card 5: System Security Clearance */}
        <StatCard
          title={isBn ? 'নিরাপত্তা স্থিতি' : 'Security Clearance'}
          value={isBn ? '১০০% যাচাইকৃত' : '100% Verified'}
          subtitle={isBn ? 'কোনো নিরাপত্তা ঝুঁকি নেই' : 'Zero Security Breaches'}
          icon={<ShieldCheck className="w-5 h-5" />}
          statusColor="slate"
          trend={{
            value: `${mockAuditLogs.length} ${isBn ? 'ইভেন্ট' : 'Events'}`,
            isPositive: true,
            label: isBn ? 'আজ নিরীক্ষিত' : 'audited today',
          }}
        />
      </div>

      {/* Subsystem & Gateway Telemetry Live Health Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'ডেসকো এএমআর/এএমআই গেটওয়ে' : 'DESCO AMR/AMI Gateway'}
              </p>
              <p className="text-[10px] text-slate-400">REST API • 24ms Response</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
            {isBn ? 'অনলাইন' : 'ONLINE'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'এসএমটিপি অ্যালার্ট রিলে' : 'SMTP Alert Relay'}
              </p>
              <p className="text-[10px] text-slate-400">Mailgun TLS • Port 587</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
            {isBn ? 'সংযুক্ত' : 'CONNECTED'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'টেলিমেট্রি অডিট ভল্ট' : 'Telemetry Audit Vault'}
              </p>
              <p className="text-[10px] text-slate-400">
                {isBn ? 'ডাটাবেজ সিঙ্ক সক্রিয়' : 'Database Cluster Synced'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
            {isBn ? 'কার্যকর' : 'OPERATIONAL'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" style={{ animationDuration: '3s' }} />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'অটো স্ক্যান ডেমন' : 'Auto Scan Daemon'}
              </p>
              <p className="text-[10px] text-slate-400">
                {isBn ? 'প্রতি ৯০ সেকেন্ডে স্ক্যান' : 'Evaluation: Every 90s'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
            {isBn ? 'সক্রিয়' : 'ACTIVE'}
          </span>
        </div>
      </div>

      {/* Executive Grid Intelligence & Vulnerability Predictor (System-Level AI) */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 dark:border-purple-500/40 bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950 text-white p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                {isBn ? 'ডেসকো এক্সিকিউটিভ গ্রিড নিউরাল প্রেডিক্টর' : 'DESCO Executive Grid Neural Predictor'}
              </div>

              <Badge variant="ai" className="text-white border-purple-400/30 bg-purple-500/30 text-xs">
                {isBn ? '৯৮.৬% ফ্লিট বিশ্লেষণ নির্ভুলতা' : '98.6% Fleet Analysis Confidence'}
              </Badge>

              {criticalCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" /> {isBn ? 'সংযোগ বিচ্ছিন্নের উচ্চ ঝুঁকি' : 'High Cutoff Hazard'}
                </span>
              )}
            </div>

            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-snug">
              {criticalCount > 0
                ? isBn
                  ? `সিস্টেম বিচ্ছিন্নতার ঝুঁকি: ${criticalCount}টি মিটার (${criticalMeters[0]?.name || 'গ্রাহক'} #${criticalMeters[0]?.meterNumber || '066120003770'}) সংকটজনক সীমার নিচে (৳${criticalMeters[0]?.currentBalance ?? '78.18'} / ৳${criticalMeters[0]?.criticalThreshold ?? '100'})।`
                  : `System Disconnection Risk: ${criticalCount} meter (${criticalMeters[0]?.name || 'Premise'} #${criticalMeters[0]?.meterNumber || '066120003770'}) is below critical limit (৳${criticalMeters[0]?.currentBalance ?? '78.18'} / ৳${criticalMeters[0]?.criticalThreshold ?? '100'}).`
                : isBn
                ? `ম্যাক্রো গ্রিড স্বাস্থ্য অনুকূল: সমস্ত ${totalMeters}টি মিটার সংযোগ বিচ্ছিন্নকরণ সীমার উপরে রয়েছে।`
                : `Macro Grid Health Optimal: All ${totalMeters} distribution meters operating above disconnection thresholds.`}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              {isBn
                ? `স্বয়ংক্রিয় থ্রেশহোল্ড স্ক্যানার নিবন্ধিত অ্যাকাউন্ট ${criticalMeters[0]?.notificationEmail || user?.email}-এ সতর্কবার্তা প্রেরণ যাচাই করেছে। অবিচ্ছিন্ন বিচ্ছিন্নতা প্রতিরোধের জন্য রিয়েল-টাইম ব্যালেন্স পর্যবেক্ষণ সক্রিয়।`
                : `Automated threshold scanner verified delivery of warning notifications to registered account ${criticalMeters[0]?.notificationEmail || user?.email}. Real-time balance monitoring active for continuous disconnection prevention.`}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{isBn ? 'মোট সক্রিয় গ্রাহক:' : 'Total Monitored Accounts:'}</span>
                <span className="text-white font-semibold">{mockUsers.length} {isBn ? 'টি প্রোফাইল' : 'Active Profiles'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{isBn ? 'মোট প্রিপেইড ব্যালেন্স:' : 'Aggregate Float:'}</span>
                <span className="text-emerald-400 font-semibold">{formatCurrency(totalSystemBalance)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{isBn ? 'দায়িত্বপ্রাপ্ত অ্যাডমিন:' : 'Active Duty Admins:'}</span>
                <span className="text-purple-300 font-semibold">{adminUsers.length} {isBn ? 'জন কর্মকর্তা' : 'Certified Officers'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{isBn ? 'গেটওয়ে নির্ভরযোগ্যতা:' : 'Gateway Reliability:'}</span>
                <span className="text-teal-300 font-semibold">99.9% Uptime</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5">
            <Button
              size="md"
              variant="primary"
              disabled={isScanning || isSyncing}
              onClick={handleGlobalScan}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-950/30 border-none text-xs cursor-pointer"
              leftIcon={<Activity className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />}
            >
              {isScanning
                ? isBn
                  ? 'গ্রিড মূল্যায়ন হচ্ছে...'
                  : 'Evaluating Grid...'
                : isBn
                ? 'গ্লোবাল অডিট স্ক্যান চালান'
                : 'Run Global Audit Scan'}
            </Button>
            <Button
              size="md"
              variant="outline"
              onClick={() => onNavigateSection('system_settings')}
              className="border-purple-800 bg-slate-900 text-purple-200 hover:bg-purple-950 text-xs cursor-pointer"
            >
              {isBn ? 'সিস্টেম মাস্টার প্যারামিটার' : 'System Master Parameters'}
            </Button>
          </div>
        </div>
      </div>

      {/* Two-Column Layout: Emergency Fleet Triage + Audit & Governance Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Urgent Fleet Triage Table & Recent Security Audits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Watchlist Fleet Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  {isBn ? 'নির্বাহী ফ্লিট নজরদারি ও জরুরি ট্রায়াজ' : 'Executive Fleet Surveillance & Urgent Triage'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isBn
                    ? `সংকটজনক ও সতর্কতা স্তরের অগ্রাধিকারসহ সমস্ত ${allMeters.length}টি মিটারের লাইভ ওভারভিউ`
                    : `Complete view of all ${allMeters.length} grid meters with priority focus on critical & warning states`}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigateSection('meter_management')}
                className="text-xs"
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                {isBn ? 'ফ্লিট ম্যানেজার' : 'Fleet Manager'}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">{isBn ? 'মিটার ও স্থান' : 'Premise & Meter'}</th>
                    <th className="py-3 px-4">{isBn ? 'গ্রাহক একাউন্ট' : 'Consumer Account'}</th>
                    <th className="py-3 px-4">{isBn ? 'বর্তমান ব্যালেন্স' : 'Current Balance'}</th>
                    <th className="py-3 px-4">{isBn ? 'নির্ধারিত সীমা' : 'Assigned Limits'}</th>
                    <th className="py-3 px-4">{isBn ? 'অবস্থা' : 'Status'}</th>
                    <th className="py-3 px-4 text-right">{isBn ? 'নির্বাহী অ্যাকশন' : 'Executive Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {allMeters
                    .slice()
                    .sort((a, b) => {
                      const score = (status: string) => (status === 'critical' ? 3 : status === 'low' ? 2 : 1);
                      return score(b.status) - score(a.status);
                    })
                    .map((m) => {
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
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{m.name}</p>
                            <p className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                              #{m.meterNumber}
                            </p>
                          </td>

                          <td className="py-3 px-4">
                            <p className="text-slate-800 dark:text-slate-200">{m.userEmail}</p>
                            <p className="text-[10px] text-slate-400">{m.tariffType}</p>
                          </td>

                          <td className="py-3 px-4">
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

                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">
                            <span className="text-amber-600 dark:text-amber-400">৳{m.lowThreshold}</span>
                            <span className="text-slate-400 mx-1">/</span>
                            <span className="text-rose-600 dark:text-rose-400">৳{m.criticalThreshold}</span>
                          </td>

                          <td className="py-3 px-4">
                            <Badge variant={m.status} size="sm">
                              {m.status === 'critical'
                                ? isBn
                                  ? 'সংকটজনক'
                                  : 'Critical'
                                : m.status === 'low'
                                ? isBn
                                  ? 'স্বল্প ব্যালেন্স'
                                  : 'Low Alert'
                                : isBn
                                ? 'নিরাপদ'
                                : 'Healthy'}
                            </Badge>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant={isCrit ? 'primary' : 'outline'}
                                isLoading={sendingAlertId === m.id}
                                onClick={() => handleDirectAlert(m)}
                                className={`text-[11px] px-2.5 py-1 ${
                                  isCrit ? 'bg-rose-600 hover:bg-rose-700 text-white border-none' : ''
                                }`}
                                title={isBn ? 'গ্রাহককে সতর্কবার্তা পাঠান' : 'Dispatch manual warning to consumer'}
                                leftIcon={<Send className="w-3 h-3" />}
                              >
                                {isBn ? 'নোটিশ পাঠান' : 'Dispatch'}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                isLoading={pollingId === m.id}
                                onClick={() => handleForcePoll(m.id)}
                                title={isBn ? 'গেটওয়ে থেকে ডেটা রিফ্রেশ করুন' : 'Force poll from AMR gateway'}
                                className="px-2"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Forensic Security & Audit Activity Trail */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  {isBn ? 'সাম্প্রতিক সিস্টেম টেলিমেট্রি ও সিকিউরিটি অডিট' : 'Recent System Telemetry & Security Audit Trail'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isBn
                    ? 'গেটওয়ে সিঙ্ক্রোনাইজেশন, নোটিফিকেশন ডিসপ্যাচ ও অ্যাডমিন লগইনের রেকর্ড'
                    : 'Immutable records of gateway synchronization, threshold dispatches, and administrative logins'}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigateSection('audit_logs')}
                className="text-xs"
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                {isBn ? 'সমস্ত অডিট লগ' : 'All Audit Logs'}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-2.5 px-4">{isBn ? 'সময়' : 'Timestamp'}</th>
                    <th className="py-2.5 px-4">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                    <th className="py-2.5 px-4">{isBn ? 'কর্তা' : 'Actor'}</th>
                    <th className="py-2.5 px-4">{isBn ? 'লক্ষ্য' : 'Target Entity'}</th>
                    <th className="py-2.5 px-4 text-right">{isBn ? 'অবস্থা' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {mockAuditLogs.slice(0, 4).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 font-sans">
                        {formatDate(log.timestamp, 'long')}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 font-sans">
                        {log.actorEmail}
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200 font-sans">
                        {log.target}
                      </td>
                      <td className="py-2.5 px-4 text-right font-sans">
                        <Badge
                          variant={
                            log.status === 'success' ? 'healthy' : log.status === 'warning' ? 'low' : 'critical'
                          }
                          size="sm"
                        >
                          {log.status === 'success'
                            ? isBn
                              ? 'সফল'
                              : 'success'
                            : log.status === 'warning'
                            ? isBn
                              ? 'সতর্কতা'
                              : 'warning'
                            : isBn
                            ? 'ব্যর্থ'
                            : 'critical'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Super Admin Governance Control Hub + Staff Officers on Duty */}
        <div className="space-y-6">
          {/* Super Admin Quick Control Hub */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                {isBn ? 'রুট গভর্ন্যান্স মডিউল' : 'Root Governance Modules'}
              </h3>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                {isBn ? 'অনন্য' : 'Exclusive'}
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onNavigateSection('admin_management')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/50 dark:hover:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/50 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {isBn ? 'অ্যাডমিন কর্মকর্তা গভর্ন্যান্স' : 'Admin Staff Governance'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isBn ? 'কর্মকর্তা নিয়োগ ও রোল পরিচালনা' : 'Provision officers & configure roles'}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateSection('email_config')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {isBn ? 'ইমেইল গেটওয়ে ও এসএমটিপি রিলে' : 'Email Gateway & SMTP Relay'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isBn ? 'মেইল সার্ভার ও টেমপ্লেট কনফিগারেশন' : 'Configure Mailgun server & templates'}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateSection('system_settings')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {isBn ? 'গ্লোবাল মাস্টার প্যারামিটার' : 'Global Master Parameters'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isBn ? 'ডিফল্ট থ্রেশহোল্ড, স্ক্যানিং সময় ও ট্রিপ' : 'Default thresholds, scan timing & auto-trip'}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateSection('users')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {isBn ? 'গ্রাহক একাউন্ট ডিরেক্টরি' : 'Consumer Accounts Directory'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isBn ? 'সকল নাগরিক ও তাদের মিটার পরিচালনা' : 'Manage all registered citizens & meters'}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Active Staff Administrators on Duty */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {isBn ? 'দায়িত্বপ্রাপ্ত কর্মকর্তা' : 'Active Staff Officers'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isBn ? 'লাইভ সিস্টেম ক্ষমতাপ্রাপ্ত অ্যাডমিন' : 'Admins with live system privileges'}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onNavigateSection('admin_management')}
                className="text-xs text-purple-600"
              >
                {isBn ? 'পরিচালনা' : 'Manage'}
              </Button>
            </div>

            <div className="space-y-2.5">
              {adminUsers.map((adm) => (
                <div
                  key={adm.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <img
                      src={adm.avatar}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                      }}
                      referrerPolicy="no-referrer"
                      alt={adm.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-purple-400/40"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        {adm.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {adm.position || (adm.role === 'super_admin' ? (isBn ? 'প্রধান পরিচালনা অধিকর্তা' : 'Chief Operations Director') : (isBn ? 'অপারেশনস অফিসার' : 'Operations Officer'))}
                      </p>
                    </div>
                  </div>
                  <Badge variant={adm.role === 'super_admin' ? 'critical' : 'info'} size="sm">
                    {adm.role === 'super_admin' ? (isBn ? 'সুপার অ্যাডমিন' : 'Super Admin') : (isBn ? 'অ্যাডমিন' : 'Admin')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
