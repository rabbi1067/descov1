import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CreditCard, Smartphone, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useMeters } from '../../context/MeterContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatCurrency';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMeterId?: string;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  isOpen,
  onClose,
  targetMeterId,
}) => {
  const { meters, activeMeter, rechargeMeter } = useMeters();
  const { isBn } = useLanguage();
  const meter = (targetMeterId ? meters.find((m) => m.id === targetMeterId) : activeMeter) || meters[0];

  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Card'>('bKash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const presetAmounts = [500, 1000, 1500, 2000, 3000];

  const handleRecharge = async () => {
    if (!meter) return;
    const finalAmount = customAmount ? Number(customAmount) : selectedAmount;
    if (finalAmount <= 0) return;

    setIsProcessing(true);
    const success = await rechargeMeter(meter.id, finalAmount, method);
    setIsProcessing(false);

    if (success) {
      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1600);
    }
  };

  if (!meter) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isBn ? 'তাৎক্ষণিক প্রিপেইড মিটার রিচার্জ' : 'Instant Prepaid Meter Recharge'}
      description={
        isBn
          ? `ডেসকো মিটার #${meter.meterNumber} (${meter.name}) রিচার্জ করুন`
          : `Recharge DESCO meter #${meter.meterNumber} (${meter.name})`
      }
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isBn ? 'রিচার্জ সফলভাবে সম্পন্ন হয়েছে!' : 'Recharge Successfully Processed!'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            {isBn
              ? 'মিটার টোকেন ডেসকো গেটওয়েতে সরাসরি প্রেরণ করা হয়েছে এবং ব্যালেন্স হালনাগাদ করা হয়েছে।'
              : 'Meter token has been transmitted directly to DESCO gateway and balance is refreshed.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Current State summary */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">{isBn ? 'টার্গেট অ্যাকাউন্ট' : 'Target Account'}</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {meter.name}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">{isBn ? 'বর্তমান ব্যালেন্স' : 'Current Balance'}</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(meter.currentBalance)}
              </span>
            </div>
          </div>

          {/* Amount Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {isBn ? 'রিচার্জ পরিমাণ নির্বাচন করুন (৳ টাকা)' : 'Select Recharge Amount (৳ BDT)'}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    selectedAmount === amt && !customAmount
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>

            <div className="mt-3">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(0);
                }}
                placeholder={isBn ? 'অথবা কাস্টম পরিমাণ লিখুন (যেমন: ২৫০০)' : 'Or enter custom amount in ৳ (e.g. 2500)'}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {isBn ? 'পেমেন্ট মেথড নির্বাচন করুন' : 'Select Payment Gateway'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'bKash', label: 'bKash', color: 'hover:border-pink-500', icon: <Smartphone className="w-4 h-4 text-pink-500" /> },
                { id: 'Nagad', label: 'Nagad', color: 'hover:border-orange-500', icon: <Smartphone className="w-4 h-4 text-orange-500" /> },
                { id: 'Rocket', label: 'Rocket', color: 'hover:border-purple-500', icon: <Smartphone className="w-4 h-4 text-purple-500" /> },
                { id: 'Card', label: 'Cards/Visa', color: 'hover:border-blue-500', icon: <CreditCard className="w-4 h-4 text-blue-500" /> },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id as typeof method)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    method === m.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                      : `border-slate-200 dark:border-slate-700 ${m.color}`
                  }`}
                >
                  {m.icon}
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-100">
              <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-[10px] font-extrabold uppercase tracking-wider">
                {isBn ? 'শীঘ্রই আসছে' : 'Coming Soon'}
              </span>
              <span>{isBn ? 'ইন-অ্যাপ সরাসরি পেমেন্ট গেটওয়ে ইন্টিগ্রেশন' : 'Direct In-App Recharge Gateway Integration'}</span>
            </div>
            <p className="leading-relaxed text-[11px] text-amber-700 dark:text-amber-300">
              {isBn
                ? 'বিকাশ / নগদ / কার্ড এপিআই এর মাধ্যমে সরাসরি পেমেন্ট পরবর্তী আপডেটে চালু হবে। বর্তমানে রিচার্জের জন্য ব্যবহার করুন:'
                : 'Direct checkout through bKash / Nagad / Card payment API is currently scheduled for the next release. For now, please recharge directly via:'}
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] font-medium text-amber-800 dark:text-amber-200">
              <li>{isBn ? 'বিকাশ / নগদ অ্যাপ → পে বিল → বিদ্যুৎ → ডেসকো প্রিপেইড' : 'bKash / Nagad Mobile App → Pay Bill → Electricity → DESCO Prepaid'}</li>
              <li>{isBn ? 'অফিসিয়াল ডেসকো ওয়েব পোর্টাল → ' : 'Official DESCO Web Portal → '}<a href="https://prepaid.desco.org.bd" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-600 dark:text-emerald-400">prepaid.desco.org.bd</a></li>
            </ul>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
              {isBn
                ? 'রিচার্জ করার পর এই সিস্টেম স্বয়ংক্রিয়ভাবে কয়েক সেকেন্ডের মধ্যে নতুন ব্যালেন্স আপডেট করে নেবে!'
                : 'Once recharged, this system automatically fetches your refreshed balance within seconds!'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={onClose}>
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </Button>
            <Button
              variant="outline"
              disabled
              className="opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700"
            >
              {isBn ? 'রিচার্জ গেটওয়ে শীঘ্রই আসছে' : 'Recharge Gateway Coming Soon'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
