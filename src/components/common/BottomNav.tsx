import React from 'react';
import { LayoutDashboard, Package, PlusCircle, Receipt, BarChart3, Settings } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenQuickBuy: () => void;
  onOpenQuickSell: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickBuy,
  onOpenQuickSell
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => onSelectTab('dashboard') },
    { id: 'inventory', label: 'Stock', icon: Package, action: () => onSelectTab('inventory') },
    { id: 'buy', label: 'Buy', icon: PlusCircle, isAction: true, action: onOpenQuickBuy },
    { id: 'sell', label: 'Sell', icon: Receipt, isAction: true, action: onOpenQuickSell },
    { id: 'reports', label: 'Reports', icon: BarChart3, action: () => onSelectTab('reports') },
    { id: 'settings', label: 'Settings', icon: Settings, action: () => onSelectTab('settings') },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 px-2 py-1.5 no-print">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={tab.action}
                className={`flex flex-col items-center justify-center p-1 rounded-lg text-[10px] font-bold ${
                  tab.id === 'buy' ? 'text-teal-600 dark:text-teal-400' : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                <div className={`p-1 rounded-full ${tab.id === 'buy' ? 'bg-teal-100 dark:bg-teal-950/60' : 'bg-blue-100 dark:bg-blue-950/60'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={tab.action}
              className={`flex flex-col items-center justify-center p-1 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-teal-600 dark:text-teal-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
