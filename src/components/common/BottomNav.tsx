import React from 'react';
import { LayoutDashboard, Package, Wrench, Hammer, LogOut } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenQuickBuy?: () => void;
  onOpenQuickSell?: () => void;
  onLogout?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onLogout
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, action: () => onSelectTab('dashboard') },
    { id: 'inventory', label: 'Stock', icon: Package, action: () => onSelectTab('inventory') },
    { id: 'spareparts', label: 'Parts', icon: Wrench, action: () => onSelectTab('spareparts') },
    { id: 'repair', label: 'Repair', icon: Hammer, action: () => onSelectTab('repair') },
    { id: 'logout', label: 'Logout', icon: LogOut, isLogout: true, action: () => onLogout && onLogout() },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 px-3 py-2 no-print shadow-lg">
      <div className="flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isLogout) {
            return (
              <button
                key={tab.id}
                onClick={tab.action}
                className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-[11px] font-bold text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span>{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={tab.action}
              className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-[11px] transition-all ${
                isActive
                  ? 'text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-50 dark:bg-cyan-950/40 scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
