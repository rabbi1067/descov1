import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useMeters } from '../context/MeterContext';
import { useLanguage } from '../context/LanguageContext';
import { NotificationCard } from '../components/dashboard/NotificationCard';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { NotificationType } from '../types';

export const NotificationSection: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearNotifications,
  } = useMeters();
  const { isBn } = useLanguage();

  const [activeFilter, setActiveFilter] = useState<'all' | NotificationType>('all');

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isBn ? 'বিজ্ঞপ্তি ও সতর্কতা কেন্দ্র' : 'Notification & Alert Center'}
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                {unreadCount} {isBn ? 'টি অপঠিত' : 'unread'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'ব্যালেন্স হ্রাস, সংকটজনক সীমার সতর্কতা, রিচার্জ রসিদ এবং সিস্টেম আপডেট'
              : 'Prepaid balance drops, critical threshold warnings, recharge receipts & system updates'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={markAllNotificationsRead}
              leftIcon={<CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
            >
              {isBn ? 'সব পড়া হয়েছে হিসেবে চিহ্নিত করুন' : 'Mark All as Read'}
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearNotifications}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
            >
              {isBn ? 'সব মুছুন' : 'Clear All'}
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" /> {isBn ? 'ধরন:' : 'Type:'}
        </span>
        {(
          [
            { id: 'all', labelEn: 'All Alerts', labelBn: 'সকল সতর্কতা' },
            { id: 'critical', labelEn: 'Critical', labelBn: 'সংকটজনক' },
            { id: 'low_balance', labelEn: 'Low Balance', labelBn: 'কম ব্যালেন্স' },
            { id: 'recovery', labelEn: 'Recovery', labelBn: 'পুনরুদ্ধার' },
            { id: 'weekly_summary', labelEn: 'Weekly Summary', labelBn: 'সাপ্তাহিক সারাংশ' },
            { id: 'system', labelEn: 'System', labelBn: 'সিস্টেম' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-semibold'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50'
            }`}
          >
            {isBn ? tab.labelBn : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => (
            <NotificationCard
              key={item.id}
              notification={item}
              onMarkRead={markNotificationRead}
              onDelete={deleteNotification}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title={isBn ? 'কোন বিজ্ঞপ্তি নেই' : 'No notifications'}
          description={
            activeFilter === 'all'
              ? isBn
                ? 'আপনার সব বিজ্ঞপ্তি পড়া সম্পন্ন হয়েছে! কোন নতুন বিজ্ঞপ্তি নেই।'
                : 'You are all caught up! No notifications in your log.'
              : isBn
              ? `বর্তমানে "${activeFilter.replace('_', ' ')}" ক্যাটাগরিতে কোন সতর্কতা নেই।`
              : `No alerts currently in the "${activeFilter.replace('_', ' ')}" category.`
          }
        />
      )}
    </div>
  );
};
