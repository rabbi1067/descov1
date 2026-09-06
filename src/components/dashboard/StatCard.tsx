import React, { ReactNode } from 'react';
import { Card } from '../common/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label: string;
  };
  badge?: ReactNode;
  statusColor?: 'emerald' | 'amber' | 'rose' | 'blue' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  badge,
  statusColor = 'emerald',
}) => {
  const iconBgClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  };

  return (
    <Card hoverEffect className="p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase truncate" title={title}>
          {title}
        </span>
        <div className={`p-2 rounded-xl shrink-0 ${iconBgClasses[statusColor]}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 sm:mt-4 min-w-0">
        <div className="flex items-baseline flex-wrap gap-1.5 min-w-0">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 truncate" title={String(value)}>
            {value}
          </span>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>

        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate" title={subtitle}>{subtitle}</p>
        )}

        {trend && (
          <div className="flex items-center gap-1.5 mt-2 text-xs truncate">
            <span
              className={`font-semibold shrink-0 ${
                trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.value}
            </span>
            <span className="text-slate-400 dark:text-slate-500 truncate">{trend.label}</span>
          </div>
        )}
      </div>
    </Card>
  );
};
