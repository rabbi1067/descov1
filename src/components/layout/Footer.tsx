import React from 'react';
import { Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-6 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white">
          <Zap className="w-3 h-3 fill-current" />
        </div>
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          DESCO Smart Balance Monitor
        </span>
        <span>•</span>
        <span>v2.4.0 (FastAPI-ready)</span>
      </div>

      <div className="flex items-center gap-4 text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Gateway Connected (100% Operational)
        </span>
        <span>Dhaka Electric Supply Company Limited</span>
      </div>
    </footer>
  );
};
