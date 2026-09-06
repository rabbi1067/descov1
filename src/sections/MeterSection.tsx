import React, { useState } from 'react';
import { Plus, Search, Filter, Gauge, ArrowUpDown } from 'lucide-react';
import { useMeters } from '../context/MeterContext';
import { useLanguage } from '../context/LanguageContext';
import { MeterCard } from '../components/dashboard/MeterCard';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';

interface MeterSectionProps {
  onOpenAddMeter: () => void;
  onOpenRecharge: () => void;
}

export const MeterSection: React.FC<MeterSectionProps> = ({ onOpenAddMeter, onOpenRecharge }) => {
  const { meters, activeMeter, setActiveMeterId } = useMeters();
  const { isBn } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'low' | 'critical'>('all');

  const filteredMeters = meters.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.meterNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {isBn ? 'নিবন্ধিত ডেসকো মিটারসমূহ' : 'Registered DESCO Meters'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'সকল স্থাপনার জন্য নজরদারি করুন, সীমা নির্ধারণ করুন এবং তাৎক্ষণিক রিচার্জ করুন'
              : 'Monitor, manage thresholds, and execute instant recharges across all your properties'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="md"
            variant="primary"
            onClick={onOpenAddMeter}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {isBn ? 'নতুন মিটার যোগ' : 'Add New Meter'}
          </Button>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'মিটারের নাম বা নম্বর দিয়ে খুঁজুন...' : 'Search by meter name or number...'}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> {isBn ? 'ফিল্টার:' : 'Filter:'}
          </span>
          {(['all', 'healthy', 'low', 'critical'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st === 'all'
                ? isBn
                  ? 'সব'
                  : 'All'
                : st === 'healthy'
                ? isBn
                  ? 'পর্যাপ্ত'
                  : 'Healthy'
                : st === 'low'
                ? isBn
                  ? 'স্বল্প'
                  : 'Low'
                : isBn
                ? 'সংকট'
                : 'Critical'}
            </button>
          ))}
        </div>
      </div>

      {/* Meters Grid */}
      {filteredMeters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeters.map((meter) => (
            <MeterCard
              key={meter.id}
              meter={meter}
              isActive={activeMeter?.id === meter.id}
              onSelect={() => setActiveMeterId(meter.id)}
              onRecharge={onOpenRecharge}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Gauge className="w-8 h-8" />}
          title={isBn ? 'কোন মিটার পাওয়া যায়নি' : 'No meters found'}
          description={
            searchQuery
              ? isBn
                ? `"${searchQuery}" এর সাথে কোন মিটার মেলেনি। অন্য নাম বা নম্বর চেষ্টা করুন।`
                : `No meters matched "${searchQuery}". Try a different name or meter number.`
              : isBn
              ? 'আপনি এখনও কোন প্রিপেইড মিটার যোগ করেননি।'
              : 'You have not added any prepaid meters yet.'
          }
          actionLabel={isBn ? 'মিটার নিবন্ধন করুন' : 'Register Meter'}
          onAction={onOpenAddMeter}
        />
      )}
    </div>
  );
};
