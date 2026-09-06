import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'subtle' | 'gradient-glow';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200 overflow-hidden';

  const variantStyles = {
    default:
      'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)]',
    glass:
      'backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/40 dark:border-slate-800/60 shadow-lg shadow-slate-200/20 dark:shadow-none',
    subtle:
      'bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40',
    'gradient-glow':
      'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-500/15 dark:via-cyan-950/20 dark:to-slate-900 border border-emerald-500/20 dark:border-emerald-500/30 shadow-md',
  };

  const hoverStyles = hoverEffect
    ? 'hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
    : '';

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};
