import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageToggle: React.FC<{ variant?: 'badge' | 'minimal' }> = ({ variant = 'badge' }) => {
  const { language, toggleLanguage } = useLanguage();

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
        title="Switch Language (বাংলা / English)"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="whitespace-nowrap">{language === 'en' ? 'বাংলা' : 'EN'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all cursor-pointer shadow-2xs shrink-0"
      title="Switch Language (বাংলা / English)"
    >
      <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span className="font-mono text-[11px] sm:text-xs whitespace-nowrap">{language === 'en' ? 'বাংলা' : 'ENG'}</span>
    </button>
  );
};
