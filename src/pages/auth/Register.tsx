import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Navigation,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  Sparkles,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { PublicHeader } from '../../components/common/PublicHeader';
import { trackDeviceLocation, TrackedLocationResult } from '../../utils/deviceLocation';

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
}

export const Register: React.FC = () => {
  const { register: registerUser, isLoading } = useAuth();
  const { language } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);
  const [trackedResult, setTrackedResult] = useState<TrackedLocationResult | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');

  const popularLocations = [
    { label: 'Uttara, Sec 7', value: 'Road 14, Sector 7, Uttara, Dhaka-1230' },
    { label: 'Dhanmondi, Rd 8/A', value: 'House 24, Road 8/A, Dhanmondi, Dhaka-1209' },
    { label: 'Gulshan-2, Rd 45', value: 'Plot 12, Road 45, Gulshan-2, Dhaka-1212' },
    { label: 'Mirpur-10, Blk C', value: 'Lane 4, Block C, Mirpur-10, Dhaka-1216' },
    { label: 'Banani, Rd 11', value: 'House 68, Road 11, Block D, Banani, Dhaka-1213' },
    { label: 'Bashundhara R/A', value: 'Road 3, Block D, Bashundhara R/A, Dhaka-1229' },
  ];

  const handleAutoDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationError(null);
    setLocationStatus(
      language === 'bn'
        ? 'ডিভাইসের GPS ও পজিশনিং সেন্সর ট্র্যাক করা হচ্ছে...'
        : 'Accessing device GPS & positioning hardware...'
    );

    try {
      const result = await trackDeviceLocation((statusMsg) => {
        if (language === 'bn') {
          if (statusMsg.includes('Accessing')) {
            setLocationStatus('ডিভাইসের GPS অ্যাক্সেস করা হচ্ছে...');
          } else if (statusMsg.includes('Coordinates')) {
            setLocationStatus('স্থানাঙ্ক শনাক্ত হয়েছে। সড়ক ও এলাকা যাচাই করা হচ্ছে...');
          } else {
            setLocationStatus(statusMsg);
          }
        } else {
          setLocationStatus(statusMsg);
        }
      });

      setTrackedResult(result);
      setValue('address', result.formattedAddress, { shouldValidate: true });
      setIsDetectingLocation(false);
      setLocationStatus(
        language === 'bn'
          ? '✓ বর্তমান ডিভাইস লোকেশন ও GPS স্থানাঙ্ক সফলভাবে যোগ করা হয়েছে'
          : '✓ Current device GPS location & address verified'
      );
      toast.success(
        language === 'bn'
          ? `ডিভাইস লোকেশন শনাক্ত: ${result.shortAddress} (সঠিকতা: ±${result.coords.accuracy}m)`
          : `Device location locked: ${result.shortAddress} (Accuracy ±${result.coords.accuracy}m)`,
        'GPS Location Detected'
      );
    } catch (err: any) {
      setIsDetectingLocation(false);
      const errMsg = err?.message || 'Could not track device location.';
      setLocationError(errMsg);
      setLocationStatus(null);
      toast.warning(errMsg, 'Location Tracking Notice');
    }
  };

  const handleSelectPreset = (presetValue: string) => {
    setValue('address', presetValue, { shouldValidate: true });
    setLocationError(null);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setRegError(null);
    const res = await registerUser(data.name, data.email, data.password, data.phone, data.address);
    if (res.success) {
      navigate('/dashboard', { replace: true });
    } else {
      const errMsg = res.error || (language === 'bn' ? 'রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি।' : 'Registration failed. Please check your information.');
      setRegError(errMsg);
      toast.error(errMsg, language === 'bn' ? 'রেজিস্ট্রেশন ব্যর্থ' : 'Registration Failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Universal Top Navigation Header */}
      <PublicHeader />

      <div className="w-full max-w-lg mx-auto my-8 px-4 sm:px-0">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/5">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === 'bn' ? 'নাগরিক অ্যাকাউন্ট তৈরি করুন' : 'Create Citizen Account'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === 'bn'
                ? 'স্বয়ংক্রিয় অ্যালার্ট ও পূর্বাভাসের জন্য রেজিস্টার করুন। ড্যাশবোর্ডে প্রবেশের পরই মিটার যুক্ত করতে পারবেন।'
                : 'Register for predictive monitoring. Connect your DESCO meters immediately inside the dashboard.'}
            </p>
          </div>

          {regError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{regError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'পূর্ণ নাম *' : 'Full Name *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  {...register('name', { required: 'Full name is required' })}
                  type="text"
                  placeholder="e.g. Tanvir Hossain"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'ইমেইল অ্যাড্রেস *' : 'Email Address *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  placeholder="alerts@domain.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'মোবাইল নম্বর (এসএমএস অ্যালার্ট) *' : 'Mobile (SMS Alert Gateway) *'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  {...register('phone', { required: 'Mobile number is required for emergency SMS alerts' })}
                  type="tel"
                  placeholder="+880 1712-XXXXXX"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>}
            </div>

            {/* Address (Road, Location, Area) with Manual Input & Live GPS Device Tracking */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'মিটার / প্রাঙ্গণের ঠিকানা *' : 'Premise / Meter Address *'}
                </label>
                <button
                  type="button"
                  onClick={handleAutoDetectLocation}
                  disabled={isDetectingLocation}
                  className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 flex items-center gap-1.5 cursor-pointer bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 shadow-2xs transition-all"
                  title="Track real-time current physical location of this device via GPS"
                >
                  {isDetectingLocation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                      <span>{language === 'bn' ? 'GPS ট্র্যাক হচ্ছে...' : 'Tracking GPS...'}</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                      <span>{language === 'bn' ? 'ডিভাইস লোকেশন ট্র্যাক করুন' : 'Track Device GPS'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  {...register('address', { required: 'Address (Road, location, area) is required' })}
                  rows={2}
                  placeholder={
                    language === 'bn'
                      ? 'বাড়ি নম্বর, রোড নম্বর, সেক্টর/ব্লক ও এলাকা লিখুন (অথবা উপরের বাটনে ক্লিক করে স্বয়ংক্রিয় ডিভাইস লোকেশন ট্র্যাক করুন)'
                      : 'House, Road, Block/Sector and Area (or click "Track Device GPS" to auto-detect current location)'
                  }
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
              {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address.message}</p>}

              {/* Progress or status feedback */}
              {locationStatus && (
                <div className="mt-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{locationStatus}</span>
                  </span>
                </div>
              )}

              {/* Error notice */}
              {locationError && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{language === 'bn' ? 'লোকেশন ট্র্যাকিং ত্রুটি:' : 'Location Tracking Notice:'}</p>
                    <p className="text-[11px] mt-0.5 text-amber-700 dark:text-amber-400">{locationError}</p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                      {language === 'bn'
                        ? 'টিপস: ব্রাউজারের পপআপে "Allow Location" চাপুন অথবা নিচের কুইক সিলেক্ট এলাকা থেকে বেছে নিন।'
                        : 'Tip: Please click "Allow" when your browser requests location permissions or pick a quick area below.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Live Device GPS Locked Info Card */}
              {trackedResult && (
                <div className="mt-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {language === 'bn' ? 'ডিভাইস GPS লকড' : 'Live Device GPS Locked'}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                        ±{trackedResult.coords.accuracy}m
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAutoDetectLocation}
                        disabled={isDetectingLocation}
                        className="text-[11px] font-medium text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                        title="Re-fetch current device coordinates"
                      >
                        <RefreshCw className={`w-3 h-3 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                        <span>{language === 'bn' ? 'রিফ্রেশ' : 'Re-track'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300 grid grid-cols-2 gap-2 bg-white dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">{language === 'bn' ? 'অক্ষাংশ (Lat)' : 'Latitude'}</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">{trackedResult.coords.latitude.toFixed(6)}° N</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">{language === 'bn' ? 'দ্রাঘিমাংশ (Lon)' : 'Longitude'}</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">{trackedResult.coords.longitude.toFixed(6)}° E</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[240px]" title={trackedResult.formattedAddress}>
                      📍 {trackedResult.shortAddress}
                    </span>
                    <a
                      href={trackedResult.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>{language === 'bn' ? 'ম্যাপে দেখুন' : 'View on Map'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Quick Area / Road Auto-fill suggestions */}
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-slate-400 font-medium mr-0.5">
                  {language === 'bn' ? 'দ্রুত নির্বাচন:' : 'Quick Select:'}
                </span>
                {popularLocations.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSelectPreset(item.value)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Password with Eye Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'পাসওয়ার্ড *' : 'Security Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters required' },
                  })}
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

            {/* Confirm Password with Eye Toggle & Matching Rule */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন *' : 'Confirm Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === passwordValue || 'Passwords do not match',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Meter Connection Info Callout */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'অ্যাকাউন্ট খোলার পর ড্যাশবোর্ডে গিয়ে আপনি যত খুশি প্রিপেইড মিটার (যেমন: বাসার মিটার, অফিসের মিটার) অ্যাকাউন্ট নম্বর দিয়ে যুক্ত করতে পারবেন।'
                  : 'After creating your account, you can link unlimited DESCO smart meters with their 10-digit meter & account numbers inside the dashboard.'}
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full py-2.5 mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Citizen Account'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5">
            {language === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              {language === 'bn' ? 'সাইন ইন করুন' : 'Sign In'}
            </Link>
          </p>
        </div>
      </div>

      {/* Footer with Copyright to Md Fazley Rabbi */}
      <footer className="py-4 border-t border-slate-200/60 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        © 2025 DESCO Smart Balance Monitor. Designed & Developed by Md Fazley Rabbi • Dhaka Electric Supply Company Limited.
      </footer>
    </div>
  );
};
