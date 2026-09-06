import React from 'react';
import { Zap, Clock, ShieldAlert, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Meter } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface MeterCardProps {
  meter: Meter;
  isActive?: boolean;
  onSelect?: () => void;
  onRecharge?: () => void;
}

export const MeterCard: React.FC<MeterCardProps> = ({
  meter,
  isActive = false,
  onSelect,
  onRecharge,
}) => {
  const { isBn } = useLanguage();
  const isHealthy = meter.status === 'healthy';
  const isLow = meter.status === 'low';
  const isCritical = meter.status === 'critical';

  return (
    <Card
      hoverEffect
      className={`p-5 flex flex-col justify-between transition-all ${
        isActive
          ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20'
          : ''
      }`}
    >
      <div>
        {/* Top Header - Responsive flex with no premature truncation */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug break-words">
                {meter.name}
              </h4>
              {isActive && (
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full shrink-0 border border-emerald-300/40">
                  {isBn ? 'সক্রিয়' : 'Active'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              #{meter.meterNumber}
            </p>
          </div>

          <div className="shrink-0">
            <Badge variant={meter.status}>
              {isHealthy && <CheckCircle2 className="w-3 h-3" />}
              {isLow && <ShieldAlert className="w-3 h-3" />}
              {isCritical && <Zap className="w-3 h-3 animate-bounce" />}
              <span>
                {isHealthy
                  ? isBn
                    ? 'পর্যাপ্ত'
                    : 'Healthy'
                  : isLow
                  ? isBn
                    ? 'স্বল্প ব্যালেন্স'
                    : 'Low Alert'
                  : isBn
                  ? 'সংকটপূর্ণ'
                  : 'Critical'}
              </span>
            </Badge>
          </div>
        </div>

        {/* Current Balance Display */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {isBn ? 'প্রিপেইড ব্যালেন্স' : 'Prepaid Balance'}
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span
              className={`text-2xl font-black tracking-tight ${
                isCritical
                  ? 'text-rose-600 dark:text-rose-400'
                  : isLow
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formatCurrency(meter.currentBalance)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isBn ? 'সতর্কতা:' : 'Low:'} ৳{meter.lowThreshold}
            </span>
          </div>
        </div>

        {/* Meter Attributes - Clear full width text without awkward cutoff */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="min-w-0">
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium">
              {isBn ? 'ট্যারিফ প্ল্যান' : 'Tariff Plan'}
            </span>
            <span
              className="font-semibold text-slate-800 dark:text-slate-200 block leading-snug"
              title={meter.tariffType}
            >
              {meter.tariffType}
            </span>
          </div>
          <div className="text-right sm:text-left">
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium">
              {isBn ? 'অনুমোদিত লোড' : 'Sanctioned Load'}
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              {meter.sanctionedLoad}
            </span>
          </div>
        </div>
      </div>

      {/* Footer & Actions */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Clock className="w-3 h-3" />
          <span>{formatDate(meter.lastUpdated, 'relative')}</span>
        </div>

        <div className="flex items-center gap-2">
          {onSelect && !isActive && (
            <Button size="sm" variant="outline" onClick={onSelect} className="cursor-pointer text-xs">
              {isBn ? 'নির্বাচন' : 'Select'}
            </Button>
          )}
          <Button
            size="sm"
            variant="primary"
            onClick={onRecharge}
            rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
            className="cursor-pointer text-xs font-semibold"
          >
            {isBn ? 'রিচার্জ' : 'Recharge'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
