import React from 'react';
import { LayoutDashboard, Gauge, LineChart, Bell, User } from 'lucide-react';
import { DashboardSection } from '../../types';
import { useMeters } from '../../context/MeterContext';
import { useLanguage } from '../../context/LanguageContext';

interface MobileNavProps {
  currentSection: DashboardSection;
  onSelectSection: (section: DashboardSection) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentSection, onSelectSection }) => {
  const { unreadCount } = useMeters();
  const { language, t } = useLanguage();

  const isBn = language === 'bn';

  const navItems: { id: DashboardSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'meters', label: isBn ? 'মিটার' : 'Meters', icon: <Gauge className="w-5 h-5" /> },
    { id: 'analytics', label: isBn ? 'অ্যানালিটিক্স' : 'Analytics', icon: <LineChart className="w-5 h-5" /> },
    {
      id: 'notifications',
      label: isBn ? 'অ্যালার্ট' : 'Alerts',
      icon: <Bell className="w-5 h-5" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { id: 'profile', label: isBn ? 'প্রোফাইল' : 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 lg:hidden px-3 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors relative cursor-pointer ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
