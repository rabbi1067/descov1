import React, { useState } from 'react';
import { Sliders, Search, RefreshCw, Trash2, CheckCircle2, ShieldAlert, Edit3 } from 'lucide-react';
import { useMeters } from '../context/MeterContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Meter } from '../types';

export const MeterManageSection: React.FC = () => {
  const { meters, updateMeter, deleteMeter, refreshMeterBalance } = useMeters();
  const { isBn } = useLanguage();
  const [search, setSearch] = useState('');
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [editingMeter, setEditingMeter] = useState<Meter | null>(null);

  const [editForm, setEditForm] = useState({
    name: '',
    meterNumber: '',
    accountNumber: '',
    notificationEmail: '',
    lowThreshold: 300,
    criticalThreshold: 100,
    tariffType: '',
  });

  const filtered = meters.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.meterNumber.includes(search) ||
      m.userEmail.toLowerCase().includes(search.toLowerCase())
  );

  const handlePoll = async (id: string) => {
    setPollingId(id);
    await refreshMeterBalance(id);
    setPollingId(null);
  };

  const startEditMeter = (meter: Meter) => {
    setEditingMeter(meter);
    setEditForm({
      name: meter.name,
      meterNumber: meter.meterNumber,
      accountNumber: meter.accountNumber,
      notificationEmail: meter.notificationEmail,
      lowThreshold: meter.lowThreshold,
      criticalThreshold: meter.criticalThreshold,
      tariffType: meter.tariffType,
    });
  };

  const handleSaveMeterEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeter) return;
    updateMeter(editingMeter.id, {
      name: editForm.name.trim(),
      meterNumber: editForm.meterNumber.trim(),
      accountNumber: editForm.accountNumber.trim(),
      notificationEmail: editForm.notificationEmail.trim(),
      lowThreshold: Number(editForm.lowThreshold),
      criticalThreshold: Number(editForm.criticalThreshold),
      tariffType: editForm.tariffType,
    });
    setEditingMeter(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isBn ? 'সিস্টেমব্যাপী মিটার ব্যবস্থাপনা' : 'System-Wide Meter Management'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'মিটার টেলিমেট্রি, মিটার নম্বর সংশোধন, সীমা নির্ধারণ এবং গেটওয়ে স্বাস্থ্যের অপারেশনাল ড্যাশবোর্ড'
              : 'Operational dashboard for meter telemetry, number corrections, threshold assignments, and gateway health'}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBn ? 'মিটারের নাম, নম্বর বা ব্যবহারকারী দিয়ে খুঁজুন...' : 'Search by meter name, number, or assigned user...'}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          {filtered.length} {isBn ? 'টি মিটার কনফিগার করা হয়েছে' : 'Meters Configured'}
        </span>
      </div>

      {/* Meters Management Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">{isBn ? 'মিটারের বিবরণ' : 'Meter Details'}</th>
                <th className="py-3 px-4">{isBn ? 'মালিক অ্যাকাউন্ট' : 'Owner Account'}</th>
                <th className="py-3 px-4">{isBn ? 'বর্তমান ব্যালেন্স' : 'Current Balance'}</th>
                <th className="py-3 px-4">{isBn ? 'সীমা (স্বল্প / সংকট)' : 'Thresholds (Low / Crit)'}</th>
                <th className="py-3 px-4">{isBn ? 'অবস্থা' : 'Status'}</th>
                <th className="py-3 px-4">{isBn ? 'সর্বশেষ সিঙ্ক' : 'Last Sync'}</th>
                <th className="py-3 px-4 text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{m.name}</p>
                    <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">#{m.meterNumber}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-slate-800 dark:text-slate-200">{m.userEmail}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{isBn ? 'হিসাব:' : 'Acc:'} {m.accountNumber}</p>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(m.currentBalance)}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    ৳{m.lowThreshold} / ৳{m.criticalThreshold}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={m.status} size="sm">
                      {m.status === 'healthy'
                        ? isBn
                          ? 'পর্যাপ্ত'
                          : 'healthy'
                        : m.status === 'low'
                        ? isBn
                          ? 'স্বল্প'
                          : 'low'
                        : isBn
                        ? 'সংকট'
                        : 'critical'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {formatDate(m.lastUpdated, 'relative')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditMeter(m)}
                        title={isBn ? 'মিটার নম্বর বা কনফিগারেশন সম্পাদনা করুন' : 'Edit meter number or configuration'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={pollingId === m.id}
                        onClick={() => handlePoll(m.id)}
                        title={isBn ? 'ডেসকো গেটওয়ে থেকে ব্যালেন্স রিফ্রেশ করুন' : 'Force refresh balance from DESCO gateway'}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMeter(m.id)}
                        className="text-rose-600 hover:text-rose-700"
                        title={isBn ? 'মিটার মুছুন' : 'Delete meter'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Meter Modal */}
      <Modal
        isOpen={!!editingMeter}
        onClose={() => setEditingMeter(null)}
        title={isBn ? `মিটার সম্পাদন: #${editingMeter?.meterNumber || ''}` : `Edit Meter: #${editingMeter?.meterNumber || ''}`}
      >
        <form onSubmit={handleSaveMeterEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'মিটার নম্বর * (ডেসকো আইডি)' : 'Meter Number * (DESCO Physical ID)'}
              </label>
              <input
                type="text"
                required
                value={editForm.meterNumber}
                onChange={(e) => setEditForm({ ...editForm, meterNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'হিসাব নম্বর * (ডেসকো বিলিং রেফারেন্স)' : 'Account Number * (DESCO Billing Ref)'}
              </label>
              <input
                type="text"
                required
                value={editForm.accountNumber}
                onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'ঠিকানা / মিটার প্রদর্শনী নাম *' : 'Premises / Meter Display Label *'}
            </label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'কম ব্যালেন্স সতর্কতা সীমা (৳)' : 'Low Balance Warning Threshold (৳)'}
              </label>
              <input
                type="number"
                required
                min={50}
                value={editForm.lowThreshold}
                onChange={(e) => setEditForm({ ...editForm, lowThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'জরুরি সংকটজনক সীমা (৳)' : 'Urgent Critical Threshold (৳)'}
              </label>
              <input
                type="number"
                required
                min={20}
                value={editForm.criticalThreshold}
                onChange={(e) => setEditForm({ ...editForm, criticalThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'বিজ্ঞপ্তি পাঠানোর ইমেইল' : 'Dispatch Notification Email'}
            </label>
            <input
              type="email"
              value={editForm.notificationEmail}
              onChange={(e) => setEditForm({ ...editForm, notificationEmail: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button size="sm" variant="outline" type="button" onClick={() => setEditingMeter(null)}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button size="sm" variant="primary" type="submit">
              {isBn ? 'টেলিমেট্রি আপডেট করুন' : 'Update Meter Telemetry'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
