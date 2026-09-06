import React from 'react';
import {
  LayoutDashboard,
  Gauge,
  LineChart,
  FileSpreadsheet,
  Bell,
  User,
  Settings,
  Users,
  ShieldCheck,
  Mail,
  ClipboardList,
  Sliders,
  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { DashboardSection, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useMeters } from '../../context/MeterContext';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  currentSection: DashboardSection;
  onSelectSection: (section: DashboardSection) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  isCollapsed,
  onToggleCollapse,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, role, logout } = useAuth();
  const { unreadCount } = useMeters();
  const { isBn, t } = useLanguage();

  const handleNavClick = (section: DashboardSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  // Nav categories with dynamic localization
  const mainNavItems: { id: DashboardSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label:
        role === 'super_admin'
          ? t('sidebar.executive_control', 'Executive Control')
          : role === 'admin'
          ? t('sidebar.operations_center', 'Operations Center')
          : t('sidebar.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'meters',
      label:
        role === 'admin' || role === 'super_admin'
          ? t('sidebar.fleet_overview', 'Fleet Overview')
          : t('sidebar.my_meters', 'My Meters'),
      icon: <Gauge className="w-5 h-5" />,
    },
    { id: 'analytics', label: t('sidebar.analytics', 'Analytics'), icon: <LineChart className="w-5 h-5" /> },
    { id: 'reports', label: t('sidebar.reports', 'Reports'), icon: <FileSpreadsheet className="w-5 h-5" /> },
    {
      id: 'notifications',
      label: t('sidebar.notifications', 'Notifications'),
      icon: <Bell className="w-5 h-5" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  const adminNavItems: { id: DashboardSection; label: string; icon: React.ReactNode; roles: UserRole[] }[] = [
    { id: 'users', label: t('sidebar.users_directory', 'Users Directory'), icon: <Users className="w-5 h-5" />, roles: ['admin', 'super_admin'] },
    { id: 'meter_management', label: t('sidebar.meter_management', 'Meter Management'), icon: <Sliders className="w-5 h-5" />, roles: ['admin', 'super_admin'] },
    { id: 'audit_logs', label: t('sidebar.audit_logs', 'Audit Logs'), icon: <ClipboardList className="w-5 h-5" />, roles: ['admin', 'super_admin'] },
  ];

  const superAdminNavItems: { id: DashboardSection; label: string; icon: React.ReactNode; roles: UserRole[] }[] = [
    { id: 'admin_management', label: t('sidebar.admin_management', 'Admin Management'), icon: <ShieldCheck className="w-5 h-5" />, roles: ['super_admin'] },
    { id: 'email_config', label: t('sidebar.email_config', 'Email Configuration'), icon: <Mail className="w-5 h-5" />, roles: ['super_admin'] },
    { id: 'system_settings', label: t('sidebar.system_settings', 'System Settings'), icon: <ShieldAlert className="w-5 h-5" />, roles: ['super_admin'] },
  ];

  const accountNavItems: { id: DashboardSection; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: t('sidebar.profile', 'Profile'), icon: <User className="w-5 h-5" /> },
    { id: 'settings', label: t('sidebar.settings', 'Settings'), icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header Branding */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  DESCO <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">Smart</span>
                </span>
                <p className="text-[10px] text-slate-400 font-medium truncate">Prepaid Balance Monitor</p>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Navigation */}
          <div>
            {!isCollapsed && (
              <span className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                {role === 'super_admin'
                  ? t('sidebar.executive_governance', 'Executive Governance')
                  : role === 'admin'
                  ? t('sidebar.grid_operations', 'Grid Operations')
                  : t('sidebar.citizen_monitor', 'Citizen Monitor')}
              </span>
            )}
            <div className="mt-2 space-y-1">
              {mainNavItems.map((item) => {
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                    {!isCollapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Tools */}
          {(role === 'admin' || role === 'super_admin') && (
            <div>
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  {t('sidebar.administration', 'Administration')}
                </span>
              )}
              <div className="mt-2 space-y-1">
                {adminNavItems.map((item) => {
                  const isActive = currentSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      } ${isCollapsed ? 'justify-center px-2' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Super Admin Section */}
          {role === 'super_admin' && (
            <div>
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase">
                  {t('sidebar.super_admin', 'Super Admin')}
                </span>
              )}
              <div className="mt-2 space-y-1">
                {superAdminNavItems.map((item) => {
                  const isActive = currentSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      } ${isCollapsed ? 'justify-center px-2' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Account & Settings */}
          <div>
            {!isCollapsed && (
              <span className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                {t('sidebar.account', 'Account')}
              </span>
            )}
            <div className="mt-2 space-y-1">
              {accountNavItems.map((item) => {
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          {!isCollapsed ? (
            <>
              <button
                type="button"
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2.5 min-w-0 flex-1 text-left p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={isBn ? 'প্রোফাইল দেখুন' : 'View Profile'}
              >
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                  }}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {user?.name || 'DESCO User'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate capitalize">
                    {role?.replace('_', ' ') || 'Customer'}
                  </p>
                </div>
              </button>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={logout}
              title="Logout"
              className="w-full flex justify-center p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
