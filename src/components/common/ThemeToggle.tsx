import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle: React.FC<{ variant?: 'icon' | 'segmented' }> = ({ variant = 'segmented' }) => {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title={actualTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle theme"
      >
        {actualTheme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200 animate-in spin-in-180 duration-200" />
        )}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Light mode"
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
          theme === 'dark'
            ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Dark mode"
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Dark</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('system')}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Follow system theme"
      >
        <Laptop className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Auto</span>
      </button>
    </div>
  );
};
