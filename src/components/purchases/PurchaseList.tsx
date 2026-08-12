import React, { useState } from 'react';
import { ShoppingBag, PlusCircle, Search, Printer, Eye, Calendar, DollarSign } from 'lucide-react';
import type { PurchaseRecord } from '../../types';

interface PurchaseListProps {
  purchases: PurchaseRecord[];
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  onOpenAddPurchase?: () => void;
  onOpenNewPurchase?: () => void;
  onOpenBulkPurchase?: () => void;
  onSelectPurchase?: (p: PurchaseRecord) => void;
  onSelectStock?: (stockId: string) => void;
  onPrintReceipt?: (purchase: PurchaseRecord) => void;
}

export const PurchaseList: React.FC<PurchaseListProps> = ({
  purchases,
  onOpenAddPurchase,
  onOpenNewPurchase,
  onOpenBulkPurchase,
  onSelectPurchase,
  onSelectStock,
  onPrintReceipt
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPurchases = purchases.filter((p) => {
    const query = searchTerm.toLowerCase();
    return (
      p.stockId.toLowerCase().includes(query) ||
      p.sellerName.toLowerCase().includes(query) ||
      p.sellerPhone.toLowerCase().includes(query) ||
      p.machineBrand.toLowerCase().includes(query) ||
      p.machineModel.toLowerCase().includes(query)
    );
  });

  const totalSpent = purchases.reduce((sum, p) => sum + p.purchasePrice, 0);

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Machine Purchase Records ({purchases.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            History of all second-hand washing machines bought individually or in bulk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenBulkPurchase && (
            <button
              onClick={onOpenBulkPurchase}
              className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors border border-teal-700"
            >
              <PlusCircle className="w-4 h-4" />
              + Bulk Purchase Lot Entry
            </button>
          )}
          <button
            onClick={onOpenAddPurchase || onOpenNewPurchase}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            + Buy Machine (Single)
          </button>
        </div>
      </div>

      {/* Financial Spend Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card-panel p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Purchased Stock</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{purchases.length} machines</span>
          </div>
          <ShoppingBag className="w-6 h-6 text-blue-500 opacity-80" />
        </div>

        <div className="card-panel p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Purchase Expenditure</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">₹{totalSpent.toLocaleString('en-IN')}</span>
          </div>
          <DollarSign className="w-6 h-6 text-teal-500 opacity-80" />
        </div>

        <div className="card-panel p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Average Purchase Price</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              ₹{purchases.length > 0 ? Math.round(totalSpent / purchases.length).toLocaleString('en-IN') : 0}
            </span>
          </div>
          <Calendar className="w-6 h-6 text-emerald-500 opacity-80" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="card-panel p-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search seller name, phone, Stock ID, brand..."
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Desktop Data Table */}
      <div className="hidden md:block card-panel overflow-hidden">
        {filteredPurchases.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No purchase records found matching your query.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Stock ID</th>
                <th>Purchase Date</th>
                <th>Seller Name & Contact</th>
                <th>Machine Brand & Model</th>
                <th>Condition</th>
                <th>Payment Method</th>
                <th>Purchase Price (₹)</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td>
                    <button
                      onClick={() => {
                        if (onSelectStock) onSelectStock(p.stockId);
                        else if (onSelectPurchase) onSelectPurchase(p);
                      }}
                      className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      {p.stockId}
                    </button>
                  </td>
                  <td className="font-mono text-xs text-slate-600 dark:text-slate-300">{p.purchaseDate}</td>
                  <td>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{p.sellerName}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{p.sellerPhone}</span>
                  </td>
                  <td>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{p.machineBrand} {p.machineModel}</p>
                    <span className="text-[10px] text-slate-400">{p.capacityKg} KG • {p.type}</span>
                  </td>
                  <td className="text-xs text-slate-700 dark:text-slate-300">{p.condition}</td>
                  <td>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-semibold">
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="font-bold text-xs text-slate-900 dark:text-white">
                    ₹{p.purchasePrice.toLocaleString('en-IN')}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          if (onSelectPurchase) onSelectPurchase(p);
                          else if (onSelectStock) onSelectStock(p.stockId);
                        }}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                        title="View Stock Item"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (onPrintReceipt) onPrintReceipt(p);
                          else if (onSelectPurchase) onSelectPurchase(p);
                        }}
                        className="p-1.5 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg"
                        title="Print Purchase Voucher / Receipt"
                      >
                        <Printer className="w-4 h-4" />
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
        {filteredPurchases.map((p) => (
          <div key={p.id} className="card-panel p-3.5 space-y-2 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">{p.stockId}</span>
              <span className="text-[11px] text-slate-400 font-mono">{p.purchaseDate}</span>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">{p.machineBrand} {p.machineModel}</h4>
              <p className="text-[11px] text-slate-500">Seller: {p.sellerName} ({p.sellerPhone})</p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-white">₹{p.purchasePrice.toLocaleString('en-IN')}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (onSelectStock) onSelectStock(p.stockId);
                    else if (onSelectPurchase) onSelectPurchase(p);
                  }}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>
                <button
                  onClick={() => {
                    if (onPrintReceipt) onPrintReceipt(p);
                    else if (onSelectPurchase) onSelectPurchase(p);
                  }}
                  className="p-1 bg-teal-50 text-teal-600 rounded-lg"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
