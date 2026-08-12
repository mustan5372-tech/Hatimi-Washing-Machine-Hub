import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, QrCode, PlusCircle, ShoppingBag, Shield } from 'lucide-react';
import { Logo } from './Logo';
import type { UserProfile, AppNotification } from '../../types';

interface HeaderProps {
  currentUser: UserProfile;
  allUsers?: UserProfile[];
  onSwitchUser?: (user: UserProfile) => void;
  notifications?: AppNotification[];
  searchTerm?: string;
  onSearchChange?: (query: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenQuickBuy?: () => void;
  onOpenQuickSell?: () => void;
  onOpenQRScanner?: () => void;
  onSelectTab?: (tab: string) => void;
  onMarkNotificationRead?: (id: string) => void;
  onSwitchRole?: (role: 'admin' | 'staff') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers = [currentUser],
  onSwitchUser,
  notifications = [],
  searchTerm = '',
  onSearchChange,
  isDarkMode,
  onToggleDarkMode,
  theme,
  onToggleTheme,
  onOpenQuickBuy: _onOpenQuickBuy,
  onOpenQuickSell: _onOpenQuickSell,
  onOpenQRScanner,
  onSelectTab: _onSelectTab,
  onSwitchRole: _onSwitchRole
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 no-print">
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        {/* Mobile Logo / Header */}
        <div className="md:hidden flex items-center gap-2">
          <Logo variant={isDarkMode ? 'light' : 'dark'} size="sm" showSubtitle={false} />
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-lg relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search Customer Name, Phone, Stock ID (WM-0001), Brand, Invoice..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg text-xs md:text-sm border border-transparent focus:border-teal-500 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Action Mobile Buttons */}
          <div className="md:hidden flex items-center gap-1.5">
            <button
              onClick={_onOpenQuickBuy}
              className="p-1.5 bg-teal-600 text-white rounded-md text-xs font-medium flex items-center gap-1"
              title="Buy Machine"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Buy</span>
            </button>
            <button
              onClick={_onOpenQuickSell}
              className="p-1.5 bg-blue-600 text-white rounded-md text-xs font-medium flex items-center gap-1"
              title="Sell Machine"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Sell</span>
            </button>
            <button
              onClick={onOpenQRScanner}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md"
              title="Scan QR"
            >
              <QrCode className="w-4 h-4 text-teal-500" />
            </button>
          </div>

          {/* Theme Toggle (Desktop & Mobile) */}
          <button
            onClick={onToggleTheme || onToggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            title={`Switch to ${theme === 'dark' || isDarkMode ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' || isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <span className="hidden lg:inline text-xs font-semibold text-amber-400">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="hidden lg:inline text-xs font-semibold text-slate-700">Dark</span>
              </>
            )}
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Notifications & Alerts
                  </h4>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-semibold">
                    {notifications.length} Active
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No pending alerts or notifications.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                          <span className="text-[10px] text-slate-400">{n.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-normal">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Account Switcher Dropdown */}
          <div className="relative border-l border-slate-200 dark:border-slate-800 pl-2">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors"
              title="Switch Account / Profile"
            >
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{currentUser.name}</p>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold uppercase flex items-center justify-end gap-0.5 mt-0.5">
                  <Shield className="w-3 h-3" />
                  {currentUser.role}
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fade-in">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Active Account</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                  <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">{currentUser.email}</p>
                </div>
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 mt-1">
                  Switch Active Account
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      if (onSwitchUser) onSwitchUser(u);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                      u.id === currentUser.id ? 'font-bold text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-900/20' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div>
                      <p className="leading-tight">{u.name}</p>
                      <span className="text-[10px] text-slate-400 capitalize">{u.role}</span>
                    </div>
                    {u.id === currentUser.id && <span className="text-xs">✓</span>}
                  </button>
                ))}
                <div className="px-3 pt-2 mt-1 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 italic">🔥 Ready for Firebase Auth Sync</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
