import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  isBn: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav & Common
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.features': 'Features',
    'nav.ai_forecaster': 'AI Forecaster',
    'nav.dhaka_stories': 'Customer Reviews',
    'nav.reviews': 'Customer Reviews',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.signin': 'Sign In',
    'nav.register': 'Register Meter',
    'nav.dashboard': 'Dashboard',
    'nav.live_demo': 'Live Demo',
    'nav.logout': 'Sign Out',

    // Hero
    'hero.badge': 'Live DESCO Smart Prepaid Meter Integration',
    'hero.title_pre': 'Never get disconnected in the',
    'hero.title_highlight': 'dark.',
    'hero.subtitle': 'DESCO Smart Balance Monitor calculates your daily electricity burn rate, projects exact runout dates with AI, and sends automated threshold alerts before your power trips.',
    'hero.btn_dashboard': 'Open Live Dashboard',
    'hero.btn_admin': 'Explore as Admin',
    'hero.feature_bkash': 'bKash & Nagad Recharges',
    'hero.feature_multimeter': 'Multi-Meter Monitoring',
    'hero.feature_nohardware': 'Zero Hardware Needed',

    // Live preview card
    'card.low_balance': 'Low Balance Warning',
    'card.healthy_balance': 'Balance Healthy',
    'card.critical_balance': 'Critical Warning',
    'card.live_balance': 'Live Prepaid Balance',
    'card.below_threshold': 'Below recommended threshold (৳300)',
    'card.quick_recharge': 'Quick Recharge ৳1,000 via bKash',

    // About section
    'about.title': 'About DESCO Smart Monitor',
    'about.subtitle': 'Empowering 1.2M+ Dhaka city households with intelligent, automated prepaid electricity surveillance.',
    'about.p1': 'Dhaka Electric Supply Company Limited (DESCO) prepaid smart meters give citizens full control over their power consumption. However, unexpected midnight balance depletions often leave families stranded without lights or air conditioning.',
    'about.p2': 'DESCO Smart Balance Monitor bridges this gap with non-intrusive algorithmic tracking, proactive multi-channel alerts (SMS and Email), and machine-learned burn rate projections—ensuring zero unexpected cutoffs.',
    'about.stat1_num': '1.2M+',
    'about.stat1_label': 'Prepaid Meters in Dhaka',
    'about.stat2_num': '99.8%',
    'about.stat2_label': 'Alert Dispatch Reliability',
    'about.stat3_num': '৳0',
    'about.stat3_label': 'Hardware or Device Cost',
    'about.stat4_num': '24/7',
    'about.stat4_label': 'Continuous Health Monitoring',

    // Features section
    'features.title': 'Engineered Specifically for Bangladesh Prepaid Meters',
    'features.subtitle': 'No extra hardware devices or physical wiring required. Connects directly to DESCO digital metering gateways.',
    'features.f1_title': 'Multi-Meter Management',
    'features.f1_desc': 'Manage your flat, parents residence, or commercial shop meter from one unified console with instant switching.',
    'features.f2_title': 'AI Runout Predictor',
    'features.f2_desc': 'Calculates consumption velocity and peak/off-peak variances to accurately project exact exhaustion timestamps.',
    'features.f3_title': 'Custom Warning Thresholds',
    'features.f3_desc': 'Set custom low (৳300) and critical (৳100) boundaries to receive high-priority SMS and email alerts before cutoff.',
    'features.f4_title': 'Instant bKash & Nagad Recharge',
    'features.f4_desc': 'Generate 20-digit DESCO recharge tokens instantly with seamless mobile wallet checkouts.',
    'features.f5_title': 'Reconciled PDF & CSV Ledgers',
    'features.f5_desc': 'Export monthly electricity statements for landlord-tenant reconciliation, accounting audits, and tax documentation.',
    'features.f6_title': 'Role-Based Administration',
    'features.f6_desc': 'Granular permissions for Super Administrators, Operations Engineers, and Citizen Consumers.',

    // Contact section
    'contact.title': '24/7 Citizen Support & Assistance',
    'contact.subtitle': 'Have inquiries regarding prepaid smart meters or immediate power reconnection? Reach our dedicated support team.',
    'contact.helpline_title': 'DESCO 24/7 Helpline',
    'contact.helpline_desc': 'Toll-free short code from any operator in Bangladesh',
    'contact.sms_title': 'Emergency SMS Gateway',
    'contact.sms_desc': 'Send SMS with your 10-digit meter number for balance status',
    'contact.office_title': 'Head Office',
    'contact.office_desc': '22/B Faruk Sarani, Nikunja-2, Dhaka 1229, Bangladesh',
    'contact.form_title': 'Send Direct Citizen Inquiry',
    'contact.name': 'Your Name',
    'contact.meter_no': 'Meter / Account Number (Optional)',
    'contact.msg': 'Inquiry or Issue Description',
    'contact.send': 'Send Inquiry',
    'contact.sent_msg': 'Thank you! Your inquiry has been dispatched to DESCO Support.',

    // Testimonials / Reviews
    'reviews.title': 'Trusted by Dhaka Residents',
    'reviews.subtitle': 'Thousands of households across Gulshan, Uttara, Mirpur, and Dhanmondi stay powered 24/7.',
    'reviews.filter_all': 'All Reviews',
    'reviews.filter_5star': '5 Stars ★★★★★',
    'reviews.filter_res': 'Residential',
    'reviews.filter_comm': 'Commercial / Office',
    'reviews.write_btn': 'Write a Review',
    'reviews.verified': 'Verified DESCO Consumer',

    // FAQ
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Everything you need to know about prepaid meter tracking in Dhaka',

    // Footer
    'footer.copyright': '© 2025 DESCO Smart Balance Monitor. Designed & Developed by Md Fazley Rabbi • Dhaka Electric Supply Company Limited.',
    'footer.helpline': 'Helpline: 16120',
    'footer.sms': 'Emergency SMS Gateway: 01766677788',

    // Add Meter Modal
    'modal.add_meter.title': 'Register New DESCO Prepaid Meter',
    'modal.add_meter.desc': 'Connect your DESCO smart meter with account number for automated balance tracking and AI predictions.',
    'modal.add_meter.name_label': 'Meter Friendly Name *',
    'modal.add_meter.name_ph': 'e.g. Dhanmondi Flat 3B or Uttara Residence',
    'modal.add_meter.meter_label': 'DESCO Smart Meter Number * (10 Digits)',
    'modal.add_meter.account_label': 'DESCO Customer Account Number * (Mandatory)',
    'modal.add_meter.account_ph': 'e.g. 23049182 or DESCO-ACT-8819',
    'modal.add_meter.email_label': 'Notification Alert Email *',
    'modal.add_meter.low_label': 'Low Threshold (৳)',
    'modal.add_meter.critical_label': 'Critical Threshold (৳)',
    'modal.add_meter.cancel': 'Cancel',
    'modal.add_meter.submit': 'Connect Meter',

    // Dashboard
    'dash.cur_balance': 'Current Balance',
    'dash.est_days': 'Est. Days Left',
    'dash.daily_burn': 'Daily Burn Rate',
    'dash.today_usage': 'Today Usage',
    'dash.active_meter': 'Active Meter',
    'dash.recharge_btn': 'Recharge Meter',

    // Sidebar & Navigation
    'sidebar.executive_governance': 'Executive Governance',
    'sidebar.grid_operations': 'Grid Operations',
    'sidebar.citizen_monitor': 'Citizen Monitor',
    'sidebar.administration': 'Administration',
    'sidebar.super_admin': 'Super Admin',
    'sidebar.account': 'Account & Settings',
    'sidebar.dashboard': 'Dashboard',
    'sidebar.executive_control': 'Executive Control',
    'sidebar.operations_center': 'Operations Center',
    'sidebar.my_meters': 'My Meters',
    'sidebar.fleet_overview': 'Fleet Overview',
    'sidebar.analytics': 'Analytics',
    'sidebar.reports': 'Reports & Ledger',
    'sidebar.notifications': 'Notifications',
    'sidebar.users_directory': 'Users Directory',
    'sidebar.meter_management': 'Meter Management',
    'sidebar.audit_logs': 'Audit Logs',
    'sidebar.admin_management': 'Admin Governance',
    'sidebar.email_config': 'Email Configuration',
    'sidebar.system_settings': 'System Settings',
    'sidebar.profile': 'Profile',
    'sidebar.settings': 'Settings',
    'sidebar.logout': 'Sign Out',

    // Settings Section
    'settings.title': 'Application Settings',
    'settings.subtitle': 'Configure appearance, language, automated notification thresholds, and system preferences',
    'settings.theme_title': 'Appearance & Theme',
    'settings.theme_desc': 'Customize light, dark, or system matching visual aesthetics',
    'settings.active_theme': 'Active Color Theme',
    'settings.lang_title': 'Language & Regional Format',
    'settings.lang_desc': 'Switch between English and Bengali (বাংলা) across all admin and user panels',
    'settings.lang_en': 'English (BD / Global)',
    'settings.lang_bn': 'বাংলা (Bengali)',
    'settings.notif_title': 'Notification Preferences & Thresholds',
    'settings.notif_desc': 'Configure emergency low-balance alert boundaries and dispatch rules',
    'settings.email_label': 'Official Notification Email',
    'settings.low_label': 'Low Balance Warning Threshold (৳)',
    'settings.crit_label': 'Critical Emergency Cutoff Threshold (৳)',
    'settings.enable_email': 'Enable Immediate Email Dispatch',
    'settings.enable_email_sub': 'Receive instant notifications when balance falls below threshold',
    'settings.weekly_digest': 'Enable Weekly AI Digest',
    'settings.weekly_digest_sub': 'Get Monday morning consumption summaries with 7-day runout forecast',
    'settings.privacy_title': 'Telemetry & Diagnostics',
    'settings.privacy_desc': 'Manage diagnostic logging and telemetry metrics',
    'settings.privacy_label': 'Enhanced Diagnostics Mode',
    'settings.privacy_sub': 'Log real-time latency and packet health metrics',
    'settings.save_btn': 'Save Settings & Preferences',
    'settings.saved_msg': 'All system preferences successfully saved and language updated.',

    // Header & Common
    'header.recharge': 'Recharge',
    'header.switch_meter': 'Switch Active Meter',
    'header.add_meter': 'Add New Meter',
    'header.switch_role': 'Switch Role Account',
    'header.role_user': 'User',
    'header.role_admin': 'Admin',
    'header.role_super_admin': 'Super Admin',
    'header.profile': 'Profile Settings',
    'header.settings': 'System & Alert Preferences',
    'header.scan_grid': 'Scan Grid Balance',
    'header.language': 'Language',
    'header.verified_consumer': 'Verified Citizen Consumer',
    'header.operations_admin': 'Operations Administrator',
    'header.super_admin_badge': 'Super Administrator',

    // Admin Dashboard Operations
    'admin_dash.title': 'DESCO Grid Fleet Command Dashboard',
    'admin_dash.subtitle': 'Real-time fleet telemetry, consumer balance surveillance, and automated dispatch control for Dhaka electricity distribution.',
    'admin_dash.ops_center': 'Operations Center',
    'admin_dash.officer': 'Officer on Duty',
    'admin_dash.scan_btn': 'Run Global Threshold Scan',
    'admin_dash.scanning': 'Scanning Grid...',
    'admin_dash.fleet_mgmt': 'Fleet Management',
    'admin_dash.kpi_fleet': 'Monitored Fleet',
    'admin_dash.kpi_fleet_sub': '100% AMI Telemetry Connected',
    'admin_dash.kpi_critical': 'Critical Cutoff Risk',
    'admin_dash.kpi_critical_sub': 'Balance below critical limit',
    'admin_dash.kpi_low': 'Low Balance Warning',
    'admin_dash.kpi_low_sub': 'Approaching warning threshold',
    'admin_dash.kpi_reserve': 'Fleet Balance Reserve',
    'admin_dash.kpi_reserve_sub': 'Aggregate consumer credit',
    'admin_dash.kpi_efficiency': 'Dispatch Reliability',
    'admin_dash.kpi_efficiency_sub': 'Automated gateway SLA',
    'admin_dash.table_title': 'Live Fleet Surveillance & Quick Actions',
    'admin_dash.table_desc': 'Monitor real-time prepaid balances, dispatch emergency warnings, or poll individual AMR meters',
    'admin_dash.col_meter': 'Meter / Citizen',
    'admin_dash.col_account': 'Account No',
    'admin_dash.col_balance': 'Balance',
    'admin_dash.col_status': 'Status',
    'admin_dash.col_threshold': 'Thresholds (Low/Crit)',
    'admin_dash.col_actions': 'Action Dispatch',
    'admin_dash.btn_send_alert': 'Dispatch Alert',
    'admin_dash.btn_sending': 'Sending...',
    'admin_dash.btn_poll': 'Poll AMR',
    'admin_dash.btn_polling': 'Polling...',
    'admin_dash.search_ph': 'Search meter #, customer name, email, or account...',
    'admin_dash.lang_switch': 'Language / ভাষা:',
    'admin_dash.filter_all': 'All Meters',
    'admin_dash.filter_critical': 'Critical Risk',
    'admin_dash.filter_low': 'Low Balance',
    'admin_dash.filter_healthy': 'Healthy Balance',

    // Super Admin Governance
    'super_admin.title': 'Root Super Admin Grid Governance',
    'super_admin.subtitle': 'Master administrative control, automated grid scanning, system health, and high-clearance executive operations.',
    'super_admin.badge': 'Master Governance',
    'super_admin.director': 'Grid Director',
    'super_admin.btn_scan': 'Execute Root Grid Scan',
    'super_admin.btn_scanning': 'Scanning Network...',
    'super_admin.btn_admins': 'Admin Governance',
    'super_admin.btn_system': 'System Parameters',
    'super_admin.kpi_fleet': 'Total Fleet Meters',
    'super_admin.kpi_critical': 'Emergency Cutoffs',
    'super_admin.kpi_low': 'Warning Threshold',
    'super_admin.kpi_balance': 'Total Grid Float',
    'super_admin.kpi_admins': 'Operations Admins',
    'super_admin.kpi_citizens': 'Registered Citizens',
    'super_admin.telemetry_title': 'Automated Grid Scan & Dispatch Ledger',
    'super_admin.telemetry_sub': 'System logs of all automated threshold scans and citizen notification dispatches',

    // Admin Governance & Management
    'admin_sec.title': 'System Administrator Governance',
    'admin_sec.subtitle': 'Manage administrative privileges, provision operations officers, and configure Root Super Admin ownership',
    'admin_sec.change_super': 'Change Super Admin',
    'admin_sec.provision_admin': 'Provision Administrator',
    'admin_sec.master_account': 'Root Super Administrator (Master Account)',
    'admin_sec.active_master': 'Active Master',
    'admin_sec.current_owner': 'Current Owner',
    'admin_sec.transfer_btn': 'Transfer Ownership',
    'admin_sec.admin_officer': 'Admin Officer',
    'admin_sec.position': 'Designation / Position',
    'admin_sec.role': 'Clearance Role',
    'admin_sec.status': 'Status',
    'admin_sec.actions': 'Actions',
    'admin_sec.suspend': 'Suspend',
    'admin_sec.activate': 'Activate',
    'admin_sec.revoke': 'Revoke',

    // System Settings & Parameters
    'system_sec.title': 'Global System Parameters & Health',
    'system_sec.subtitle': 'Super-Admin engine settings, telemetry cron frequency, and gateway operational parameters',
    'system_sec.lang_title': 'System Display Language (ভাষা নির্বাচন)',
    'system_sec.lang_sub': 'Set default interface language across Super Admin, Admin operations, and citizen portals',
    'system_sec.defaults_title': 'Default Pre-configuration for New Meters',
    'system_sec.low_label': 'Global Default Low Threshold (৳)',
    'system_sec.crit_label': 'Global Default Critical Threshold (৳)',
    'system_sec.sync_freq': 'Automated Gateway Sync Frequency (Minutes)',
    'system_sec.save_btn': 'Save Parameters',
  },
  bn: {
    // Nav & Common
    'nav.home': 'হোম',
    'nav.about': 'আমাদের সম্পর্কে',
    'nav.features': 'সুবিধাসমূহ',
    'nav.ai_forecaster': 'এআই পূর্বাভাস',
    'nav.dhaka_stories': 'গ্রাহক রিভিউ',
    'nav.reviews': 'গ্রাহক রিভিউ',
    'nav.faq': 'প্রশ্নোত্তর',
    'nav.contact': 'যোগাযোগ',
    'nav.signin': 'লগইন',
    'nav.register': 'মিটার নিবন্ধন',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.live_demo': 'লাইভ ডেমো',
    'nav.logout': 'সাইন আউট',

    // Hero
    'hero.badge': 'সরাসরি ডেসকো স্মার্ট প্রিপেইড মিটার ইন্টিগ্রেশন',
    'hero.title_pre': 'হঠাৎ অন্ধকারে আর কখনো',
    'hero.title_highlight': 'বিদ্যুৎ বিচ্ছিন্ন হবেন না।',
    'hero.subtitle': 'ডেসকো স্মার্ট ব্যালেন্স মনিটর আপনার দৈনিক বিদ্যুৎ খরচের হার হিসাব করে, এআই দিয়ে ব্যালেন্স ফুরিয়ে যাওয়ার সঠিক তারিখ পূর্বাভাস দেয় এবং লাইন কাটার আগেই স্বয়ংক্রিয় সতর্কবার্তা পাঠায়।',
    'hero.btn_dashboard': 'লাইভ ড্যাশবোর্ড দেখুন',
    'hero.btn_admin': 'অ্যাডমিন হিসেবে দেখুন',
    'hero.feature_bkash': 'বিকাশ ও নগদ দিয়ে দ্রুত রিচার্জ',
    'hero.feature_multimeter': 'একাধিক মিটার একসাথে পর্যবেক্ষণ',
    'hero.feature_nohardware': 'অতিরিক্ত কোনো ডিভাইসের প্রয়োজন নেই',

    // Live preview card
    'card.low_balance': 'কম ব্যালেন্স সতর্কতা',
    'card.healthy_balance': 'ব্যালেন্স পর্যাপ্ত',
    'card.critical_balance': 'জরুরি সতর্কতা',
    'card.live_balance': 'লাইভ প্রিপেইড ব্যালেন্স',
    'card.below_threshold': 'সতর্কতা সীমার নিচে (৳৩০০)',
    'card.quick_recharge': 'বিকাশে দ্রুত ৳১,০০০ রিচার্জ',

    // About section
    'about.title': 'ডেসকো স্মার্ট মনিটর সম্পর্কে',
    'about.subtitle': 'ঢাকা শহরের ১২ লাখের বেশি প্রিপেইড বিদ্যুৎ গ্রাহকদের জন্য আধুনিক ও নিরবচ্ছিন্ন স্বয়ংক্রিয় ব্যালেন্স নজরদারি।',
    'about.p1': 'ঢাকা ইলেকট্রিক সাপ্লাই কোম্পানি লিমিটেড (ডেসকো) প্রিপেইড স্মার্ট মিটার নাগরিকদের বিদ্যুৎ ব্যয়ের পূর্ণ নিয়ন্ত্রণ দিয়েছে। কিন্তু গভীর রাতে হঠাৎ ব্যালেন্স শেষ হয়ে গেলে পরিবারগুলো আলো ও ফ্যান ছাড়া চরম দুর্ভোগে পড়ে।',
    'about.p2': 'ডেসকো স্মার্ট ব্যালেন্স মনিটর গ্রাহকদের এসএমএস ও ইমেইলে আগে থেকেই অ্যালার্ট পাঠায় এবং এআই অ্যালগরিদমের মাধ্যমে কত দিন বিদ্যুৎ চলবে তা নিখুঁতভাবে প্রদর্শন করে বিদ্যুৎ বিচ্ছিন্নতা দূর করে।',
    'about.stat1_num': '১২ লাখ+',
    'about.stat1_label': 'ঢাকায় স্মার্ট প্রিপেইড মিটার',
    'about.stat2_num': '৯৯.৮%',
    'about.stat2_label': 'অ্যালার্ট পৌঁছানোর বিশ্বস্ততা',
    'about.stat3_num': '৳০',
    'about.stat3_label': 'ডিভাইস বা অতিরিক্ত খরচ',
    'about.stat4_num': '২৪/৭',
    'about.stat4_label': 'সার্বক্ষণিক মিটার পর্যবেক্ষণ',

    // Features section
    'features.title': 'বাংলাদেশের প্রিপেইড মিটারের জন্য বিশেষভাবে নির্মিত',
    'features.subtitle': 'কোনো অতিরিক্ত হার্ডওয়্যার বা ওয়্যারিংয়ের প্রয়োজন নেই। সরাসরি ডেসকো ডিজিটাল সার্ভার থেকে ডাটা পর্যবেক্ষণ করে।',
    'features.f1_title': 'একাধিক মিটার ব্যবস্থাপনা',
    'features.f1_desc': 'নিজের বাসা, গ্রামের বাড়ি বা বাণিজ্যিক অফিসের মিটার এক স্ক্রিন থেকেই এক ক্লিকে সুইচ করে পর্যবেক্ষণ করুন।',
    'features.f2_title': 'এআই ব্যালেন্স পূর্বাভাস',
    'features.f2_desc': 'পিক ও অফ-পিক সময়ের খরচের গতিবিধি হিসাব করে কত দিন কত ঘণ্টা চলবে তা নিখুঁতভাবে পূর্বাভাস দেয়।',
    'features.f3_title': 'কাস্টম অ্যালার্ট সীমা',
    'features.f3_desc': 'আপনার ইচ্ছামত ওয়ার্নিং লিমিট (৳৩০০) এবং জরুরি লিমিট (৳১০০) সেট করুন—রাত বারোটার আগেই এসএমএস পাবেন।',
    'features.f4_title': 'বিকাশ ও নগদ দিয়ে তাৎক্ষণিক রিচার্জ',
    'features.f4_desc': 'সরাসরি মোবাইল ব্যাংকিংয়ের মাধ্যমে সেকেন্ডের মধ্যে ২০ ডিজিটের ডেসকো রিচার্জ টোকেন সংগ্রহ করুন।',
    'features.f5_title': 'পিডিএফ ও সিএসভি লেজার হিস্ট্রি',
    'features.f5_desc': 'ভাড়াটিয়া-মালিক হিসাব বা ট্যাক্স অডিটের জন্য পরিষ্কার মাসিক বিদ্যুৎ খরচের বিবরণী ডাউনলোড করুন।',
    'features.f6_title': 'রোল-ভিত্তিক অ্যাডমিনিস্ট্রেশন',
    'features.f6_desc': 'সুপার অ্যাডমিন, অপারেশনাল ইঞ্জিনিয়ার ও সাধারণ নাগরিকদের জন্য আলাদা ও নিরাপদ অ্যাক্সেস সুবিধা।',

    // Contact section
    'contact.title': '২৪/৭ গ্রাহক সেবা ও সহায়তা',
    'contact.subtitle': 'প্রিপেইড স্মার্ট মিটার বা রিচার্জ সংক্রান্ত যেকোনো জরুরি বিষয়ে আমাদের সাথে যোগাযোগ করুন।',
    'contact.helpline_title': 'ডেসকো ২৪/৭ হেল্পলাইন',
    'contact.helpline_desc': 'বাংলাদেশের যেকোনো মোবাইল অপারেটর থেকে টোল-ফ্রি শর্ট কোড',
    'contact.sms_title': 'জরুরি এসএমএস গেটওয়ে',
    'contact.sms_desc': '১০ ডিজিটের মিটার নম্বর লিখে ব্যালেন্স জানতে এসএমএস করুন',
    'contact.office_title': 'প্রধান কার্যালয়',
    'contact.office_desc': '২২/বি ফারুক সরণি, নিকুঞ্জ-২, ঢাকা ১২২৯, বাংলাদেশ',
    'contact.form_title': 'সরাসরি বার্তা বা অভিযোগ পাঠান',
    'contact.name': 'আপনার নাম',
    'contact.meter_no': 'মিটার অথবা গ্রাহক অ্যাকাউন্ট নম্বর (ঐচ্ছিক)',
    'contact.msg': 'আপনার প্রশ্ন বা সমস্যার বিবরণ',
    'contact.send': 'বার্তা পাঠান',
    'contact.sent_msg': 'ধন্যবাদ! আপনার বার্তা ডেসকো সাপোর্ট টিমের কাছে পৌঁছে গেছে।',

    // Testimonials / Reviews
    'reviews.title': 'ঢাকার সম্মানিত গ্রাহকদের মতামত',
    'reviews.subtitle': 'গুলশান, উত্তরা, মিরপুর এবং ধানমন্ডির হাজার হাজার পরিবারের প্রতিদিনের বিশ্বস্ত সঙ্গী।',
    'reviews.filter_all': 'সকল রিভিউ',
    'reviews.filter_5star': '৫ তারকা ★★★★★',
    'reviews.filter_res': 'আবাসিক গ্রাহক',
    'reviews.filter_comm': 'বাণিজ্যিক / অফিস',
    'reviews.write_btn': 'আপনার রিভিউ লিখুন',
    'reviews.verified': 'যাচাইকৃত ডেসকো গ্রাহক',

    // FAQ
    'faq.title': 'সাধারণ জিজ্ঞাসা (FAQ)',
    'faq.subtitle': 'প্রিপেইড মিটার পর্যবেক্ষণ ও রিচার্জ সম্পর্কে প্রয়োজনীয় তথ্য',

    // Footer
    'footer.copyright': '© ২০২৫ ডেসকো স্মার্ট ব্যালেন্স মনিটর। ডিজাইন ও ডেভেলপ করেছেন মোঃ ফজলে রাব্বি • ঢাকা ইলেকট্রিক সাপ্লাই কোম্পানি লিমিটেড।',
    'footer.helpline': 'হেল্পলাইন: ১৬১২০',
    'footer.sms': 'জরুরি এসএমএস গেটওয়ে: ০১Store৬৬৭৭৭৮৮',

    // Add Meter Modal
    'modal.add_meter.title': 'নতুন ডেসকো প্রিপেইড মিটার যুক্ত করুন',
    'modal.add_meter.desc': 'স্বয়ংক্রিয় ব্যালেন্স পর্যবেক্ষণ এবং এআই পূর্বাভাস জন্য মিটার নম্বর ও অ্যাকাউন্ট নম্বর দিয়ে যুক্ত করুন।',
    'modal.add_meter.name_label': 'মিটারে চেনার নাম *',
    'modal.add_meter.name_ph': 'যেমন: ধানমন্ডি ফ্ল্যাট ৩বি অথবা উত্তরার বাসা',
    'modal.add_meter.meter_label': 'ডেসকো স্মার্ট মিটার নম্বর * (১০ ডিজিট)',
    'modal.add_meter.account_label': 'ডেসকো গ্রাহক অ্যাকাউন্ট নম্বর * (বাধ্যতামূলক)',
    'modal.add_meter.account_ph': 'যেমন: ২৩০৪৯১৮২ অথবা DESCO-ACT-8819',
    'modal.add_meter.email_label': 'অ্যালার্ট নোটিফিকেশন ইমেইল *',
    'modal.add_meter.low_label': 'সতর্কতা ব্যালেন্স সীমা (৳)',
    'modal.add_meter.critical_label': 'জরুরি ব্যালেন্স সীমা (৳)',
    'modal.add_meter.cancel': 'বাতিল',
    'modal.add_meter.submit': 'মিটার যুক্ত করুন',

    // Dashboard
    'dash.cur_balance': 'বর্তমান ব্যালেন্স',
    'dash.est_days': 'আনুমানিক দিন বাকি',
    'dash.daily_burn': 'দৈনিক খরচের হার',
    'dash.today_usage': 'আজকের খরচ',
    'dash.active_meter': 'বর্তমান মিটার',
    'dash.recharge_btn': 'রিচার্জ করুন',

    // Sidebar & Navigation
    'sidebar.executive_governance': 'এক্সিকিউটিভ গভর্নেন্স',
    'sidebar.grid_operations': 'গ্রিড অপারেশনস',
    'sidebar.citizen_monitor': 'গ্রাহক মনিটর',
    'sidebar.administration': 'প্রশাসনিক ব্যবস্থাপনা',
    'sidebar.super_admin': 'সুপার অ্যাডমিন',
    'sidebar.account': 'অ্যাকাউন্ট ও সেটিংস',
    'sidebar.dashboard': 'ড্যাশবোর্ড',
    'sidebar.executive_control': 'এক্সিকিউটিভ কন্ট্রোল',
    'sidebar.operations_center': 'অপারেশনস সেন্টার',
    'sidebar.my_meters': 'আমার মিটার',
    'sidebar.fleet_overview': 'মিটার ফ্লিট পর্যবেক্ষণ',
    'sidebar.analytics': 'অ্যানালিটিক্স',
    'sidebar.reports': 'রিপোর্ট ও লেজার',
    'sidebar.notifications': 'নোটিফিকেশন ও অ্যালার্ট',
    'sidebar.users_directory': 'গ্রাহক ও ইউজার তালিকা',
    'sidebar.meter_management': 'মিটার পরিচালনা',
    'sidebar.audit_logs': 'অডিট লগ',
    'sidebar.admin_management': 'অ্যাডমিন পরিচালনা',
    'sidebar.email_config': 'ইমেইল কনফিগারেশন',
    'sidebar.system_settings': 'সিস্টেম সেটিংস',
    'sidebar.profile': 'প্রোফাইল',
    'sidebar.settings': 'সেটিংস',
    'sidebar.logout': 'সাইন আউট',

    // Settings Section
    'settings.title': 'অ্যাপ্লিকেশন সেটিংস',
    'settings.subtitle': 'থিম, ভাষা, স্বয়ংক্রিয় নোটিফিকেশন অ্যালার্ট সীমা এবং সিস্টেম সেটিংস কনফিগার করুন',
    'settings.theme_title': 'থিম ও ডিসপ্লে মোড',
    'settings.theme_desc': 'লাইট মোড বা ডার্ক মোড নির্বাচন করুন',
    'settings.active_theme': 'বর্তমান থিম মোড',
    'settings.lang_title': 'ভাষা ও আঞ্চলিক সেটিংস',
    'settings.lang_desc': 'সকল অ্যাডমিন ও ইউজারের জন্য বাংলা এবং ইংরেজি নির্বাচন করুন',
    'settings.lang_en': 'English (ইংরেজি)',
    'settings.lang_bn': 'বাংলা (Bengali)',
    'settings.notif_title': 'নোটিফিকেশন ও অ্যালার্ট সীমা',
    'settings.notif_desc': 'কম ব্যালেন্স ও লাইন কাটার জরুরি সতর্কতা লেভেল সেট করুন',
    'settings.email_label': 'অ্যালার্ট পাওয়ার অফিসিয়াল ইমেইল',
    'settings.low_label': 'ওয়ার্নিং অ্যালার্ট সীমা (৳)',
    'settings.crit_label': 'জরুরি শাটডাউন অ্যালার্ট সীমা (৳)',
    'settings.enable_email': 'জরুরি সময়ে সরাসরি ইমেইল পাঠান',
    'settings.enable_email_sub': 'ব্যালেন্স সীমার নিচে নামলেই তাৎক্ষণিক ইমেইল নোটিফিকেশন যাবে',
    'settings.weekly_digest': 'সাপ্তাহিক এআই ডাইজেস্ট চালু রাখুন',
    'settings.weekly_digest_sub': 'প্রতি সোমবার বিদ্যুৎ খরচের বিবরণ ও কত দিন চলবে তার পূর্বাভাস পাবেন',
    'settings.privacy_title': 'টেলিমেট্রি ও ডায়াগনস্টিকস',
    'settings.privacy_desc': 'সিস্টেম ডায়াগনস্টিক লগ ও টেলিমেট্রি মেট্রিক্স পরিচালনা করুন',
    'settings.privacy_label': 'উন্নত ডায়াগনস্টিক মোড',
    'settings.privacy_sub': 'লাইভ লেটেন্সি এবং প্যাকেট হেলথ মেট্রিক্স রেকর্ড করবে',
    'settings.save_btn': 'সেটিংস সংরক্ষণ করুন',
    'settings.saved_msg': 'সকল সিস্টেম সেটিংস ও ভাষা সফলভাবে সংরক্ষিত হয়েছে।',

    // Header & Common
    'header.recharge': 'রিচার্জ',
    'header.switch_meter': 'মিটার পরিবর্তন করুন',
    'header.add_meter': 'নতুন মিটার যুক্ত করুন',
    'header.switch_role': 'রোল পরিবর্তন করুন',
    'header.role_user': 'গ্রাহক',
    'header.role_admin': 'অ্যাডমিন',
    'header.role_super_admin': 'সুপার অ্যাডমিন',
    'header.profile': 'প্রোফাইল সেটিংস',
    'header.settings': 'সিস্টেম ও অ্যালার্ট সেটিংস',
    'header.scan_grid': 'গ্রিড ব্যালেন্স স্ক্যান',
    'header.language': 'ভাষা',
    'header.verified_consumer': 'যাচাইকৃত ডেসকো গ্রাহক',
    'header.operations_admin': 'অপারেশনস অ্যাডমিনিস্ট্রেটর',
    'header.super_admin_badge': 'সুপার অ্যাডমিনিস্ট্রেটর',

    // Admin Dashboard Operations (Bengali)
    'admin_dash.title': 'ডেসকো গ্রিড ফ্লিট কমান্ড ড্যাশবোর্ড',
    'admin_dash.subtitle': 'ঢাকা বিদ্যুৎ বিতরণ ব্যবস্থার জন্য রিয়েল-টাইম ফ্লিট টেলিমেট্রি, গ্রাহক ব্যালেন্স নজরদারি ও স্বয়ংক্রিয় অ্যালার্ট নিয়ন্ত্রণ।',
    'admin_dash.ops_center': 'অপারেশনস সেন্টার',
    'admin_dash.officer': 'দায়িত্বপ্রাপ্ত কর্মকর্তা',
    'admin_dash.scan_btn': 'গ্রিড-ব্যাপী ব্যালেন্স স্ক্যান',
    'admin_dash.scanning': 'গ্রিড স্ক্যান হচ্ছে...',
    'admin_dash.fleet_mgmt': 'ফ্লিট ম্যানেজমেন্ট',
    'admin_dash.kpi_fleet': 'নজরদারিকৃত ফ্লিট',
    'admin_dash.kpi_fleet_sub': '১০০% এএমআই টেলিমেট্রি সংযুক্ত',
    'admin_dash.kpi_critical': 'জরুরি সংযোগ বিচ্ছিন্ন ঝুঁকি',
    'admin_dash.kpi_critical_sub': 'ব্যালেন্স জরুরি সীমার নিচে',
    'admin_dash.kpi_low': 'কম ব্যালেন্স সতর্কতা',
    'admin_dash.kpi_low_sub': 'সতর্কতা সীমার কাছাকাছি',
    'admin_dash.kpi_reserve': 'ফ্লিট ব্যালেন্স রিজার্ভ',
    'admin_dash.kpi_reserve_sub': 'গ্রাহকদের মোট জমা ব্যালেন্স',
    'admin_dash.kpi_efficiency': 'ডিসপ্যাচ নির্ভরযোগ্যতা',
    'admin_dash.kpi_efficiency_sub': 'স্বয়ংক্রিয় গেটওয়ে এসএলএ',
    'admin_dash.table_title': 'লাইভ ফ্লিট নজরদারি ও দ্রুত পদক্ষেপ',
    'admin_dash.table_desc': 'রিয়েল-টাইম প্রিপেইড ব্যালেন্স পর্যবেক্ষণ করুন, জরুরি সতর্কতা পাঠান অথবা এএমআর মিটারের তথ্য রিফ্রেশ করুন',
    'admin_dash.col_meter': 'মিটার / গ্রাহক',
    'admin_dash.col_account': 'অ্যাকাউন্ট নম্বর',
    'admin_dash.col_balance': 'ব্যালেন্স',
    'admin_dash.col_status': 'স্ট্যাটাস',
    'admin_dash.col_threshold': 'সীমা (ওয়ার্নিং/জরুরি)',
    'admin_dash.col_actions': 'অ্যাকশন গ্রহণ',
    'admin_dash.btn_send_alert': 'অ্যালার্ট পাঠান',
    'admin_dash.btn_sending': 'পাঠানো হচ্ছে...',
    'admin_dash.btn_poll': 'গেটওয়ে রিফ্রেশ',
    'admin_dash.btn_polling': 'রিফ্রেশ হচ্ছে...',
    'admin_dash.search_ph': 'মিটার নম্বর, গ্রাহকের নাম, ইমেইল অথবা অ্যাকাউন্ট দিয়ে খুঁজুন...',
    'admin_dash.lang_switch': 'ভাষা / Language:',
    'admin_dash.filter_all': 'সকল মিটার',
    'admin_dash.filter_critical': 'জরুরি ঝুঁকি',
    'admin_dash.filter_low': 'কম ব্যালেন্স',
    'admin_dash.filter_healthy': 'স্বাভাবিক ব্যালেন্স',

    // Super Admin Governance (Bengali)
    'super_admin.title': 'রুট সুপার অ্যাডমিন গ্রিড গভর্ন্যান্স',
    'super_admin.subtitle': 'মাস্টার প্রশাসনিক নিয়ন্ত্রণ, স্বয়ংক্রিয় গ্রিড স্ক্যানিং, সিস্টেম হেলথ এবং শীর্ষ পর্যায়ের এক্সিকিউটিভ অপারেশন।',
    'super_admin.badge': 'মাস্টার গভর্ন্যান্স',
    'super_admin.director': 'গ্রিড ডিরেক্টর',
    'super_admin.btn_scan': 'রুট গ্রিড স্ক্যান পরিচালনা করুন',
    'super_admin.btn_scanning': 'নেটওয়ার্ক স্ক্যান হচ্ছে...',
    'super_admin.btn_admins': 'অ্যাডমিন পরিচালনা',
    'super_admin.btn_system': 'সিস্টেম প্যারামিটার',
    'super_admin.kpi_fleet': 'মোট ফ্লিট মিটার',
    'super_admin.kpi_critical': 'জরুরি শাটডাউন',
    'super_admin.kpi_low': 'ওয়ার্নিং অ্যালার্ট',
    'super_admin.kpi_balance': 'মোট গ্রিড ব্যালেন্স',
    'super_admin.kpi_admins': 'অপারেশনস অ্যাডমিন',
    'super_admin.kpi_citizens': 'নিবন্ধিত গ্রাহক',
    'super_admin.telemetry_title': 'স্বয়ংক্রিয় গ্রিড স্ক্যান ও ডিসপ্যাচ লেজার',
    'super_admin.telemetry_sub': 'সকল স্বয়ংক্রিয় অ্যালার্ট স্ক্যান ও গ্রাহক নোটিফিকেশনের সিস্টেম হিস্ট্রি',

    // Admin Governance & Management (Bengali)
    'admin_sec.title': 'সিস্টেম অ্যাডমিনিস্ট্রেটর পরিচালনা',
    'admin_sec.subtitle': 'প্রশাসনিক সুবিধা নিয়ন্ত্রণ, অপারেশন অফিসার নিয়োগ এবং রুট সুপার অ্যাডমিন মালিকানা পরিচালনা করুন',
    'admin_sec.change_super': 'সুপার অ্যাডমিন পরিবর্তন',
    'admin_sec.provision_admin': 'নতুন অ্যাডমিন নিয়োগ',
    'admin_sec.master_account': 'রুট সুপার অ্যাডমিনিস্ট্রেটর (মাস্টার অ্যাকাউন্ট)',
    'admin_sec.active_master': 'সক্রিয় মাস্টার',
    'admin_sec.current_owner': 'বর্তমান মালিক',
    'admin_sec.transfer_btn': 'মালিকানা হস্তান্তর',
    'admin_sec.admin_officer': 'অ্যাডমিন কর্মকর্তা',
    'admin_sec.position': 'পদবী / দায়িত্ব',
    'admin_sec.role': 'ক্লিয়ারেন্স রোল',
    'admin_sec.status': 'স্ট্যাটাস',
    'admin_sec.actions': 'পদক্ষেপ',
    'admin_sec.suspend': 'স্থগিত করুন',
    'admin_sec.activate': 'সক্রিয় করুন',
    'admin_sec.revoke': 'বাতিল করুন',

    // System Settings & Parameters (Bengali)
    'system_sec.title': 'গ্লোবাল সিস্টেম প্যারামিটার ও হেলথ',
    'system_sec.subtitle': 'সুপার-অ্যাডমিন ইঞ্জিন সেটিংস, টেলিমেট্রি ফ্রিকোয়েন্সি এবং গেটওয়ে প্যারামিটার',
    'system_sec.lang_title': 'সিস্টেম প্রদর্শনী ভাষা (ভাষা নির্বাচন)',
    'system_sec.lang_sub': 'সকল সুপার অ্যাডমিন, অ্যাডমিন অপারেশন এবং গ্রাহক পোর্টালে ডিফল্ট ভাষা নির্ধারণ করুন',
    'system_sec.defaults_title': 'নতুন মিটারের জন্য ডিফল্ট কনফিগারেশন',
    'system_sec.low_label': 'গ্লোবাল ডিফল্ট লো ব্যালেন্স সীমা (৳)',
    'system_sec.crit_label': 'গ্লোবাল ডিফল্ট ক্রিটিক্যাল সীমা (৳)',
    'system_sec.sync_freq': 'স্বয়ংক্রিয় গেটওয়ে সিঙ্ক ফ্রিকোয়েন্সি (মিনিট)',
    'system_sec.save_btn': 'প্যারামিটার সংরক্ষণ করুন',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('desco_language');
    if (saved === 'en' || saved === 'bn') return saved;
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('desco_language', language);
    localStorage.setItem('desco_cfg_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'bn' : 'en'));
  };

  const t = (key: string, fallback?: string): string => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    if (translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, isBn: language === 'bn', setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
