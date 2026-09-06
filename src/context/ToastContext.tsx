import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string, duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newToast: ToastItem = { id, type, message, title, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => showToast('success', message, title || 'Success'),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string) => showToast('error', message, title || 'Error'),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string) => showToast('info', message, title || 'Notice'),
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => showToast('warning', message, title || 'Warning'),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        success,
        error,
        info,
        warning,
        removeToast,
      }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <div
        id="toast-notification-root"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const config = {
            success: {
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
              border: 'border-emerald-500/40 dark:border-emerald-500/30',
              bg: 'bg-white dark:bg-slate-900',
              badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
              accent: 'bg-emerald-500',
            },
            error: {
              icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
              border: 'border-rose-500/40 dark:border-rose-500/30',
              bg: 'bg-white dark:bg-slate-900',
              badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
              accent: 'bg-rose-500',
            },
            warning: {
              icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
              border: 'border-amber-500/40 dark:border-amber-500/30',
              bg: 'bg-white dark:bg-slate-900',
              badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
              accent: 'bg-amber-500',
            },
            info: {
              icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
              border: 'border-blue-500/40 dark:border-blue-500/30',
              bg: 'bg-white dark:bg-slate-900',
              badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
              accent: 'bg-blue-500',
            },
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl border shadow-xl shadow-slate-900/10 p-3.5 flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-top-4 fade-in ${config.bg} ${config.border}`}
            >
              <div className="mt-0.5">{config.icon}</div>
              <div className="flex-1 min-w-0 pr-1">
                {toast.title && (
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {toast.title}
                  </p>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 -mr-1 -mt-1 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
