import React from 'react';
import {
  Wallet,
  Activity,
  Calendar,
  Clock,
  Zap,
  TrendingDown,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Plus,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMeters } from '../context/MeterContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { StatCard } from '../components/dashboard/StatCard';
import { AIInsightCard } from '../components/dashboard/AIInsightCard';
import { BalanceLineChart } from '../components/charts/BalanceLineChart';
import { MeterCard } from '../components/dashboard/MeterCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { DashboardSection } from '../types';

interface DashboardSectionProps {
  onOpenAddMeter: () => void;
  onOpenRecharge: () => void;
  onNavigateSection: (section: DashboardSection) => void;
}

export const DashboardSectionComponent: React.FC<DashboardSectionProps> = ({
  onOpenAddMeter,
  onOpenRecharge,
  onNavigateSection,
}) => {
  const { user } = useAuth();
  const { isBn } = useLanguage();
  const { meters, activeMeter, setActiveMeterId, activeHistory, aiPrediction } = useMeters();

  const balance = activeMeter?.currentBalance ?? 240;
  const status = activeMeter?.status ?? 'low';
  const monthlyUsageEstimate = Math.round(aiPrediction.averageUsage * 30);

  const getStatusBadge = () => {
    switch (status) {
      case 'critical':
        return (
          <Badge variant="critical" size="sm">
            <AlertCircle className="w-3 h-3" /> {isBn ? 'সংকটপূর্ণ' : 'Critical'}
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="low" size="sm">
            <ShieldAlert className="w-3 h-3" /> {isBn ? 'স্বল্প ব্যালেন্স' : 'Low Alert'}
          </Badge>
        );
      default:
        return (
          <Badge variant="healthy" size="sm">
            <ShieldCheck className="w-3 h-3" /> {isBn ? 'পর্যাপ্ত' : 'Healthy'}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Consumer Smart Balance Quick Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-800/40 text-white shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold tracking-wide uppercase">
              {isBn ? 'সংযুক্ত স্মার্ট মিটার' : 'Connected Smart Meter'}
            </span>
            <span className="text-xs text-slate-300 font-mono">
              #{activeMeter?.meterNumber || '066120003770'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {activeMeter?.name || (isBn ? 'বাসার প্রিপেইড মিটার' : 'Prepaid Residence Meter')}
          </h2>
          <p className="text-xs text-emerald-200/80">
            {isBn ? 'গ্রাহক:' : 'Consumer:'}{' '}
            <span className="font-semibold text-white">{user?.name || 'Tanzil Ahmed'}</span> •{' '}
            {isBn ? 'হিসাব নং' : 'Account'} #{activeMeter?.accountNumber || '21000736'} •{' '}
            {activeMeter?.sanctionedLoad || '5 kW'} {isBn ? 'লোড' : 'Load'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenAddMeter}
            className="border-emerald-600/60 bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900 text-xs cursor-pointer"
            leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-400" />}
          >
            {isBn ? 'মিটার যোগ' : 'Add Meter'}
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={onOpenRecharge}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer shadow-md shadow-emerald-900/40"
            leftIcon={<Zap className="w-3.5 h-3.5" />}
          >
            {isBn ? 'টোকেন রিচার্জ' : 'Recharge Token'}
          </Button>
        </div>
      </div>
      {/* Top 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: Current Balance */}
        <StatCard
          title={isBn ? 'বর্তমান ব্যালেন্স' : 'Current Balance'}
          value={formatCurrency(balance)}
          subtitle={activeMeter ? `#${activeMeter.meterNumber}` : isBn ? 'প্রিপেইড মিটার' : 'Prepaid Meter'}
          icon={<Wallet className="w-5 h-5" />}
          statusColor={status === 'critical' ? 'rose' : status === 'low' ? 'amber' : 'emerald'}
          trend={{
            value: `৳${aiPrediction.dailyConsumption}`,
            isPositive: false,
            label: isBn ? 'আজ খরচ' : 'consumed today',
          }}
        />

        {/* Card 2: Balance Status */}
        <StatCard
          title={isBn ? 'ব্যালেন্সের অবস্থা' : 'Balance Status'}
          value={
            status === 'healthy'
              ? isBn
                ? 'অনুকূল'
                : 'Optimal'
              : status === 'low'
              ? isBn
                ? 'সতর্কতা'
                : 'Attention'
              : isBn
              ? 'জরুরি'
              : 'Emergency'
          }
          subtitle={`${isBn ? 'সীমা' : 'Threshold'}: ৳${activeMeter?.lowThreshold ?? 300}`}
          icon={<Activity className="w-5 h-5" />}
          badge={getStatusBadge()}
          statusColor={status === 'critical' ? 'rose' : status === 'low' ? 'amber' : 'emerald'}
        />

        {/* Card 3: Remaining Days */}
        <StatCard
          title={isBn ? 'অবশিষ্ট দিন' : 'Remaining Days'}
          value={`~${aiPrediction.remainingDays} ${isBn ? 'দিন' : 'Days'}`}
          subtitle={`৳${aiPrediction.averageUsage}/${isBn ? 'দিন গড়ে' : 'day avg'}`}
          icon={<Calendar className="w-5 h-5" />}
          statusColor={aiPrediction.remainingDays <= 2 ? 'rose' : 'blue'}
          trend={{
            value: `${aiPrediction.confidenceScore}%`,
            isPositive: true,
            label: isBn ? 'এআই নিশ্চিততা' : 'AI confidence',
          }}
        />

        {/* Card 4: Last Check */}
        <StatCard
          title={isBn ? 'সর্বশেষ সিঙ্ক' : 'Last Synchronized'}
          value={formatDate(activeMeter?.lastUpdated, 'relative')}
          subtitle={isBn ? 'ডেসকো গেটওয়ে সংযোগ' : 'DESCO Gateway Link'}
          icon={<Clock className="w-5 h-5" />}
          statusColor="slate"
        />

        {/* Card 5: Monthly Usage */}
        <StatCard
          title={isBn ? 'মাসিক প্রক্ষেপণ' : 'Monthly Projected'}
          value={formatCurrency(monthlyUsageEstimate)}
          subtitle={isBn ? '৭ দিনের হারের ভিত্তিতে' : 'Based on 7-day rate'}
          icon={<Zap className="w-5 h-5" />}
          statusColor="blue"
          trend={{
            value: '-3.8%',
            isPositive: true,
            label: isBn ? 'গত মাসের তুলনায়' : 'vs last month',
          }}
        />
      </div>

      {/* Second Row: AI Smart Suggestion Card (Prompt Mandatory) */}
      <AIInsightCard prediction={aiPrediction} onQuickRecharge={onOpenRecharge} />

      {/* Third Row: Balance History Line Chart + Quick Meter Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Balance Trajectory Line Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {isBn ? 'প্রিপেইড ব্যালেন্স গতিবিধি' : 'Prepaid Balance Trajectory'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isBn
                  ? 'দৈনিক সমাপনী ব্যালেন্স (৳) সাথে নিম্ন ও সংকট সতর্কতা সীমা'
                  : 'Daily closing balances (৳) with low & critical alert thresholds'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigateSection('analytics')}
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                {isBn ? 'বিস্তারিত অ্যানালিটিক্স' : 'Deep Analytics'}
              </Button>
            </div>
          </div>

          <BalanceLineChart
            data={activeHistory}
            lowThreshold={activeMeter?.lowThreshold ?? 300}
            criticalThreshold={activeMeter?.criticalThreshold ?? 100}
            height={280}
          />
        </div>

        {/* Right 1 Col: Connected Meters mini list */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {isBn ? `আপনার মিটার (${meters.length})` : `Your Meters (${meters.length})`}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={onOpenAddMeter}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                {isBn ? 'যোগ' : 'Add'}
              </Button>
            </div>

            <div className="space-y-3">
              {meters.slice(0, 3).map((m) => {
                const isActive = activeMeter?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setActiveMeterId(m.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {m.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">#{m.meterNumber}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(m.currentBalance)}
                      </p>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {m.status === 'healthy'
                          ? isBn
                            ? 'পর্যাপ্ত'
                            : 'healthy'
                          : m.status === 'low'
                          ? isBn
                            ? 'স্বল্প'
                            : 'low'
                          : isBn
                          ? 'সংকট'
                          : 'critical'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => onNavigateSection('meters')}
            >
              {isBn ? 'সকল মিটার পরিচালনা' : 'Manage All Meters'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
