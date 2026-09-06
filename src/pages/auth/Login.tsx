import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, Linkedin, Github, Twitter, Facebook } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { PublicHeader } from '../../components/common/PublicHeader';
import { ForgotPasswordModal } from '../../components/auth/ForgotPasswordModal';
import { LoginCredentials } from '../../types';

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { language } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginCredentials>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    setAuthError(null);
    const res = await login(data.email, data.password);
    if (res.success) {
      toast.success(
        language === 'bn' ? 'স্বাগতম! সফলভাবে লগইন হয়েছে।' : 'Authenticated successfully. Welcome back!',
        language === 'bn' ? 'লগইন সফল' : 'Login Successful'
      );
      navigate(from, { replace: true });
    } else {
      const errorMsg =
        res.error ||
        (language === 'bn'
          ? 'ভুল ইমেইল বা পাসওয়ার্ড। অনুগ্রহ করে আপনার তথ্য যাচাই করুন।'
          : 'Invalid email or password. Please verify your credentials.');
      setAuthError(errorMsg);
      toast.error(errorMsg, language === 'bn' ? 'লগইন ব্যর্থ' : 'Login Failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Universal Top Navigation Header */}
      <PublicHeader />

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-8 px-4 sm:px-0">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/5">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === 'bn' ? 'মনিটরে সাইন ইন করুন' : 'Sign In to Monitor'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === 'bn'
                ? 'স্মার্ট প্রিপেইড ব্যালেন্স, এআই পূর্বাভাস এবং মিটার মনিটরিং দেখতে লগইন করুন'
                : 'Access your prepaid smart meters, runout predictions, and balance telemetry'}
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'অ্যাকাউন্ট ইমেইল *' : 'Account Email *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  {...register('email', { required: 'Email address is required' })}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'পাসওয়ার্ড *' : 'Password *'}
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full py-2.5 mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {language === 'bn' ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Sign In to Dashboard'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            {language === 'bn' ? 'কোনো অ্যাকাউন্ট নেই?' : "Don't have an account?"}{' '}
            <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              {language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Register Account'}
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        onSuccess={(email) => {
          setValue('email', email);
          setValue('password', '');
        }}
      />

      {/* Footer with Copyright and Social Links for Md Fazley Rabbi */}
      <footer className="py-4 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 max-w-7xl mx-auto w-full text-xs text-slate-500 dark:text-slate-400">
        <div>
          © 2025 DESCO Smart Balance Monitor. Designed & Developed by{' '}
          <a
            href="https://github.com/rabbi1067"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Md Fazley Rabbi
          </a>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://www.linkedin.com/in/fazleyrabbi1067/"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-colors text-slate-600 dark:text-slate-400"
          >
            <Linkedin className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://github.com/rabbi1067"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-colors text-slate-600 dark:text-slate-400"
          >
            <Github className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://x.com/FazleRabbi56251"
            target="_blank"
            rel="noopener noreferrer"
            title="X (Twitter)"
            className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-colors text-slate-600 dark:text-slate-400"
          >
            <Twitter className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.facebook.com/fazleyrabbi1067/"
            target="_blank"
            rel="noopener noreferrer"
            title="Facebook"
            className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-colors text-slate-600 dark:text-slate-400"
          >
            <Facebook className="w-3.5 h-3.5" />
          </a>
        </div>
      </footer>
    </div>
  );
};
