import React from 'react';
import {
  Package,
  ShoppingBag,
  Receipt,
  TrendingUp,
  Clock,
  PlusCircle,
  QrCode,
  DollarSign,
  ArrowUpRight,
  Wrench,
  CheckCircle2,
  Hammer,
  Users,
  BarChart3,
  Settings,
  ShoppingCart,
  Zap,
  Lock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import type { UserProfile, DashboardStats, InventoryMachine, SaleRecord, PurchaseRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useLanguage } from '../../utils/i18n';
import { getRepairRecords } from '../../services/store';

interface DashboardOverviewProps {
  currentUser?: UserProfile;
  stats: DashboardStats;
  inventory: InventoryMachine[];
  sales: SaleRecord[];
  purchases: PurchaseRecord[];
  onOpenAddMachine?: () => void;
  onOpenAddPurchase?: () => void;
  onOpenAddSale?: () => void;
  onNavigate?: (tab: string) => void;
  onOpenQRModal?: (m: InventoryMachine) => void;
  onOpenQuickBuy?: () => void;
  onOpenQuickSell?: () => void;
  onOpenQRScanner?: () => void;
  onOpenExpenseModal?: (stockId?: string) => void;
  onSelectMachine?: (stockId: string) => void;
  onSelectSale?: (invoiceNumber: string) => void;
  onSelectTab?: (tab: string) => void;
  onRecordPayment?: (sale: SaleRecord) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentUser,
  stats,
  inventory,
  sales,
  purchases,
  onOpenAddMachine: _onOpenAddMachine,
  onOpenAddPurchase,
  onOpenAddSale,
  onNavigate,
  onOpenQuickBuy,
  onOpenQuickSell,
  onOpenQRScanner,
  onOpenExpenseModal,
  onSelectMachine,
  onSelectSale,
  onSelectTab,
  onRecordPayment
}) => {
  const { t } = useLanguage();
  const isStaff = currentUser?.role === 'staff';

  const handleNav = (tab: string) => {
    if (onNavigate) onNavigate(tab);
    else if (onSelectTab) onSelectTab(tab);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickAccessModules = [
    { id: 'inventory', label: t('inventory'), desc: 'Manage Stock & Prices', icon: Package, color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
    { id: 'spareparts', label: t('spareparts'), desc: 'Parts Intake & Pricing', icon: Wrench, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    { id: 'spareparts-checkout', label: t('parts_checkout'), desc: 'Counter Cart Billing', icon: ShoppingCart, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    { id: 'repair', label: t('repair'), desc: 'Repair Cost & Labour Bills', icon: Hammer, color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
    { id: 'purchases', label: t('purchases'), desc: 'Supplier Intake & Bulk', icon: ShoppingBag, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
    { id: 'sales', label: t('sales'), desc: 'Invoices & Customer Dues', icon: Receipt, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
    { id: 'customers', label: t('customers'), desc: 'Directory & Accounts', icon: Users, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
    ...(!isStaff ? [{ id: 'reports', label: t('reports'), desc: 'Financial Analytics & Profit', icon: BarChart3, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' }] : []),
    { id: 'settings', label: t('settings'), desc: 'Users & Shop Profile', icon: Settings, color: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20' },
  ];

  // Prepare chart data for last 7 days
  const last7DaysData = React.useMemo(() => {
    const repairs = getRepairRecords();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      const daySales = sales.filter((s) => s.saleDate === dateStr);
      const dayPurchases = purchases.filter((p) => p.purchaseDate === dateStr);
      const dayRepairs = repairs.filter((r: any) => r.repairDate === dateStr);

      const machineRevenue = daySales.reduce((sum, s) => sum + s.finalAmount, 0);
      const repairRevenue = dayRepairs.reduce((sum: number, r: any) => sum + r.totalAmount, 0);
      const revenue = machineRevenue + repairRevenue;

      const purchaseCost = dayPurchases.reduce((sum, p) => sum + p.purchasePrice, 0);

      const machineProfit = daySales.reduce((sum, s) => sum + s.calculatedProfit, 0);
      const profit = machineProfit + repairRevenue;

      days.push({
        dateLabel: dayLabel,
        revenue,
        purchaseCost,
        profit
      });
    }
    return days;
  }, [sales, purchases]);

  const machinesUnderRepair = inventory.filter((m) => m.status === 'Under Repair');
  const pendingSales = sales.filter((s) => s.balanceDue > 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {getGreeting()}, {currentUser?.name || 'Manager'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hatimi Washing Machine Hub Operations Overview
          </p>
        </div>

        {/* Quick Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenAddPurchase || onOpenQuickBuy}
            className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            {t('buy_machine')}
          </button>
          <button
            onClick={onOpenAddSale || onOpenQuickSell}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Receipt className="w-4 h-4" />
            {t('sell_machine')}
          </button>
          <button
            onClick={() => handleNav('repair')}
            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Hammer className="w-3.5 h-3.5" />
            {t('issue_repair_bill')}
          </button>
          <button
            onClick={onOpenQRScanner}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300 dark:border-slate-700"
          >
            <QrCode className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Scan QR
          </button>
        </div>
      </div>

      {/* Quick Access All Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t('quick_access')}
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            {t('quick_access_sub')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
          {quickAccessModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => handleNav(mod.id)}
                className={`p-3 rounded-xl border flex flex-col items-center text-center justify-center transition-all hover:scale-[1.03] hover:shadow-md cursor-pointer ${mod.color} bg-white dark:bg-slate-800`}
              >
                <div className="p-2 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 mb-1.5">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold leading-tight block line-clamp-1">{mod.label}</span>
                <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1 hidden md:block">{mod.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Key Metrics Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Today's Performance
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Stock Count */}
          <div className="card-panel p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Stock Count</span>
              <Package className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.todayStockCount} <span className="text-xs font-normal text-slate-400">units</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Available & Repair
            </div>
          </div>

          {/* Today Purchased */}
          <div className="card-panel p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Purchased Today</span>
              <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.todayPurchasedCount} <span className="text-xs font-normal text-slate-400">units</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Spent: ₹{stats.todayPurchaseExpenditure.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Today Sold */}
          <div className="card-panel p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sold Today</span>
              <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.todaySoldCount} <span className="text-xs font-normal text-slate-400">units</span>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {isStaff ? 'Daily Sales Units' : `Rev: ₹${stats.todayRevenue.toLocaleString('en-IN')}`}
            </div>
          </div>

          {/* Today Profit */}
          <div className="card-panel p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Today Profit</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {isStaff ? 'Restricted' : `₹${stats.todayProfit.toLocaleString('en-IN')}`}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              {isStaff ? 'Staff Account' : 'Net gross margin'}
            </div>
          </div>

          {/* Today Pending Payments */}
          <div className="card-panel p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Today</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              ₹{stats.todayPendingPayments.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Due on delivery
            </div>
          </div>

          {/* Inventory Valuation */}
          <div className="card-panel p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Stock Value</span>
              <DollarSign className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {isStaff ? 'Restricted' : `₹${stats.totalInventoryValue.toLocaleString('en-IN')}`}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              {isStaff ? 'Staff Account' : 'Total acquisition cost'}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Financial Breakdown */}
      <div className="card-panel p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            This Month Overview ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})
          </h2>
          {!isStaff && (
            <button
              onClick={() => onNavigate ? onNavigate('reports') : onSelectTab && onSelectTab('reports')}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5"
            >
              Detailed Reports <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Machines Sold</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.monthlySoldMachines}</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Monthly Revenue</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{isStaff ? 'Restricted' : `₹${stats.monthlyRevenue.toLocaleString('en-IN')}`}</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Purchases Cost</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{isStaff ? 'Restricted' : `₹${stats.monthlyPurchaseCost.toLocaleString('en-IN')}`}</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Repair Expenses</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{isStaff ? 'Restricted' : `₹${stats.monthlyRepairExpenses.toLocaleString('en-IN')}`}</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 col-span-2 md:col-span-1">
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block font-semibold">Gross Profit</span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{isStaff ? 'Restricted' : `₹${stats.monthlyGrossProfit.toLocaleString('en-IN')}`}</span>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      {isStaff ? (
        <div className="card-panel p-6 text-center bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue & Profit Analysis Turned Off</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Financial analytics charts, revenue totals, and profit margin breakdowns are disabled for Staff accounts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Profit Graph */}
        <div className="card-panel p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              7-Day Revenue & Profit Trend
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0284c7" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Purchase vs Sales Comparison Bar Chart */}
        <div className="card-panel p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              7-Day Buy vs Sell Cash Flow
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Comparison</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="purchaseCost" name="Purchases Spend" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" name="Sales Inflow" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      )}

      {/* Operational Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget 1: Machines Under Repair */}
        <div className="card-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Under Repair ({machinesUnderRepair.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate ? onNavigate('inventory') : onSelectTab && onSelectTab('inventory')}
              className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              View Inventory →
            </button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {machinesUnderRepair.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No washing machines currently under repair.</p>
            ) : (
              machinesUnderRepair.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMachine && onSelectMachine(m.stockId)}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">{m.stockId}</span>
                      <StatusBadge status={m.status} size="sm" />
                    </div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">{m.brand} {m.model}</p>
                  </div>
                  {onOpenExpenseModal && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenExpenseModal(m.stockId);
                      }}
                      className="px-2.5 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold rounded-lg transition-colors shrink-0"
                    >
                      + Expense
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 2: Pending Customer Payments */}
        <div className="card-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Pending Customer Payments ({pendingSales.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate ? onNavigate('sales') : onSelectTab && onSelectTab('sales')}
              className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              View Sales →
            </button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {pendingSales.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1 opacity-80" />
                All customer payments are 100% settled!
              </div>
            ) : (
              pendingSales.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelectSale && onSelectSale(s.invoiceNumber)}
                  className="p-2.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-center justify-between cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-950/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{s.invoiceNumber}</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{s.customerName}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{s.machineBrand} {s.machineModel}</p>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                        ₹{s.balanceDue.toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[10px] text-slate-400">Due</span>
                    </div>
                    {onRecordPayment && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRecordPayment(s);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm shrink-0"
                      >
                        Pay
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 3: Recent Transactions */}
        <div className="card-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Sales & Invoices
              </h3>
            </div>
            <button
              onClick={() => onNavigate ? onNavigate('sales') : onSelectTab && onSelectTab('sales')}
              className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              All Sales
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {sales.slice(0, 5).map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectSale && onSelectSale(s.invoiceNumber)}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/50 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{s.invoiceNumber}</span>
                    <StatusBadge status={s.paymentStatus} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{s.customerName} • {s.stockId}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    ₹{s.finalAmount.toLocaleString('en-IN')}
                  </span>
                  {!isStaff && (
                    <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Profit: ₹{s.calculatedProfit.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
