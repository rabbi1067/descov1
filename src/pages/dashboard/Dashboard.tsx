import React, { useState } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { MobileNav } from '../../components/layout/MobileNav';
import { Footer } from '../../components/layout/Footer';
import { AddMeterModal } from '../../components/dashboard/AddMeterModal';
import { RechargeModal } from '../../components/dashboard/RechargeModal';
import { DashboardSection } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

// Import all sections
import { DashboardSectionComponent } from '../../sections/DashboardSection';
import { AdminDashboardSection } from '../../sections/AdminDashboardSection';
import { SuperAdminDashboardSection } from '../../sections/SuperAdminDashboardSection';
import { MeterSection } from '../../sections/MeterSection';
import { AnalyticsSection } from '../../sections/AnalyticsSection';
import { ReportsSection } from '../../sections/ReportsSection';
import { NotificationSection } from '../../sections/NotificationSection';
import { ProfileSection } from '../../sections/ProfileSection';
import { SettingsSection } from '../../sections/SettingsSection';
import { UsersSection } from '../../sections/UsersSection';
import { MeterManageSection } from '../../sections/MeterManageSection';
import { AuditSection } from '../../sections/AuditSection';
import { AdminSection } from '../../sections/AdminSection';
import { EmailConfigSection } from '../../sections/EmailConfigSection';
import { SystemSection } from '../../sections/SystemSection';

const sectionTitlesEn: Record<DashboardSection, string> = {
  dashboard: 'Smart Balance Overview',
  meters: 'Connected Meters',
  analytics: 'Consumption Analytics',
  reports: 'Ledger & Reports',
  notifications: 'Alert Notifications',
  profile: 'Citizen Profile',
  settings: 'System Preferences',
  users: 'Consumer Directory',
  meter_management: 'Meter Fleet Operations',
  audit_logs: 'Audit & Telemetry Logs',
  admin_management: 'Admin Governance',
  email_config: 'Email Gateway Configuration',
  system_settings: 'Global System Parameters',
};

const sectionTitlesBn: Record<DashboardSection, string> = {
  dashboard: 'স্মার্ট ব্যালেন্স পর্যবেক্ষণ',
  meters: 'সংযুক্ত মিটারসমূহ',
  analytics: 'বিদ্যুৎ ব্যবহার অ্যানালিটিক্স',
  reports: 'লেজার ও হিসাব বিবরণী',
  notifications: 'সতর্কবার্তা ও নোটিফিকেশন',
  profile: 'গ্রাহক প্রোফাইল',
  settings: 'সিস্টেম সেটিংস ও পছন্দসমূহ',
  users: 'গ্রাহক ও ইউজার তালিকা',
  meter_management: 'মিটার ফ্লিট পরিচালনা',
  audit_logs: 'অডিট ও টেলিমেট্রি লগ',
  admin_management: 'অ্যাডমিন পরিচালনা',
  email_config: 'ইমেইল গেটওয়ে কনফিগারেশন',
  system_settings: 'গ্লোবাল সিস্টেম প্যারামিটার',
};

const getDynamicSectionTitle = (section: DashboardSection, userRole?: string, isBn?: boolean): string => {
  if (isBn) {
    if (section === 'dashboard') {
      if (userRole === 'super_admin') return 'সুপার অ্যাডমিন গ্রিড গভর্ন্যান্স';
      if (userRole === 'admin') return 'অপারেশনস কমান্ড সেন্টার';
      return 'স্মার্ট ব্যালেন্স ওভারভিউ';
    }
    return sectionTitlesBn[section] || 'ড্যাশবোর্ড';
  }
  if (section === 'dashboard') {
    if (userRole === 'super_admin') return 'Super Admin Grid Governance';
    if (userRole === 'admin') return 'Operations Command Center';
    return 'Smart Balance Overview';
  }
  return sectionTitlesEn[section] || 'Dashboard';
};

export const Dashboard: React.FC = () => {
  const { role } = useAuth();
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const [currentSection, setCurrentSection] = useState<DashboardSection>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAddMeterOpen, setIsAddMeterOpen] = useState(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  // Render current active section component
  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        if (role === 'super_admin') {
          return <SuperAdminDashboardSection onNavigateSection={setCurrentSection} />;
        }
        if (role === 'admin') {
          return <AdminDashboardSection onNavigateSection={setCurrentSection} />;
        }
        return (
          <DashboardSectionComponent
            onOpenAddMeter={() => setIsAddMeterOpen(true)}
            onOpenRecharge={() => setIsRechargeOpen(true)}
            onNavigateSection={setCurrentSection}
          />
        );
      case 'meters':
        return (
          <MeterSection
            onOpenAddMeter={() => setIsAddMeterOpen(true)}
            onOpenRecharge={() => setIsRechargeOpen(true)}
          />
        );
      case 'analytics':
        return <AnalyticsSection />;
      case 'reports':
        return <ReportsSection />;
      case 'notifications':
        return <NotificationSection />;
      case 'profile':
        return <ProfileSection />;
      case 'settings':
        return <SettingsSection />;
      case 'users':
        return <UsersSection />;
      case 'meter_management':
        return <MeterManageSection />;
      case 'audit_logs':
        return <AuditSection />;
      case 'admin_management':
        return <AdminSection />;
      case 'email_config':
        return <EmailConfigSection />;
      case 'system_settings':
        return <SystemSection />;
      default:
        if (role === 'super_admin') {
          return <SuperAdminDashboardSection onNavigateSection={setCurrentSection} />;
        }
        if (role === 'admin') {
          return <AdminDashboardSection onNavigateSection={setCurrentSection} />;
        }
        return (
          <DashboardSectionComponent
            onOpenAddMeter={() => setIsAddMeterOpen(true)}
            onOpenRecharge={() => setIsRechargeOpen(true)}
            onNavigateSection={setCurrentSection}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased overflow-x-hidden">
      {/* Sidebar (Desktop and mobile drawer) */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Sticky Header */}
        <Header
          currentSectionTitle={getDynamicSectionTitle(currentSection, role, isBn)}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onOpenAddMeter={() => setIsAddMeterOpen(true)}
          onOpenRecharge={() => setIsRechargeOpen(true)}
          onSelectSection={setCurrentSection}
        />

        {/* Dynamic Section Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {renderCurrentSection()}
        </main>

        {/* Sticky/Bottom Footer */}
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
      />

      {/* Global Modals */}
      <AddMeterModal
        isOpen={isAddMeterOpen}
        onClose={() => setIsAddMeterOpen(false)}
      />
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
      />
    </div>
  );
};
