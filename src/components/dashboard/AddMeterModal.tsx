import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Zap, Hash, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useMeters } from '../../context/MeterContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface AddMeterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MeterFormData {
  name: string;
  meterNumber: string;
  accountNumber: string;
  notificationEmail: string;
  lowThreshold: number;
  criticalThreshold: number;
  tariffType: string;
}

export const AddMeterModal: React.FC<AddMeterModalProps> = ({ isOpen, onClose }) => {
  const { addMeter } = useMeters();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MeterFormData>({
    defaultValues: {
      name: '',
      meterNumber: '',
      accountNumber: '',
      notificationEmail: user?.email || '',
      lowThreshold: 300,
      criticalThreshold: 100,
      tariffType: 'LT-A (Residential Single Phase)',
    },
  });

  const onSubmit = async (data: MeterFormData) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 450));

    // Automated balance initialization from simulated DESCO gateway
    const livePolledBalance = 540.0;

    addMeter({
      name: data.name,
      meterNumber: data.meterNumber.trim(),
      accountNumber: data.accountNumber.trim(),
      notificationEmail: data.notificationEmail,
      lowThreshold: Number(data.lowThreshold),
      criticalThreshold: Number(data.criticalThreshold),
      currentBalance: livePolledBalance,
      userId: user?.id || 'usr-3',
      userEmail: user?.email || 'user@desco.com',
      tariffType: data.tariffType || 'LT-A (Residential Single Phase)',
      sanctionedLoad: '4.0 kW',
    });

    setIsSubmitting(false);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modal.add_meter.title', 'Register New DESCO Prepaid Meter')}
      description={t(
        'modal.add_meter.desc',
        'Connect your DESCO smart meter with account number for automated balance tracking and AI predictions.'
      )}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Friendly Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('modal.add_meter.name_label', 'Meter Friendly Name *')}
          </label>
          <input
            {...register('name', { required: 'Please enter a name (e.g. Home, Office, Flat 3B)' })}
            type="text"
            placeholder={t('modal.add_meter.name_ph', 'e.g. Dhanmondi Flat 3B or Uttara Residence')}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
        </div>

        {/* 10-Digit Smart Meter Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('modal.add_meter.meter_label', 'DESCO Smart Meter Number * (10 Digits)')}
          </label>
          <div className="relative">
            <input
              {...register('meterNumber', {
                required: 'Meter number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Must be an exact 10-digit numeric meter ID',
                },
              })}
              type="text"
              placeholder="e.g. 3801948291"
              maxLength={10}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {errors.meterNumber && (
            <p className="text-xs text-rose-500 mt-1">{errors.meterNumber.message}</p>
          )}
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
            Found on your physical prepaid meter display or previous recharge token slip
          </span>
        </div>

        {/* Customer Account Number (MANDATORY) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('modal.add_meter.account_label', 'DESCO Customer Account Number * (Mandatory)')}
          </label>
          <div className="relative">
            <input
              {...register('accountNumber', {
                required: 'DESCO Account Number is mandatory',
                minLength: { value: 6, message: 'Account number must be at least 6 characters' },
              })}
              type="text"
              placeholder={t('modal.add_meter.account_ph', 'e.g. 23049182 or DESCO-ACT-8819')}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {errors.accountNumber && (
            <p className="text-xs text-rose-500 mt-1">{errors.accountNumber.message}</p>
          )}
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
            Customer / Consumer Account number printed on electricity bill or registration card
          </span>
        </div>

        {/* Alert Notification Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('modal.add_meter.email_label', 'Notification Alert Email *')}
          </label>
          <input
            {...register('notificationEmail', {
              required: 'Alert email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            type="email"
            placeholder="alerts@example.com"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {errors.notificationEmail && (
            <p className="text-xs text-rose-500 mt-1">{errors.notificationEmail.message}</p>
          )}
        </div>

        {/* Threshold limits */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('modal.add_meter.low_label', 'Low Threshold (৳)')}
            </label>
            <input
              {...register('lowThreshold', { required: true, min: 50 })}
              type="number"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-slate-400">Trigger email alert</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('modal.add_meter.critical_label', 'Critical Threshold (৳)')}
            </label>
            <input
              {...register('criticalThreshold', { required: true, min: 10 })}
              type="number"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-slate-400">Urgent SMS & email</span>
          </div>
        </div>

        {/* Automated Live Gateway Note */}
        <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-800 dark:text-emerald-300">
            <strong>Live Automated Sync:</strong> Current balance will be retrieved directly from the DESCO Digital Metering API Gateway upon connection.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('modal.add_meter.cancel', 'Cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Zap className="w-4 h-4" />}
          >
            {t('modal.add_meter.submit', 'Connect Meter')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

