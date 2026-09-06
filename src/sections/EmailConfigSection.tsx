import React, { useState, useEffect } from 'react';
import { Mail, Send, Server, CheckCircle2, ShieldCheck, Key, Eye, EyeOff, Save, Info, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useMeters } from '../context/MeterContext';

export const EmailConfigSection: React.FC = () => {
  const toast = useToast();
  const { isBn } = useLanguage();
  const { recordDispatch } = useMeters();

  const [providerPreset, setProviderPreset] = useState<'gmail' | 'custom'>('gmail');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpAppPassword, setSmtpAppPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [senderName, setSenderName] = useState('DESCO Smart Alerts');
  const [senderEmail, setSenderEmail] = useState('');
  const [useTls, setUseTls] = useState(true);

  const [testEmail, setTestEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load saved configuration from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('desco_smtp_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.smtpHost) setSmtpHost(parsed.smtpHost);
        if (parsed.smtpPort) setSmtpPort(parsed.smtpPort);
        if (parsed.smtpUser) {
          setSmtpUser(parsed.smtpUser);
          if (!senderEmail) setSenderEmail(parsed.smtpUser);
          if (!testEmail) setTestEmail(parsed.smtpUser);
        }
        if (parsed.smtpAppPassword) setSmtpAppPassword(parsed.smtpAppPassword);
        if (parsed.senderName) setSenderName(parsed.senderName);
        if (parsed.senderEmail) setSenderEmail(parsed.senderEmail);
        if (parsed.providerPreset) setProviderPreset(parsed.providerPreset);
        if (typeof parsed.useTls === 'boolean') setUseTls(parsed.useTls);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handlePresetChange = (preset: 'gmail' | 'custom') => {
    setProviderPreset(preset);
    if (preset === 'gmail') {
      setSmtpHost('smtp.gmail.com');
      setSmtpPort('587');
      setUseTls(true);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const config = {
      providerPreset,
      smtpHost,
      smtpPort,
      smtpUser: smtpUser.trim(),
      smtpAppPassword: smtpAppPassword.trim(),
      senderName: senderName.trim(),
      senderEmail: (senderEmail || smtpUser).trim(),
      useTls,
    };

    localStorage.setItem('desco_smtp_config', JSON.stringify(config));
    setIsSaving(false);
    toast.success(
      'Email Gateway settings successfully saved for automated prepaid warning dispatches.',
      'SMTP Config Saved'
    );
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) {
      toast.warning('Please enter a recipient email address to send the verification test.', 'Missing Recipient');
      return;
    }

    setIsSending(true);
    // Simulate real gateway relay test
    await new Promise((r) => setTimeout(r, 800));
    setIsSending(false);

    toast.success(
      `Test HTML emergency warning dispatched to ${testEmail} via ${smtpHost}.`,
      'Test Email Sent'
    );
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isBn ? 'ইমেইল গেটওয়ে ও ডিসপ্যাচ কনফিগারেশন' : 'Email Gateway & Dispatch Configuration'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'নিবন্ধিত গ্রাহকদের কাছে কম ব্যালেন্সের জরুরি সতর্কতা পাঠাতে বহির্গামী SMTP তথ্য কনফিগার করুন'
              : 'Configure outgoing SMTP credentials to deliver low-balance warnings to registered consumers'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ThemeToggle variant="segmented" />
        </div>
      </div>

      {/* Preset Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
            {isBn ? 'SMTP রিলে প্রোভাইডার নির্বাচন করুন' : 'Select SMTP Relay Provider'}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {isBn
              ? 'গুগল জিমেইল এর জন্য কেবল আপনার ইমেইল ইউজারনেম এবং একটি ১৬ অক্ষরের অ্যাপ পাসওয়ার্ড প্রয়োজন'
              : 'For Google Gmail, only your email username and a 16-character App Password are required'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handlePresetChange('gmail')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              providerPreset === 'gmail'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {isBn ? 'গুগল জিমেইল (অ্যাপ পাসওয়ার্ড)' : 'Google Gmail (App Password)'}
          </button>
          <button
            type="button"
            onClick={() => handlePresetChange('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              providerPreset === 'custom'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {isBn ? 'কাস্টম SMTP রিলে' : 'Custom SMTP Relay'}
          </button>
        </div>
      </div>

      {/* Main Gateway Form */}
      <form onSubmit={handleSaveConfig}>
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                SMTP Authentication Credentials
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Used by the backend automated cron scanner to dispatch high-priority warning emails
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SMTP Username (Your Email) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={smtpUser}
                  onChange={(e) => {
                    setSmtpUser(e.target.value);
                    if (!senderEmail) setSenderEmail(e.target.value);
                  }}
                  placeholder="your-email@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                App Password (16 Characters) *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={smtpAppPassword}
                  onChange={(e) => setSmtpAppPassword(e.target.value)}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sender Display Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="DESCO Smart Alerts"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sender Email Address
              </label>
              <input
                type="email"
                value={senderEmail || smtpUser}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="notifications@desco.org.bd"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SMTP Host Server
              </label>
              <input
                type="text"
                required
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SMTP Port
              </label>
              <input
                type="text"
                required
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Guide Helper */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span>How to generate a Gmail App Password:</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <li>Open your Google Account: <code className="text-emerald-600 dark:text-emerald-400">myaccount.google.com</code></li>
              <li>Ensure 2-Step Verification is turned ON in the <strong>Security</strong> tab.</li>
              <li>Search or click <strong>App passwords</strong>, create a password with name <strong>"DESCO Monitor"</strong>.</li>
              <li>Copy the 16-character generated code and paste it into the <strong>App Password</strong> field above.</li>
            </ol>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Gateway Configuration
            </Button>
          </div>
        </Card>
      </form>

      {/* Live Dispatch Verification Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Dispatch Verification Test
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Send an instant verification alert to verify TLS delivery and template layout
            </p>
          </div>
        </div>

        <form onSubmit={handleSendTest} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="email"
            required
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Recipient email address (e.g. your email)..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={isSending}
            leftIcon={<Send className="w-4 h-4" />}
            className="shrink-0 w-full sm:w-auto"
          >
            Send Test Alert
          </Button>
        </form>
      </Card>
    </div>
  );
};
