import React from 'react';
import { AlertTriangle, AlertCircle, RefreshCw, CheckCheck, Trash2, Bell } from 'lucide-react';
import { AppNotification } from '../../types';
import { formatDate } from '../../utils/formatDate';
import { Badge } from '../common/Badge';

interface NotificationCardProps {
  notification: AppNotification;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkRead,
  onDelete,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'low_balance':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'recovery':
        return <RefreshCw className="w-5 h-5 text-emerald-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBadgeVariant = () => {
    switch (notification.type) {
      case 'critical':
        return 'critical';
      case 'low_balance':
        return 'low';
      case 'recovery':
        return 'healthy';
      default:
        return 'info';
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
        notification.read
          ? 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 opacity-80'
          : 'bg-emerald-50/20 dark:bg-slate-900 border-emerald-500/30 dark:border-emerald-500/40 shadow-sm'
      }`}
    >
      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {notification.title}
            </h4>
            <Badge variant={getBadgeVariant()} size="sm">
              {notification.type.replace('_', ' ')}
            </Badge>
          </div>
          <span className="text-xs text-slate-400">
            {formatDate(notification.timestamp, 'relative')}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
          {notification.message}
        </p>

        {notification.meterName && (
          <div className="mt-2 text-[11px] font-medium text-slate-400">
            Associated: <span className="text-slate-600 dark:text-slate-300">{notification.meterName}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!notification.read && onMarkRead && (
          <button
            onClick={() => onMarkRead(notification.id)}
            title="Mark as read"
            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(notification.id)}
            title="Delete notification"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
