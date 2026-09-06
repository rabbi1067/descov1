import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, AlertTriangle, AlertCircle, TrendingDown } from 'lucide-react';
import { AIPredictionResult } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AIInsightCardProps {
  prediction: AIPredictionResult;
  onQuickRecharge?: () => void;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ prediction, onQuickRecharge }) => {
  const isCritical = prediction.urgency === 'critical';
  const isWarning = prediction.urgency === 'warning';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 dark:border-emerald-500/40 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/90 text-white p-6 shadow-xl shadow-emerald-950/20">
      {/* Decorative ambient background blur */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left info column */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-spin" style={{ animationDuration: '6s' }} />
              DESCO Neural Runout Predictor
            </div>

            <Badge variant="ai" className="text-white border-emerald-400/30 bg-emerald-500/30 text-xs">
              {prediction.confidenceScore}% Prediction Confidence
            </Badge>

            {isCritical && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5" /> Urgent Action
              </span>
            )}
            {isWarning && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" /> Approaching Threshold
              </span>
            )}
            {!isCritical && !isWarning && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Stable Burn Rate
              </span>
            )}
          </div>

          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-snug">
            {prediction.insight}
          </h3>

          <p className="text-sm text-slate-300 leading-relaxed">
            {prediction.recommendation}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Current Balance:</span>
              <span className="text-white font-semibold">{formatCurrency(prediction.currentBalance)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Average Daily Burn:</span>
              <span className="text-emerald-400 font-semibold">{formatCurrency(prediction.averageUsage)}/day</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Suggested Recharge By:</span>
              <span className="text-amber-300 font-semibold">{prediction.suggestedRechargeDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <TrendingDown className="w-3.5 h-3.5 text-teal-400" />
              <span>Est. {prediction.remainingDays} days remaining</span>
            </div>
          </div>
        </div>

        {/* Right CTA column */}
        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
          <Button
            size="lg"
            variant="primary"
            onClick={onQuickRecharge}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/30 border-none"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Recharge Info
          </Button>
          <span className="text-[11px] text-center text-slate-400">
            Payment Gateway (Coming Soon)
          </span>
        </div>
      </div>
    </div>
  );
};
