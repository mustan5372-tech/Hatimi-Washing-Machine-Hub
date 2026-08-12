import React from 'react';
import {
  X,
  Wrench,
  QrCode,
  User,
  ShoppingBag,
  Receipt,
  Edit,
  Trash2
} from 'lucide-react';
import type { InventoryMachine, UserProfile } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { getExpenses, getSales } from '../../services/store';

interface MachineDetailPageProps {
  machine: InventoryMachine | null;
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onEdit: (machine: InventoryMachine) => void;
  onDelete: (id: string) => void;
  onOpenQRModal: (machine: InventoryMachine) => void;
  onOpenExpenseModal: (stockId: string) => void;
  onOpenSellModal: (stockId: string) => void;
}

export const MachineDetailPage: React.FC<MachineDetailPageProps> = ({
  machine,
  isOpen,
  currentUser,
  onClose,
  onEdit,
  onDelete,
  onOpenQRModal,
  onOpenExpenseModal,
  onOpenSellModal
}) => {
  if (!isOpen || !machine) return null;

  const expenses = getExpenses().filter(e => e.stockId === machine.stockId);
  const sales = getSales();
  const saleRecord = sales.find(s => s.stockId === machine.stockId);

  const expectedProfit = machine.sellingPrice - machine.totalCost;
  const marginPct = machine.sellingPrice > 0 ? ((expectedProfit / machine.sellingPrice) * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in no-print-bg">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-950/60 rounded-xl text-teal-700 dark:text-teal-400 font-mono font-bold text-sm">
              {machine.stockId}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {machine.brand} {machine.model}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={machine.status} size="sm" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {machine.capacityKg} KG • {machine.type} • {machine.loadingType}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenQRModal(machine)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 text-xs font-semibold"
              title="View & Print Stock QR Code"
            >
              <QrCode className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">QR Sticker</span>
            </button>

            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => onEdit(machine)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                  title="Edit Machine"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(machine.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                  title="Delete Machine"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Specs & Photos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photos Carousel/Grid */}
            <div className="md:col-span-1 space-y-2">
              <div className="w-full h-48 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img
                  src={machine.photos?.[0] || 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80'}
                  alt={machine.model}
                  className="w-full h-full object-cover"
                />
              </div>

              {machine.photos && machine.photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {machine.photos.map((url, i) => (
                    <img key={i} src={url} alt="thumb" className="w-12 h-12 rounded-md object-cover border border-slate-200 shrink-0" />
                  ))}
                </div>
              )}

              <div className="text-center pt-2">
                {machine.status !== 'Sold' ? (
                  <button
                    onClick={() => onOpenSellModal(machine.stockId)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Receipt className="w-4 h-4" />
                    Sell This Machine Now
                  </button>
                ) : (
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-300">
                    Machine Sold & Billed
                  </div>
                )}
              </div>
            </div>

            {/* Specifications Summary Card */}
            <div className="md:col-span-2 space-y-4">
              <div className="card-panel p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Technical Specifications
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Brand</span>
                    <span className="font-bold text-slate-900 dark:text-white">{machine.brand}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Model</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{machine.model}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Serial Number</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{machine.serialNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Capacity</span>
                    <span className="font-bold text-slate-900 dark:text-white">{machine.capacityKg} KG</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Type</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{machine.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Loading Style</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{machine.loadingType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Condition</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{machine.condition}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Warranty Offered</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">{machine.warrantyDays || 30} Days</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date Purchased</span>
                    <span className="text-slate-700 dark:text-slate-300">{machine.purchaseDate}</span>
                  </div>
                </div>

                {machine.description && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white">Inspection Notes: </span>
                    {machine.description}
                  </div>
                )}
              </div>

              {/* Financial Costs & Profitability Box */}
              <div className="card-panel p-4 bg-teal-50/40 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                    Financial Cost & Profit Breakdown
                  </h3>
                  <span className="px-2 py-0.5 bg-teal-600 text-white rounded text-[11px] font-bold">
                    {marginPct}% Profit Margin
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Purchase Price</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{machine.purchasePrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Repairs & Transport</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      +₹{(machine.repairExpenses + machine.cleaningExpenses + machine.transportExpenses + machine.otherExpenses).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Total Acquisition Cost</span>
                    <span className="font-black text-slate-900 dark:text-white">₹{machine.totalCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Selling Price</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">₹{machine.sellingPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-teal-200 dark:border-teal-900/60 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">
                    {machine.status === 'Sold' ? 'Realized Net Profit:' : 'Expected Net Profit:'}
                  </span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    ₹{expectedProfit.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Machine Expense History Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-500" />
                Repair & Maintenance Expenses History ({expenses.length})
              </h3>
              <button
                onClick={() => onOpenExpenseModal(machine.stockId)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                + Add Repair Expense
              </button>
            </div>

            <div className="card-panel overflow-hidden">
              {expenses.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No repair or maintenance expenses recorded for this machine.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Technician / Vendor</th>
                      <th className="text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((e) => (
                      <tr key={e.id}>
                        <td className="font-mono text-xs">{e.date}</td>
                        <td>
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium">
                            {e.category}
                          </span>
                        </td>
                        <td className="text-xs">{e.description}</td>
                        <td className="text-xs text-slate-500">{e.vendorTechnician || '-'}</td>
                        <td className="text-right font-bold text-rose-600 dark:text-rose-400">
                          ₹{e.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Purchase Seller Info & Sale History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Purchase Seller Information */}
            <div className="card-panel p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-blue-500" />
                Original Purchase / Seller Info
              </h4>
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-slate-400">Seller Name: </span>
                  <span className="font-bold text-slate-900 dark:text-white">{machine.sellerName || 'Direct Shop Purchase'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Seller Contact: </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{machine.sellerPhone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Acquisition Date: </span>
                  <span className="text-slate-700 dark:text-slate-300">{machine.purchaseDate}</span>
                </div>
              </div>
            </div>

            {/* Customer Sale Info (if Sold) */}
            <div className="card-panel p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-500" />
                Customer Sale Information
              </h4>

              {saleRecord ? (
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-slate-400">Invoice Number: </span>
                    <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{saleRecord.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Customer: </span>
                    <span className="font-bold text-slate-900 dark:text-white">{saleRecord.customerName} ({saleRecord.customerPhone})</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Final Billed: </span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{saleRecord.finalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Payment Status: </span>
                    <StatusBadge status={saleRecord.paymentStatus} size="sm" />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-2">
                  This machine has not been sold yet. Status is currently: <span className="font-semibold text-slate-700 dark:text-slate-200">{machine.status}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
