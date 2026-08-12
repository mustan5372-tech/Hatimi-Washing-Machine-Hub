import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Receipt,
  PieChart
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import type { SaleRecord, PurchaseRecord, InventoryMachine, MachineExpense } from '../../types';
import { getSettings } from '../../services/store';

interface ReportsOverviewProps {
  sales: SaleRecord[];
  purchases: PurchaseRecord[];
  inventory: InventoryMachine[];
  expenses: MachineExpense[];
}

const BRAND_COLORS = ['#0d9488', '#0284c7', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#6366f1', '#64748b'];

export const ReportsOverview: React.FC<ReportsOverviewProps> = ({
  sales,
  purchases,
  inventory,
  expenses
}) => {
  const [dateFilter, setDateFilter] = useState<'this_month' | 'this_week' | 'today' | 'all_time'>('this_month');
  const settings = getSettings();

  // Filter Data based on selected date range
  const filteredSales = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    if (dateFilter === 'today') {
      return sales.filter(s => s.saleDate === today);
    }
    if (dateFilter === 'this_week') {
      const now = new Date();
      const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
      return sales.filter(s => s.saleDate >= weekAgo);
    }
    if (dateFilter === 'this_month') {
      const monthPrefix = today.slice(0, 7);
      return sales.filter(s => s.saleDate.startsWith(monthPrefix));
    }
    return sales;
  }, [sales, dateFilter]);

  const filteredPurchases = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    if (dateFilter === 'today') {
      return purchases.filter(p => p.purchaseDate === today);
    }
    if (dateFilter === 'this_week') {
      const now = new Date();
      const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
      return purchases.filter(p => p.purchaseDate >= weekAgo);
    }
    if (dateFilter === 'this_month') {
      const monthPrefix = today.slice(0, 7);
      return purchases.filter(p => p.purchaseDate.startsWith(monthPrefix));
    }
    return purchases;
  }, [purchases, dateFilter]);

  const filteredExpenses = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    if (dateFilter === 'today') {
      return expenses.filter(e => e.date === today);
    }
    if (dateFilter === 'this_week') {
      const now = new Date();
      const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
      return expenses.filter(e => e.date >= weekAgo);
    }
    if (dateFilter === 'this_month') {
      const monthPrefix = today.slice(0, 7);
      return expenses.filter(e => e.date.startsWith(monthPrefix));
    }
    return expenses;
  }, [expenses, dateFilter]);

  // Aggregate Metrics
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.finalAmount, 0);
  const totalPurchaseCost = filteredPurchases.reduce((sum, p) => sum + p.purchasePrice, 0);
  const totalRepairExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalNetProfit = filteredSales.reduce((sum, s) => sum + s.calculatedProfit, 0);
  const overallMargin = totalRevenue > 0 ? ((totalNetProfit / totalRevenue) * 100).toFixed(1) : '0';
  const totalOutstanding = filteredSales.reduce((sum, s) => sum + s.balanceDue, 0);

  // Sales by Brand
  const salesByBrand = useMemo(() => {
    const map: Record<string, { brand: string; sales: number; count: number }> = {};
    filteredSales.forEach(s => {
      if (!map[s.machineBrand]) {
        map[s.machineBrand] = { brand: s.machineBrand, sales: 0, count: 0 };
      }
      map[s.machineBrand].sales += s.finalAmount;
      map[s.machineBrand].count += 1;
    });
    return Object.values(map);
  }, [filteredSales]);

  // Stock Distribution by Type
  const stockByType = useMemo(() => {
    const map: Record<string, number> = {};
    inventory.forEach(m => {
      map[m.type] = (map[m.type] || 0) + 1;
    });
    return Object.keys(map).map(type => ({ name: type, value: map[type] }));
  }, [inventory]);

  const handleExportCSV = () => {
    const headers = ['Invoice Number,Date,Customer Name,Machine Brand,Machine Model,Stock ID,Selling Price,Discount,Final Amount,Paid Amount,Balance Due,Status\n'];
    const rows = filteredSales.map(s => 
      `"${s.invoiceNumber}","${s.saleDate}","${s.customerName}","${s.machineBrand}","${s.machineModel}","${s.stockId}",${s.sellingPrice},${s.discount},${s.finalAmount},${s.amountPaid},${s.balanceDue},"${s.paymentStatus}"`
    );
    const blob = new Blob([headers.join('') + rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hatimi_Sales_Report_${dateFilter}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Financial Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Profitability breakdown, cash flow reports, brand revenue, and inventory analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap no-print">
          {/* Time Filter Select */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <select
              value={dateFilter}
              onChange={(e: any) => setDateFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="today">Today</option>
              <option value="this_week">This Week (Last 7 Days)</option>
              <option value="this_month">This Month</option>
              <option value="all_time">All Time Historical</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> Print Summary
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block mb-4 pb-4 border-b-2 border-slate-900">
        <h1 className="text-xl font-black text-slate-900 uppercase">{settings.shopName}</h1>
        <p className="text-xs text-slate-600">Financial Performance & Profitability Summary • Period: {dateFilter.replace('_', ' ').toUpperCase()}</p>
        <p className="text-[10px] text-slate-400">Generated on: {new Date().toLocaleString('en-IN')}</p>
      </div>

      {/* Key Financial Indicator Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card-panel p-3.5 border-l-4 border-l-blue-600">
          <span className="text-[11px] font-semibold text-slate-400 block">Total Billed Revenue</span>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-1">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-400">{filteredSales.length} Invoices</span>
        </div>

        <div className="card-panel p-3.5 border-l-4 border-l-teal-600">
          <span className="text-[11px] font-semibold text-slate-400 block">Acquisition Costs</span>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-1">₹{totalPurchaseCost.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-400">{filteredPurchases.length} Machines</span>
        </div>

        <div className="card-panel p-3.5 border-l-4 border-l-rose-500">
          <span className="text-[11px] font-semibold text-slate-400 block">Repair Expenses</span>
          <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-1">₹{totalRepairExpenses.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-400">{filteredExpenses.length} Expense Logs</span>
        </div>

        <div className="card-panel p-3.5 border-l-4 border-l-emerald-500">
          <span className="text-[11px] font-semibold text-slate-400 block">Net Realized Profit</span>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">₹{totalNetProfit.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-emerald-600 font-bold">{overallMargin}% Profit Margin</span>
        </div>

        <div className="card-panel p-3.5 border-l-4 border-l-amber-500">
          <span className="text-[11px] font-semibold text-slate-400 block">Outstanding Balance</span>
          <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1">₹{totalOutstanding.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-400">Customer Dues</span>
        </div>

        <div className="card-panel p-3.5 border-l-4 border-l-purple-600">
          <span className="text-[11px] font-semibold text-slate-400 block">Current Stock Units</span>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-1">{inventory.length} Units</div>
          <span className="text-[10px] text-slate-400">In Shop & Warehouse</span>
        </div>
      </div>

      {/* Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Revenue by Brand */}
        <div className="card-panel p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-blue-500" />
              Sales Revenue by Machine Brand (₹)
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByBrand} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="brand" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="sales" name="Billed Revenue" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Composition by Washer Type */}
        <div className="card-panel p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-teal-500" />
              Inventory Composition by Washer Type
            </h3>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={stockByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockByType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend formatter={(value) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{value}</span>} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filtered Invoices Table */}
      <div className="card-panel overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Filtered Invoice Records ({filteredSales.length})
          </h3>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Machine Stock ID</th>
              <th>Billed Amount</th>
              <th>Paid</th>
              <th>Profit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((s) => (
              <tr key={s.id}>
                <td className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">{s.invoiceNumber}</td>
                <td className="font-mono text-xs">{s.saleDate}</td>
                <td className="font-bold text-xs text-slate-900 dark:text-white">{s.customerName}</td>
                <td className="font-mono text-xs">{s.stockId}</td>
                <td className="font-bold text-xs text-slate-900 dark:text-white">₹{s.finalAmount.toLocaleString('en-IN')}</td>
                <td className="text-xs text-emerald-600 font-semibold">₹{s.amountPaid.toLocaleString('en-IN')}</td>
                <td className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">₹{s.calculatedProfit.toLocaleString('en-IN')}</td>
                <td className="text-xs font-semibold">{s.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
