import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Receipt,
  Users,
  BarChart3,
  Settings,
  PlusCircle,
  QrCode,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  Wrench,
  Hammer
} from 'lucide-react';
import { Logo } from './Logo';
import type { UserProfile } from '../../types';

interface SidebarProps {
  currentTab?: string;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onTabChange?: (tab: string) => void;
  currentUser: UserProfile;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onToggleTheme?: () => void;
  onOpenQuickBuy?: () => void;
  onOpenQuickSell?: () => void;
  onOpenQRScanner?: () => void;
  onLogout?: () => void;
  stats?: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  activeTab,
  onSelectTab,
  onTabChange,
  currentUser,
  isDarkMode,
  onToggleDarkMode,
  onToggleTheme,
  onOpenQuickBuy,
  onOpenQuickSell,
  onOpenQRScanner,
  onLogout
}) => {
  const active = activeTab || currentTab || 'dashboard';
  const handleTab = onTabChange || onSelectTab || (() => {});
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory Stock', icon: Package },
    { id: 'spareparts', label: 'Spare Parts (Cart)', icon: Wrench },
    { id: 'repair', label: 'Repairing & Service', icon: Hammer },
    { id: 'purchases', label: 'Purchases (Buy)', icon: ShoppingBag },
    { id: 'sales', label: 'Sales & Billing', icon: Receipt },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Reports & Profit', icon: BarChart3 },
    { id: 'settings', label: 'Shop Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-slate-900 text-slate-100 flex-col h-screen sticky top-0 shrink-0 border-r border-slate-800 no-print">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <Logo variant="light" size="sm" showSubtitle={false} />
      </div>

      {/* Quick Action Shortcuts */}
      <div className="p-3 border-b border-slate-800 space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onOpenQuickBuy}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            + Buy
          </button>
          <button
            onClick={onOpenQuickSell}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Receipt className="w-3.5 h-3.5" />
            + Sell
          </button>
        </div>
        <button
          onClick={onOpenQRScanner}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors"
        >
          <QrCode className="w-3.5 h-3.5 text-teal-400" />
          Scan Stock QR
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom User Info & Controls */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-3">
        {/* User Card */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-md bg-teal-800 text-teal-200 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 uppercase font-medium">
                <ShieldCheck className="w-3 h-3 text-teal-400" />
                {currentUser.role}
              </span>
            </div>
          </div>

          <button
            onClick={onToggleDarkMode || onToggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Switch / Log Out
        </button>
      </div>
    </aside>
  );
};
