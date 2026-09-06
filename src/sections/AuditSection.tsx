import React, { useState } from 'react';
import { ClipboardList, Shield, Filter, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { mockAuditLogs } from '../data/mockLogs';
import { AuditLog } from '../types';
import { formatDate } from '../utils/formatDate';
import { Badge } from '../components/common/Badge';
import { useLanguage } from '../context/LanguageContext';

export const AuditSection: React.FC = () => {
  const { isBn } = useLanguage();
  const [logs] = useState<AuditLog[]>(mockAuditLogs);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'warning' | 'failed'>('all');

  const filtered = logs.filter((l) => (statusFilter === 'all' ? true : l.status === statusFilter));

  const filterLabels = {
    all: isBn ? 'সকল' : 'all',
    success: isBn ? 'সফল' : 'success',
    warning: isBn ? 'সতর্কতা' : 'warning',
    failed: isBn ? 'ব্যর্থ' : 'failed',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {isBn ? 'সিস্টেম টেলিমেট্রি ও অডিট লগ' : 'System Telemetry & Audit Logs'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'গেটওয়ে সিঙ্ক, থ্রেশহোল্ড সতর্কতা, ইমেইল প্রেরণ ও ব্যবহারকারী লগইনের সুরক্ষিত রেকর্ড'
              : 'Immutable tracking of gateway polls, threshold triggers, email dispatches, and user auth'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
            {(['all', 'success', 'warning', 'failed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                {filterLabels[st]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">{isBn ? 'সময়' : 'Timestamp'}</th>
                <th className="py-3 px-4">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                <th className="py-3 px-4">{isBn ? 'কর্তা' : 'Actor'}</th>
                <th className="py-3 px-4">{isBn ? 'লক্ষ্য সত্তা' : 'Target Entity'}</th>
                <th className="py-3 px-4">{isBn ? 'আইপি ঠিকানা' : 'IP Address'}</th>
                <th className="py-3 px-4 text-right">{isBn ? 'অবস্থা' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-sans">
                    {formatDate(log.timestamp, 'long')}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-sans">
                    {log.actorEmail}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-sans">
                    {log.target}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{log.ipAddress}</td>
                  <td className="py-3 px-4 text-right font-sans">
                    <Badge
                      variant={
                        log.status === 'success' ? 'healthy' : log.status === 'warning' ? 'low' : 'critical'
                      }
                      size="sm"
                    >
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : log.status === 'warning' ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {log.status === 'success'
                        ? isBn
                          ? 'সফল'
                          : 'success'
                        : log.status === 'warning'
                        ? isBn
                          ? 'সতর্কতা'
                          : 'warning'
                        : isBn
                        ? 'ব্যর্থ'
                        : 'failed'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
