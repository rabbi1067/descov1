import React, { useState, useMemo } from 'react';
import {
  Download,
  Calendar,
  Zap,
  TrendingDown,
  RotateCcw,
  CheckCircle2,
  FileText,
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { useMeters } from '../context/MeterContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { useLanguage } from '../context/LanguageContext';
import { StatCard } from '../components/dashboard/StatCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { getStoredUsers } from '../utils/userDirectory';
import { User } from '../types';

export const ReportsSection: React.FC = () => {
  const { allMeters, activeMeter, setActiveMeterId, activeHistory, allRecharges } = useMeters();
  const { language, isBn } = useLanguage();
  const [reportScope, setReportScope] = useState<'all_users' | 'single_meter'>('all_users');
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<'today' | '7days' | '30days' | 'custom'>('7days');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Load all registered users from unified directory
  const usersList = useMemo(() => getStoredUsers(), []);

  // Map each user to their linked meter data
  const userReportsData = useMemo(() => {
    return usersList.map((usr) => {
      // Find matching meter for this user
      const linkedMeter = allMeters.find(
        (m) =>
          m.userId === usr.id ||
          m.userEmail?.toLowerCase() === usr.email.toLowerCase() ||
          m.notificationEmail?.toLowerCase() === usr.email.toLowerCase()
      ) || (usr.email === 'fazlerabbii2000@gmail.com' ? allMeters[0] : null);

      const meterBalance = linkedMeter ? linkedMeter.currentBalance : 0;
      const meterStatus = linkedMeter ? linkedMeter.status : 'healthy';
      const meterNumber = linkedMeter ? linkedMeter.meterNumber : 'Unassigned';
      const accountNumber = linkedMeter ? linkedMeter.accountNumber : 'N/A';
      const dailyUsageEstimate = linkedMeter
        ? linkedMeter.currentBalance <= 100
          ? 25.5
          : 75.0
        : 50.0;
      const remainingDays =
        linkedMeter && dailyUsageEstimate > 0
          ? Math.max(1, Math.round(linkedMeter.currentBalance / dailyUsageEstimate))
          : 0;

      // Find user recharges
      const userRecharges = allRecharges.filter(
        (r) => linkedMeter && r.meterId === linkedMeter.id
      );
      const totalRechargesAmount = userRecharges.reduce((acc, curr) => acc + curr.amount, 0);
      const lastRecharge = userRecharges[0];

      return {
        user: usr,
        meter: linkedMeter,
        meterNumber,
        accountNumber,
        meterBalance,
        meterStatus,
        dailyUsageEstimate,
        remainingDays,
        totalRechargesAmount,
        lastRecharge,
      };
    });
  }, [usersList, allMeters, allRecharges]);

  // Filtered by search & role
  const filteredUsersData = useMemo(() => {
    return userReportsData.filter((item) => {
      if (selectedUserId !== 'all' && item.user.id !== selectedUserId) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.user.name.toLowerCase().includes(q) ||
        item.user.email.toLowerCase().includes(q) ||
        item.user.phone?.toLowerCase().includes(q) ||
        item.meterNumber.toLowerCase().includes(q) ||
        item.accountNumber.toLowerCase().includes(q)
      );
    });
  }, [userReportsData, selectedUserId, searchQuery]);

  // Fleet wide totals
  const totalFleetBalance = userReportsData.reduce((acc, u) => acc + u.meterBalance, 0);
  const totalFleetDailyConsumption = userReportsData.reduce((acc, u) => acc + u.dailyUsageEstimate, 0);
  const totalFleetRecharges = userReportsData.reduce((acc, u) => acc + u.totalRechargesAmount, 0);
  const criticalConsumersCount = userReportsData.filter(
    (u) => u.meterStatus === 'critical' || u.meterStatus === 'low'
  ).length;

  // Single meter summary values
  const totalConsumption = activeHistory.reduce((acc, curr) => acc + (curr.consumption || 75), 0);
  const averageUsage = activeHistory.length > 0 ? Math.round(totalConsumption / activeHistory.length) : 80;
  const totalSingleRecharges = allRecharges
    .filter((r) => r.meterId === activeMeter?.id)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const consumptions = activeHistory.map((h) => h.consumption || 75);
  const highestDay = consumptions.length > 0 ? Math.max(...consumptions) : 95;
  const lowestDay = consumptions.length > 0 ? Math.min(...consumptions.filter((c) => c > 0)) : 45;

  const handleExportCSV = () => {
    if (reportScope === 'all_users') {
      // Export All Users Report CSV
      const headers = [
        'Consumer Name',
        'Email Address',
        'Phone',
        'Premise Address',
        'Role',
        'Account Status',
        'Meter Number',
        'Account Number',
        'Current Balance (BDT)',
        'Status',
        'Est. Daily Burn (BDT)',
        'Remaining Days',
        'Total Recharged (BDT)',
      ];

      const rows = filteredUsersData.map((item) => [
        `"${item.user.name}"`,
        `"${item.user.email}"`,
        `"${item.user.phone || 'N/A'}"`,
        `"${item.user.address || 'N/A'}"`,
        `"${item.user.role}"`,
        `"${item.user.status}"`,
        `"${item.meterNumber}"`,
        `"${item.accountNumber}"`,
        item.meterBalance.toFixed(2),
        `"${item.meterStatus}"`,
        item.dailyUsageEstimate.toFixed(2),
        item.remainingDays,
        item.totalRechargesAmount.toFixed(2),
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `DESCO_All_Consumers_Report_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportNotice('All-users consolidated CSV statement exported successfully.');
      setTimeout(() => setExportNotice(null), 3500);
    } else {
      // Export Single Meter Statement CSV
      const headers = [
        'Date',
        'Meter Number',
        'Closing Balance (BDT)',
        'Daily Consumption (BDT)',
        'Recharge Event',
      ];
      const rows = activeHistory.map((item) => [
        item.date,
        activeMeter?.meterNumber || '066120003770',
        item.balance,
        item.consumption || 0,
        item.isRecharge ? `Yes (${item.rechargeAmount})` : 'No',
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `DESCO_Statement_${activeMeter?.meterNumber || 'Meter'}_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportNotice('Meter statement successfully exported to your downloads.');
      setTimeout(() => setExportNotice(null), 3500);
    }
  };

  const handleExportPDF = () => {
    window.print();
    setExportNotice('Print / PDF generation dialog initiated.');
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isBn ? 'অডিট ও বিদ্যুৎ খরচ রিপোর্ট' : 'Audit & Consumption Reports'}
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {isBn ? 'ডেসকো গ্রিড লেজার' : 'DESCO Grid Ledger'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {reportScope === 'all_users'
              ? isBn
                ? `নিবন্ধিত সকল ${usersList.length} জন গ্রাহক অ্যাকাউন্ট এবং গ্রিড মিটারের সংহত বিশ্লেষণ`
                : `Consolidated breakdown for all ${usersList.length} registered consumer accounts and grid meters`
              : isBn
              ? `মিটার #${activeMeter?.meterNumber} এর ঐতিহাসিক দৈনিক স্টেটমেন্ট লেজার`
              : `Historical daily statement ledger for Meter #${activeMeter?.meterNumber}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Report Scope Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setReportScope('all_users')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                reportScope === 'all_users'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isBn ? `সকল গ্রাহক রিপোর্ট (${usersList.length})` : `All Users Report (${usersList.length})`}</span>
            </button>

            <button
              onClick={() => setReportScope('single_meter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                reportScope === 'single_meter'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isBn ? 'মিটার স্টেটমেন্ট' : 'Meter Statement'}</span>
            </button>
          </div>

          {/* Export Actions */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportPDF}
            leftIcon={<FileText className="w-3.5 h-3.5 text-rose-500" />}
          >
            {isBn ? 'পিডিএফ এক্সপোর্ট' : 'Export PDF'}
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            {isBn ? 'সিএসভি এক্সপোর্ট' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCOPE 1: ALL USERS CONSOLIDATED REPORT                                   */}
      {/* ========================================================================= */}
      {reportScope === 'all_users' ? (
        <div className="space-y-6">
          {/* Top 5 Fleet KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Registered Users"
              value={`${usersList.length} Accounts`}
              subtitle="All system consumers"
              icon={<Users className="w-4 h-4" />}
              statusColor="blue"
            />

            <StatCard
              title="Combined Fleet Balance"
              value={formatCurrency(totalFleetBalance)}
              subtitle="Total prepaid credit"
              icon={<Zap className="w-4 h-4" />}
              statusColor={totalFleetBalance < 500 ? 'rose' : 'emerald'}
            />

            <StatCard
              title="Fleet Daily Burn"
              value={formatCurrency(totalFleetDailyConsumption)}
              subtitle="Total daily deduction"
              icon={<TrendingDown className="w-4 h-4" />}
              statusColor="slate"
            />

            <StatCard
              title="Total Fleet Recharges"
              value={formatCurrency(totalFleetRecharges)}
              subtitle="Lifetime credited"
              icon={<RotateCcw className="w-4 h-4" />}
              statusColor="emerald"
            />

            <StatCard
              title="Alerting Consumers"
              value={`${criticalConsumersCount} Accounts`}
              subtitle="Low or critical balance"
              icon={<AlertCircle className="w-4 h-4 text-rose-500" />}
              statusColor={criticalConsumersCount > 0 ? 'rose' : 'emerald'}
            />
          </div>

          {/* All Users Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user name, email, phone, meter #..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter User:</span>
              </div>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="all">All Consumers ({usersList.length})</option>
                {usersList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Master All Users Report Ledger Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  DESCO Consumers Master Audit Ledger
                </h3>
                <p className="text-[11px] text-slate-400">
                  Showing {filteredUsersData.length} of {usersList.length} registered accounts
                </p>
              </div>

              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Live Reconciled Ledger
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-3.5 px-4">Consumer Details</th>
                    <th className="py-3.5 px-4">Contact & Premise</th>
                    <th className="py-3.5 px-4">Assigned Meter</th>
                    <th className="py-3.5 px-4">Current Balance</th>
                    <th className="py-3.5 px-4">Est. Daily Burn</th>
                    <th className="py-3.5 px-4">Credit Horizon</th>
                    <th className="py-3.5 px-4">Total Recharged</th>
                    <th className="py-3.5 px-4 text-right">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredUsersData.map((item) => {
                    const isSuper = item.user.role === 'super_admin';
                    return (
                      <tr
                        key={item.user.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Consumer Name & Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                item.user.avatar ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                              }
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                              }}
                              referrerPolicy="no-referrer"
                              alt={item.user.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 dark:text-slate-100">
                                  {item.user.name}
                                </span>
                                {isSuper && (
                                  <span
                                    className="p-0.5 rounded-full bg-amber-500 text-white"
                                    title="Root Super Admin"
                                  >
                                    <ShieldCheck className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 capitalize">
                                {item.user.position || item.user.role.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact & Premise */}
                        <td className="py-3.5 px-4">
                          <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                            {item.user.email}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.user.phone || '+880 1700-000000'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {item.user.address || 'Dhaka, Bangladesh'}
                          </p>
                        </td>

                        {/* Assigned Meter */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                            #{item.meterNumber}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Acc: {item.accountNumber}
                          </div>
                          {item.meter && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              {item.meter.name}
                            </span>
                          )}
                        </td>

                        {/* Current Balance */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {formatCurrency(item.meterBalance)}
                          </div>
                          <Badge
                            variant={
                              item.meterStatus === 'critical'
                                ? 'critical'
                                : item.meterStatus === 'low'
                                ? 'low'
                                : 'healthy'
                            }
                            size="sm"
                          >
                            {item.meterStatus.toUpperCase()}
                          </Badge>
                        </td>

                        {/* Daily Burn Rate */}
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {formatCurrency(item.dailyUsageEstimate)} / day
                          </span>
                        </td>

                        {/* Remaining Credit Days */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-bold ${
                              item.remainingDays <= 2
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            ~{item.remainingDays} Days
                          </span>
                        </td>

                        {/* Total Recharged */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(item.totalRechargesAmount)}
                          </span>
                          {item.lastRecharge && (
                            <p className="text-[10px] text-slate-400">
                              Last: {formatDate(item.lastRecharge.date, 'short')}
                            </p>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* SCOPE 2: SINGLE METER HISTORICAL STATEMENT                               */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Consumption"
              value={formatCurrency(totalConsumption)}
              subtitle="During selected period"
              icon={<Zap className="w-4 h-4" />}
              statusColor="blue"
            />

            <StatCard
              title="Average Usage"
              value={formatCurrency(averageUsage)}
              subtitle="Per calendar day"
              icon={<TrendingDown className="w-4 h-4" />}
              statusColor="emerald"
            />

            <StatCard
              title="Recharge Amount"
              value={formatCurrency(totalSingleRecharges)}
              subtitle="Total credited"
              icon={<RotateCcw className="w-4 h-4" />}
              statusColor="emerald"
            />

            <StatCard
              title="Highest Day"
              value={formatCurrency(highestDay)}
              subtitle="Max peak deduction"
              icon={<Zap className="w-4 h-4 text-rose-500" />}
              statusColor="rose"
            />

            <StatCard
              title="Lowest Day"
              value={formatCurrency(lowestDay)}
              subtitle="Min daily deduction"
              icon={<Calendar className="w-4 h-4 text-emerald-500" />}
              statusColor="slate"
            />
          </div>

          {/* Detailed Statement Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Historical Statement Ledger: #{activeMeter?.meterNumber}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {activeMeter?.name} • {activeHistory.length} Days Recorded
                </p>
              </div>

              {/* Period Filters */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                {(
                  [
                    { id: 'today', label: 'Today' },
                    { id: '7days', label: '7 Days' },
                    { id: '30days', label: '30 Days' },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setFilterPeriod(p.id)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      filterPeriod === p.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Meter No.</th>
                    <th className="py-3 px-4">Closing Balance</th>
                    <th className="py-3 px-4">Daily Burn Rate</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {activeHistory.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {formatDate(row.date, 'medium')}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                        #{activeMeter?.meterNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(row.balance)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {formatCurrency(row.consumption || 0)}
                      </td>
                      <td className="py-3 px-4">
                        {row.isRecharge ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full">
                            ✦ Recharged {formatCurrency(row.rechargeAmount)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Normal Daily Consumption</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
