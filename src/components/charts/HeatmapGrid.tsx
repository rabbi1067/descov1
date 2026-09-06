import React from 'react';

interface HeatmapGridProps {
  period?: '7d' | '14d' | '30d';
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({ period = '14d' }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = ['Morning', 'Afternoon', 'Peak Evening', 'Night'];

  // Realistic intensity grid (0: low, 1: moderate, 2: elevated, 3: peak)
  const heatmapData = React.useMemo(() => {
    if (period === '7d') {
      return [
        [1, 2, 3, 1], // Mon
        [1, 2, 3, 1], // Tue
        [1, 1, 3, 1], // Wed
        [2, 2, 3, 1], // Thu
        [2, 3, 3, 2], // Fri
        [2, 3, 3, 2], // Sat
        [1, 2, 3, 1], // Sun
      ];
    }
    if (period === '14d') {
      return [
        [2, 2, 3, 1], // Mon
        [1, 2, 3, 1], // Tue
        [1, 2, 3, 1], // Wed
        [2, 2, 3, 2], // Thu
        [2, 3, 3, 2], // Fri
        [3, 3, 3, 2], // Sat
        [2, 2, 3, 1], // Sun
      ];
    }
    // 30d
    return [
      [2, 2, 3, 1], // Mon
      [2, 2, 3, 1], // Tue
      [1, 2, 3, 1], // Wed
      [2, 3, 3, 2], // Thu
      [3, 3, 3, 2], // Fri
      [3, 3, 3, 2], // Sat
      [2, 2, 3, 2], // Sun
    ];
  }, [period]);

  const getIntensityColor = (val: number) => {
    switch (val) {
      case 3:
        return 'bg-emerald-600 dark:bg-emerald-500 text-white';
      case 2:
        return 'bg-emerald-400/80 dark:bg-emerald-600/70 text-slate-900 dark:text-white';
      case 1:
        return 'bg-emerald-200/60 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300';
      default:
        return 'bg-slate-100 dark:bg-slate-800/60 text-slate-400';
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-medium text-slate-400">
        <div></div>
        {times.map((t) => (
          <div key={t} className="truncate">{t}</div>
        ))}
      </div>

      {days.map((d, dIdx) => (
        <div key={d} className="grid grid-cols-5 gap-2 items-center">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 text-right pr-2">
            {d}
          </span>
          {heatmapData[dIdx].map((level, tIdx) => (
            <div
              key={tIdx}
              className={`h-8 rounded-lg flex items-center justify-center text-[10px] font-semibold transition-all hover:scale-105 cursor-pointer ${getIntensityColor(
                level
              )}`}
              title={`${d} ${times[tIdx]}: ${level === 3 ? 'Peak Usage (৳40-60/hr)' : level === 2 ? 'Moderate' : 'Low'}`}
            >
              {level === 3 ? 'Peak' : level === 2 ? 'Med' : 'Low'}
            </div>
          ))}
        </div>
      ))}

      <div className="flex items-center justify-end gap-3 pt-3 text-[11px] text-slate-500 dark:text-slate-400">
        <span>Usage Intensity:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-300 dark:bg-emerald-900" />
          <span>Med</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-600 dark:bg-emerald-500" />
          <span>Peak</span>
        </div>
      </div>
    </div>
  );
};
