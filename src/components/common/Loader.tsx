import React from 'react';
import { Zap } from 'lucide-react';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'full';
  label?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', label = 'Loading DESCO Monitor...' }) => {
  if (size === 'full') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
        <div className="relative flex items-center justify-center">
          {/* Animated pulse ring */}
          <div className="absolute w-20 h-20 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
            <Zap className="w-8 h-8 fill-current animate-bounce" />
          </div>
        </div>
        <div className="mt-6 text-center">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{label}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Checking smart prepaid meter telemetry...</p>
        </div>
      </div>
    );
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3">
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-pulse">
          <Zap className={`${iconSizes[size]} fill-current`} />
        </div>
      </div>
      {label && <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>}
    </div>
  );
};
