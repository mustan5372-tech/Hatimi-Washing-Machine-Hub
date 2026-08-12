import React, { useState } from 'react';
import { Receipt, PlusCircle, Search, Eye, DollarSign, TrendingUp } from 'lucide-react';
import type { SaleRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface SalesListProps {
  sales: SaleRecord[];
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  onOpenAddSale?: () => void;
  onOpenNewSale?: () => void;
  onSelectSale: (s: SaleRecord) => void;
  onRecordPayment?: (sale: SaleRecord) => void;
}

export const SalesList: React.FC<SalesListProps> = ({
  sales,
  onOpenAddSale,
  onOpenNewSale,
  onSelectSale,
  onRecordPayment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredSales = sales.filter((s) => {
    const query = searchTerm.toLowerCase();
    const matchesQuery =
      s.invoiceNumber.toLowerCase().includes(query) ||
      s.customerName.toLowerCase().includes(query) ||
      s.customerPhone.toLowerCase().includes(query) ||
      s.stockId.toLowerCase().includes(query) ||
      s.machineBrand.toLowerCase().includes(query) ||
      s.machineModel.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || s.paymentStatus === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const totalRevenue = sales.reduce((sum, s) => sum + s.finalAmount, 0);
  const totalProfit = sales.reduce((sum, s) => sum + s.calculatedProfit, 0);
  const totalPending = sales.reduce((sum, s) => sum + s.balanceDue, 0);

  return (
    <div className="space-y-4">
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Sales & Billing Management ({sales.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track customer invoices, payment statuses, and profit margins.
          </p>
        </div>

        <button
          onClick={onOpenAddSale || onOpenNewSale}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          + Sell Machine (New Invoice)
        </button>
      </div>

      {/* Financial Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card-panel p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Billed Revenue</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">₹{totalRevenue.toLocaleString('en-IN')}</span>
          </div>
          <Receipt className="w-6 h-6 text-blue-500 opacity-80" />
        </div>

        <div className="card-panel p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Realized Net Profit</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{totalProfit.toLocaleString('en-IN')}</span>
          </div>
          <TrendingUp className="w-6 h-6 text-emerald-500 opacity-80" />
        </div>

        <div className="card-panel p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Outstanding Customer Balance</span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">₹{totalPending.toLocaleString('en-IN')}</span>
          </div>
          <DollarSign className="w-6 h-6 text-amber-500 opacity-80" />
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card-panel p-3 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Invoice #, Customer Name, Phone, Stock ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs">
          <span className="text-slate-400 font-medium text-[11px]">Payment Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Desktop Data Table */}
      <div className="hidden md:block card-panel overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No sales records match your filters.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Stock ID & Machine</th>
                <th>Customer Name & Phone</th>
                <th>Sold By</th>
                <th>Billed Amount</th>
                <th>Balance Due</th>
                <th>Calculated Profit</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td>
                    <button
                      onClick={() => onSelectSale(s)}
                      className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      {s.invoiceNumber}
                    </button>
                  </td>
                  <td className="font-mono text-xs text-slate-600 dark:text-slate-300">{s.saleDate}</td>
                  <td>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{s.machineBrand} {s.machineModel}</p>
                    <span className="text-[10px] text-slate-400 font-mono">Stock: {s.stockId}</span>
                  </td>
                  <td>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{s.customerName}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{s.customerPhone}</span>
                  </td>
                  <td>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{s.soldBy || 'Hatimi Admin'}</p>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold capitalize">{s.soldByRole || 'admin'}</span>
                  </td>
                  <td className="font-bold text-xs text-slate-900 dark:text-white">
                    ₹{s.finalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="font-bold text-xs">
                    <span className={s.balanceDue > 0 ? 'text-amber-600 dark:text-amber-400 font-mono' : 'text-slate-400'}>
                      ₹{s.balanceDue.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      ₹{s.calculatedProfit.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] text-slate-400">{s.profitMarginPct}% margin</span>
                  </td>
                  <td>
                    <StatusBadge status={s.paymentStatus} size="sm" />
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {s.balanceDue > 0 && (
                        <button
                          onClick={() => onRecordPayment && onRecordPayment(s)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                          title="Record Balance Payment"
                        >
                          <DollarSign className="w-3.5 h-3.5" /> Pay
                        </button>
                      )}
                      <button
                        onClick={() => onSelectSale(s)}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                        title="View Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filteredSales.map((s) => (
          <div key={s.id} className="card-panel p-3.5 space-y-2 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">{s.invoiceNumber}</span>
              <StatusBadge status={s.paymentStatus} size="sm" />
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">{s.customerName} ({s.customerPhone})</h4>
              <p className="text-[11px] text-slate-500">{s.machineBrand} {s.machineModel} • Stock: {s.stockId}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Total</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{s.finalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Balance</span>
                <span className="font-bold text-amber-600">₹{s.balanceDue.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Profit</span>
                <span className="font-bold text-emerald-600">₹{s.calculatedProfit.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              {s.balanceDue > 0 && (
                <button
                  onClick={() => onRecordPayment && onRecordPayment(s)}
                  className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg"
                >
                  Record Payment
                </button>
              )}
              <button
                onClick={() => onSelectSale(s)}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-lg flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> Invoice
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
