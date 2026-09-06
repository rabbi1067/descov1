import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

interface RadialChartProps {
  currentBalance: number;
  maxCapacity?: number;
  lowThreshold?: number;
  criticalThreshold?: number;
  size?: number;
}

export const RadialChart: React.FC<RadialChartProps> = ({
  currentBalance,
  maxCapacity = 2000,
  lowThreshold = 300,
  criticalThreshold = 100,
  size = 180,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((currentBalance / maxCapacity) * 100)));
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let colorClass = '#10b981'; // green
  if (currentBalance <= criticalThreshold) {
    colorClass = '#f43f5e'; // red
  } else if (currentBalance <= lowThreshold) {
    colorClass = '#f59e0b'; // amber
  }

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-slate-100 dark:text-slate-800/80"
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorClass}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {formatCurrency(currentBalance)}
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          {percentage}% Capacity
        </span>
      </div>
    </div>
  );
};
