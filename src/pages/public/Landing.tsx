import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  BellRing,
  Smartphone,
  TrendingDown,
  Clock,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Gauge,
  FileSpreadsheet,
  Star,
  PhoneCall,
  Mail,
  MapPin,
  Send,
  MessageSquarePlus,
  Building2,
  Calendar,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PublicHeader } from '../../components/common/PublicHeader';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatCurrency';

interface ReviewItem {
  id: string;
  name: string;
  location: string;
  category: 'residential' | 'commercial';
  rating: number;
  date: string;
  quote: string;
}

export const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeReviewFilter, setActiveReviewFilter] = useState<'all' | '5stars' | 'residential' | 'commercial'>('all');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Review Form state
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewLocation, setNewReviewLocation] = useState('Uttara Sector 4');
  const [newReviewCategory, setNewReviewCategory] = useState<'residential' | 'commercial'>('residential');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewQuote, setNewReviewQuote] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactMeter, setContactMeter] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Interactive AI Forecaster live slider demo
  const [sliderBalance, setSliderBalance] = useState(650);
  const [sliderDailyBurn, setSliderDailyBurn] = useState(85);

  const calculatedDays = Math.max(1, Math.floor(sliderBalance / (sliderDailyBurn || 1)));

  // Reviews data state
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      name: 'Kazi Mahbubur Rahman',
      location: 'Sector 4, Uttara',
      category: 'residential',
      rating: 5,
      date: 'March 2025',
      quote:
        'I used to wake up at 2 AM to a silent AC and a red beeping meter. With the AI 3-day projection, I get notified on Wednesday morning and recharge before the weekend.',
    },
    {
      id: 'rev-2',
      name: 'Farhana Yasmin',
      location: 'Road 11, Banani',
      category: 'residential',
      rating: 5,
      date: 'February 2025',
      quote:
        'Managing meters for my mother in Mirpur and our home in Banani was stressful. Now I monitor both from one screen and pay via bKash instantly.',
    },
    {
      id: 'rev-3',
      name: 'Engineer Asif Iqbal',
      location: 'Dhanmondi 8/A',
      category: 'commercial',
      rating: 5,
      date: 'January 2025',
      quote:
        'The CSV export gives me clean utility statements for our commercial building tenants. Best electricity utility tool developed for Bangladesh.',
    },
    {
      id: 'rev-4',
      name: 'Dr. Nabila Chowdhury',
      location: 'Gulshan 2, Dhaka',
      category: 'residential',
      rating: 5,
      date: 'April 2025',
      quote:
        'The automated threshold alerts sent directly to my mobile prevented sudden outages multiple times during hot summer heatwaves.',
    },
    {
      id: 'rev-5',
      name: 'Tanvir Ahmed',
      location: 'Mirpur DOHS',
      category: 'commercial',
      rating: 5,
      date: 'February 2025',
      quote:
        'Our architectural design firm runs multiple workstations. Having real-time peak vs off-peak analytics helped us reduce consumption by 18%.',
    },
  ]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewQuote.trim()) return;

    const newEntry: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: newReviewName.trim(),
      location: newReviewLocation,
      category: newReviewCategory,
      rating: newReviewRating,
      date: 'Just now',
      quote: newReviewQuote.trim(),
    };

    setReviews([newEntry, ...reviews]);
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setReviewModalOpen(false);
      setNewReviewName('');
      setNewReviewQuote('');
    }, 1500);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactMessage.trim()) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactName('');
      setContactMeter('');
      setContactMessage('');
    }, 3000);
  };

  useEffect(() => {
    const scrollToHash = () => {
      if (window.location.hash) {
        const id = window.location.hash.replace('#', '');
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 120);
      }
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  const filteredReviews = reviews.filter((r) => {
    if (activeReviewFilter === '5stars') return r.rating === 5;
    if (activeReviewFilter === 'residential') return r.category === 'residential';
    if (activeReviewFilter === 'commercial') return r.category === 'commercial';
    return true;
  });

  const faqs = [
    {
      q: language === 'bn'
        ? 'ডেসকো স্মার্ট ব্যালেন্স মনিটর কীভাবে ব্যালেন্স ফুরিয়ে যাওয়ার সঠিক সময় অনুমান করে?'
        : 'How does DESCO Smart Balance Monitor predict when my balance runs out?',
      a: language === 'bn'
        ? 'আমাদের এআই ইঞ্জিন আপনার বিগত ৭ দিনের পিক ও অফ-পিক বিদ্যুৎ ব্যবহারের প্যাটার্ন বিশ্লেষণ করে দৈনিক খরচ নির্ধারণ করে। ফলে মিটার বন্ধ হওয়ার আগেই সঠিক পূর্বাভাস পাওয়া যায়।'
        : 'Our AI engine analyzes your historical daily burn rates across peak (5 PM - 11 PM) and off-peak hours. By factoring in recent consumption trends and seasonal variance, it computes an accurate days-remaining forecast so you never get unexpectedly disconnected.',
    },
    {
      q: language === 'bn'
        ? 'আমি কি একাধিক মিটার (যেমন: বাসা ও অফিস) একসাথে যুক্ত করতে পারব?'
        : 'Can I link multiple prepaid electricity meters?',
      a: language === 'bn'
        ? 'হ্যাঁ! আপনি আনলিমিটেড মিটার (বাসা, বাবা-মার বাড়ি, দোকান বা বাণিজ্যিক ফ্ল্যাট) অ্যাকাউন্ট নম্বর দিয়ে যুক্ত করতে পারবেন এবং এক ক্লিকেই মিটার পরিবর্তন করে পর্যবেক্ষণ করতে পারবেন।'
        : 'Yes! You can link unlimited meters (e.g. Dhanmondi Residence, Uttara Parent Home, Gulshan Office) and monitor them all with individual threshold warnings and unified billing statements.',
    },
    {
      q: language === 'bn'
        ? 'স্বয়ংক্রিয় জরুরি অ্যালার্ট কীভাবে কাজ করে?'
        : 'How do automated emergency alerts work?',
      a: language === 'bn'
        ? 'যখন মিটারের ক্রেডিট আপনার নির্ধারিত সীমার নিচে (যেমন: সতর্কতা সীমা ৳৩০০ বা জরুরি সীমা ৳১০০) নেমে আসে, সিস্টেমটি সাথে সাথে আপনার ইমেইল ও ফোনে জরুরি অ্যালার্ট পাঠায়।'
        : 'When your prepaid credit drops below your custom threshold (e.g. ৳300 Warning or ৳100 Emergency), the system instantly dispatches an email and notification so you can recharge before cutoff.',
    },
    {
      q: language === 'bn'
        ? 'কোন কোন মাধ্যমে তাৎক্ষণিক রিচার্জ করা যায়?'
        : 'Which payment methods are supported for instant meter recharge?',
      a: language === 'bn'
        ? 'বিকাশ, নগদ, রকেট এবং যেকোনো ডেবিট/ক্রেডিট কার্ডের মাধ্যমে তাৎক্ষণিক রিচার্জ করতে পারবেন। ২০ ডিজিটের টোকেন সাথে সাথে স্ক্রিনে এবং হিস্ট্রি রেকর্ডে সংরক্ষিত হয়।'
        : 'You can recharge instantly via bKash, Nagad, Rocket, and local debit/credit cards. The 20-digit DESCO token is generated instantly on screen and logged in your statement.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Universal Top Navigation Header */}
      <PublicHeader />

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t('hero.badge', 'Live DESCO Smart Prepaid Meter Integration')}
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                {t('hero.title_pre', 'Never get disconnected in the')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600">
                  {t('hero.title_highlight', 'dark.')}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {t(
                  'hero.subtitle',
                  'DESCO Smart Balance Monitor calculates your daily electricity burn rate, projects exact runout dates with AI, and sends automated threshold alerts before your power trips.'
                )}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link to="/register" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <span>{language === 'bn' ? 'মিটার রেজিস্টার করুন' : 'Register Citizen Meter'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                <Link to="/login" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <span>{language === 'bn' ? 'ড্যাশবোর্ডে সাইন ইন করুন' : 'Sign In to Dashboard'}</span>
                  </button>
                </Link>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />{' '}
                  {t('hero.feature_bkash', 'bKash & Nagad Recharges')}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />{' '}
                  {t('hero.feature_multimeter', 'Multi-Meter Monitoring')}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />{' '}
                  {t('hero.feature_nohardware', 'Zero Hardware Needed')}
                </span>
              </div>
            </div>

            {/* Right Hero Live Interactive Card Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 blur-xl dark:opacity-30" />

                <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          Dhanmondi Flat 3B
                        </h4>
                        <p className="text-[10px] font-mono text-slate-400">#3801948291 • ACT: 290184</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 animate-pulse">
                      {t('card.low_balance', 'Low Balance Warning')}
                    </span>
                  </div>

                  <div className="space-y-1 text-center py-2">
                    <p className="text-xs text-slate-400">{t('card.live_balance', 'Live Prepaid Balance')}</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                      ৳240.00
                    </p>
                    <p className="text-xs text-rose-500 font-semibold">
                      {t('card.below_threshold', 'Below recommended threshold (৳300)')}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-teal-500/10 border border-amber-500/30 dark:border-amber-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs font-bold">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{t('nav.ai_forecaster', 'AI Runout Forecaster')}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      At your current 7-day burn rate of <span className="font-bold">৳82/day</span>, your balance will last approximately <span className="font-bold text-amber-600 dark:text-amber-400">3 days</span>. We recommend recharging within 48 hours to prevent interruption.
                    </p>
                  </div>

                  <Link to="/login" className="block w-full">
                    <button className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                      <Zap className="w-4 h-4" />
                      <span>{t('card.quick_recharge', 'Quick Recharge ৳1,000 via bKash')}</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>{t('nav.about', 'About')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('about.title', 'About DESCO Smart Monitor')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('about.subtitle', 'Empowering 1.2M+ Dhaka city households with intelligent, automated prepaid electricity surveillance.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>{t('about.p1')}</p>
              <p>{t('about.p2')}</p>
              <div className="pt-2">
                <Link to="/register">
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    {t('nav.register', 'Register Your Meter Now')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* 4 Key Statistics Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-2xs">
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {t('about.stat1_num', '1.2M+')}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t('about.stat1_label', 'Prepaid Meters in Dhaka')}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-2xs">
                <p className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400">
                  {t('about.stat2_num', '99.8%')}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t('about.stat2_label', 'Alert Dispatch Reliability')}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-2xs">
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {t('about.stat3_num', '৳0')}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t('about.stat3_label', 'Hardware or Device Cost')}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-2xs">
                <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                  {t('about.stat4_num', '24/7')}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t('about.stat4_label', 'Continuous Health Monitoring')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>{t('nav.features', 'Features')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('features.title', 'Engineered Specifically for Bangladesh Prepaid Meters')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t(
                'features.subtitle',
                'No extra hardware devices or physical wiring required. Connects directly to DESCO digital metering gateways.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Gauge className="w-6 h-6 text-emerald-500" />,
                title: t('features.f1_title', 'Multi-Meter Management'),
                desc: t('features.f1_desc', 'Manage your flat, parents residence, or commercial shop meter from one unified console with instant switching.'),
              },
              {
                icon: <Sparkles className="w-6 h-6 text-teal-500" />,
                title: t('features.f2_title', 'AI Runout Predictor'),
                desc: t('features.f2_desc', 'Calculates consumption velocity and peak/off-peak variances to accurately project exact exhaustion timestamps.'),
              },
              {
                icon: <BellRing className="w-6 h-6 text-amber-500" />,
                title: t('features.f3_title', 'Custom Warning Thresholds'),
                desc: t('features.f3_desc', 'Set custom low (৳300) and critical (৳100) boundaries to receive high-priority SMS and email alerts before cutoff.'),
              },
              {
                icon: <Smartphone className="w-6 h-6 text-pink-500" />,
                title: t('features.f4_title', 'Instant bKash & Nagad Recharge'),
                desc: t('features.f4_desc', 'Generate 20-digit DESCO recharge tokens instantly with seamless mobile wallet checkouts.'),
              },
              {
                icon: <FileSpreadsheet className="w-6 h-6 text-blue-500" />,
                title: t('features.f5_title', 'Reconciled PDF & CSV Ledgers'),
                desc: t('features.f5_desc', 'Export monthly electricity statements for landlord-tenant reconciliation, accounting audits, and tax documentation.'),
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
                title: t('features.f6_title', 'Role-Based Administration'),
                desc: t('features.f6_desc', 'Granular permissions for Super Administrators, Operations Engineers, and Citizen Consumers.'),
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{f.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive AI Forecaster Section */}
      <section id="ai-preview" className="py-20 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('nav.ai_forecaster', 'AI Forecaster Demo')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Interactive Burn Rate & Runout Simulator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Adjust your current balance and daily burn rate to see our predictive algorithm calculate the exact days remaining.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Slider 1: Balance */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-300">Meter Balance</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{formatCurrency(sliderBalance)}</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={50}
                  value={sliderBalance}
                  onChange={(e) => setSliderBalance(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>৳100 (Low)</span>
                  <span>৳2,500</span>
                  <span>৳5,000 (Full)</span>
                </div>
              </div>

              {/* Slider 2: Burn rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-300">Daily Consumption (Burn Rate)</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">{formatCurrency(sliderDailyBurn)}/day</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={300}
                  step={5}
                  value={sliderDailyBurn}
                  onChange={(e) => setSliderDailyBurn(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>৳30/day (Light load)</span>
                  <span>৳150/day</span>
                  <span>৳300/day (Heavy AC)</span>
                </div>
              </div>
            </div>

            {/* Dynamic Calculated Output */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <p className="text-[11px] text-slate-400">AI Days Projection</p>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  ~{calculatedDays} Days
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <p className="text-[11px] text-slate-400">Projected Runout Date</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-2">
                  {new Date(Date.now() + calculatedDays * 86400000).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <p className="text-[11px] text-slate-400">Alert Recommendation</p>
                <p className={`text-xs font-bold mt-2 ${calculatedDays <= 3 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {calculatedDays <= 3 ? 'Urgent: Recharge within 24h' : 'Healthy: Normal consumption'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews ("Dhaka Stories") Section with 5 Stars and Active Filter Buttons */}
      <section id="testimonials" className="py-20 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{t('nav.reviews', 'Customer Reviews & Stories')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('reviews.title', 'Trusted by Dhaka Residents')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {t('reviews.subtitle', 'Thousands of households across Gulshan, Uttara, Mirpur, and Dhanmondi stay powered 24/7.')}
              </p>
            </div>

            {/* Write a Review Button */}
            <Button
              variant="outline"
              onClick={() => setReviewModalOpen(true)}
              leftIcon={<MessageSquarePlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              className="border-emerald-500/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              {t('reviews.write_btn', 'Write a Review')}
            </Button>
          </div>

          {/* Active Filter Buttons with State Highlight */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveReviewFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeReviewFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t('reviews.filter_all', 'All Reviews')} ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveReviewFilter('5stars')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeReviewFilter === '5stars'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{t('reviews.filter_5star', '5 Stars ★★★★★')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveReviewFilter('residential')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeReviewFilter === 'residential'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t('reviews.filter_res', 'Residential')}
            </button>
            <button
              type="button"
              onClick={() => setActiveReviewFilter('commercial')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeReviewFilter === 'commercial'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t('reviews.filter_comm', 'Commercial / Office')}
            </button>
          </div>

          {/* Review Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredReviews.map((t) => (
              <div
                key={t.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs hover:shadow-md transition-all"
              >
                {/* 5-Star Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starIndex) => (
                      <Star
                        key={starIndex}
                        className={`w-4 h-4 ${
                          starIndex <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400">{t.date}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "{t.quote}"
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{t.name}</p>
                    <p className="text-[11px] text-slate-400">{t.location}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Write a Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Share Your DESCO Experience"
        description="Write a verified review about how predictive smart monitoring helped your household."
      >
        {reviewSubmitted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Review Submitted!</h4>
            <p className="text-xs text-slate-500">Thank you for sharing your experience with the DESCO community.</p>
          </div>
        ) : (
          <form onSubmit={handleAddReview} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Star Rating *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewReviewRating(s)}
                    className="p-1 cursor-pointer focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        s <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-2">
                  {newReviewRating} Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={newReviewName}
                onChange={(e) => setNewReviewName(e.target.value)}
                placeholder="e.g. Shakil Mahmud"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dhaka Area / Sector *
                </label>
                <input
                  type="text"
                  required
                  value={newReviewLocation}
                  onChange={(e) => setNewReviewLocation(e.target.value)}
                  placeholder="e.g. Uttara Sector 7"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Connection Category
                </label>
                <select
                  value={newReviewCategory}
                  onChange={(e) => setNewReviewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial / Office</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Review Quote *
              </label>
              <textarea
                required
                rows={3}
                value={newReviewQuote}
                onChange={(e) => setNewReviewQuote(e.target.value)}
                placeholder="How did smart meter balance tracking and AI forecast prevent sudden disconnection?"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Submit Verified Review
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              <span>{t('nav.faq', 'FAQ')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('faq.title', 'Frequently Asked Questions')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('faq.subtitle', 'Everything you need to know about prepaid meter tracking in Dhaka')}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <span>{f.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-2 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 leading-relaxed">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t('nav.contact', 'Contact Support')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('contact.title', '24/7 Citizen Support & Assistance')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('contact.subtitle', 'Have inquiries regarding prepaid smart meters or immediate power reconnection? Reach our dedicated support team.')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Info Cards */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('contact.helpline_title', 'DESCO 24/7 Helpline')}
                  </h4>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">16120</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('contact.helpline_desc', 'Toll-free short code from any operator in Bangladesh')}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('contact.sms_title', 'Emergency SMS Gateway')}
                  </h4>
                  <p className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">01766677788</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('contact.sms_desc', 'Send SMS with your 10-digit meter number for balance status')}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('contact.office_title', 'Head Office')}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {t('contact.office_desc', '22/B Faruk Sarani, Nikunja-2, Dhaka 1229, Bangladesh')}
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Citizen Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  {t('contact.form_title', 'Send Direct Citizen Inquiry')}
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Our customer service engineers will get back to you within 2 working hours.
                </p>

                {contactSubmitted ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                      {t('contact.sent_msg', 'Thank you! Your inquiry has been dispatched to DESCO Support.')}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {t('contact.name', 'Your Name *')}
                        </label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Zahid Hasan"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {t('contact.meter_no', 'Meter / Account Number (Optional)')}
                        </label>
                        <input
                          type="text"
                          value={contactMeter}
                          onChange={(e) => setContactMeter(e.target.value)}
                          placeholder="3801948291"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('contact.msg', 'Inquiry or Issue Description *')}
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Describe your prepaid smart meter question, token generation issue, or alert setting..."
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <Button type="submit" variant="primary" rightIcon={<Send className="w-3.5 h-3.5" />}>
                      {t('contact.send', 'Send Inquiry')}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-tr from-emerald-600 to-teal-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Start Monitoring Your DESCO Balance in Under 60 Seconds
          </h2>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto">
            Join thousands of smart homeowners. No credit card required. Experience predictive prepaid tracking right now.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link to="/register">
              <button className="px-8 py-3.5 text-sm font-bold text-emerald-950 bg-white hover:bg-emerald-50 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
                <span>{language === 'bn' ? 'মিটার রেজিস্টার করুন' : 'Register Citizen Meter'}</span>
                <ArrowRight className="w-4 h-4 text-emerald-700" />
              </button>
            </Link>
            <Link to="/login">
              <button className="px-7 py-3.5 text-sm font-bold text-white hover:bg-white/10 border border-white/40 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
                <span>{language === 'bn' ? 'ড্যাশবোর্ডে সাইন ইন' : 'Sign In to Dashboard'}</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Public Footer with Copyright to Md Fazley Rabbi */}
      <footer className="py-10 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-slate-200 font-bold">
              © 2025 DESCO Smart Balance Monitor. Designed & Developed by{' '}
              <a
                href="https://github.com/rabbi1067/desco-balance-alert"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                Md Fazley Rabbi
              </a>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Helpline: 16120</span>
            <span>•</span>
            <span>Emergency SMS Gateway: 01766677788</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
