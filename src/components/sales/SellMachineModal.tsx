import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Receipt, Check, AlertTriangle } from 'lucide-react';
import type { InventoryMachine, Customer, PaymentMethod } from '../../types';
import { createSaleTransaction, getCustomers } from '../../services/store';

interface SellMachineModalProps {
  isOpen: boolean;
  preselectedStockId?: string;
  availableMachines: InventoryMachine[];
  onClose: () => void;
  onSuccess: (invoiceNumber: string) => void;
}

export const SellMachineModal: React.FC<SellMachineModalProps> = ({
  isOpen,
  preselectedStockId = '',
  availableMachines,
  onClose,
  onSuccess
}) => {
  const [stockId, setStockId] = useState(preselectedStockId);
  const [machineSearchQuery, setMachineSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [sellingPrice, setSellingPrice] = useState('12000');
  const [discount, setDiscount] = useState('500');
  const [amountPaid, setAmountPaid] = useState('5000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [saleDate] = useState(new Date().toISOString().split('T')[0]);
  const [warrantyDays, setWarrantyDays] = useState('30');
  const [notes] = useState('');
  const [error, setError] = useState('');

  const [existingCustomers, setExistingCustomers] = useState<Customer[]>([]);

  const searchedMachines = availableMachines.filter((m) => {
    const q = machineSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.stockId.toLowerCase().includes(q) ||
      (m.serialNumber && m.serialNumber.toLowerCase().includes(q)) ||
      m.brand.toLowerCase().includes(q) ||
      m.model.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setExistingCustomers(getCustomers());
      setStockId(preselectedStockId);
      setError('');

      if (preselectedStockId) {
        const m = availableMachines.find(x => x.stockId === preselectedStockId);
        if (m) {
          setSellingPrice(m.sellingPrice.toString());
          setWarrantyDays((m.warrantyDays || 30).toString());
          setMachineSearchQuery(`${m.stockId} • ${m.brand} ${m.model} (SN: ${m.serialNumber || 'N/A'})`);
        }
      }
    }
  }, [isOpen, preselectedStockId, availableMachines]);

  // When stock ID changes, update selling price
  const handleStockChange = (newStockId: string) => {
    setStockId(newStockId);
    const m = availableMachines.find(x => x.stockId === newStockId);
    if (m) {
      setSellingPrice(m.sellingPrice.toString());
      setWarrantyDays((m.warrantyDays || 30).toString());
    }
  };

  // Auto-fill customer details if returning customer phone matches
  const handlePhoneChange = (phone: string) => {
    setCustomerPhone(phone);
    const found = existingCustomers.find(c => c.phone.trim() === phone.trim());
    if (found) {
      setCustomerName(found.name);
      setCustomerAddress(found.address || '');
      setCustomerEmail(found.email || '');
    }
  };

  const selectedMachine = availableMachines.find(m => m.stockId === stockId);

  // Financial Calculations
  const numSell = parseFloat(sellingPrice) || 0;
  const numDisc = parseFloat(discount) || 0;
  const finalAmount = Math.max(0, numSell - numDisc);
  const numPaid = parseFloat(amountPaid) || 0;
  const balanceDue = Math.max(0, finalAmount - numPaid);
  const calculatedProfit = selectedMachine ? finalAmount - selectedMachine.totalCost : 0;
  const marginPct = finalAmount > 0 ? ((calculatedProfit / finalAmount) * 100).toFixed(1) : '0';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockId) {
      setError('Please select a washing machine to sell.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Please provide Customer Name and Phone Number.');
      return;
    }
    if (finalAmount <= 0) {
      setError('Final billed amount must be greater than 0.');
      return;
    }

    try {
      const { sale } = createSaleTransaction({
        stockId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerEmail: customerEmail.trim(),
        sellingPrice: numSell,
        discount: numDisc,
        amountPaid: numPaid,
        paymentMethod,
        saleDate,
        warrantyDays: parseInt(warrantyDays, 10) || 30,
        notes: notes.trim()
      });

      // Launch celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      onSuccess(sale.invoiceNumber);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to complete sale transaction.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sell Machine & Issue Branded Invoice
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Reserved Warning Banner */}
          {selectedMachine && selectedMachine.status === 'Reserved' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Warning: Machine <strong>{selectedMachine.stockId}</strong> is currently marked as RESERVED.</span>
            </div>
          )}

          {/* Section 1: Searchable Machine Selection Combobox */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 border-b border-slate-200 dark:border-slate-700 pb-1">
              1. Select Washing Machine Stock (Searchable Combobox)
            </h4>
            
            {/* Search Combobox Input */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Search & Select Machine by Serial Number (WM-XXXX), Stock ID, or Model *
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  value={machineSearchQuery}
                  onChange={(e) => {
                    setMachineSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="🔍 Type Serial No (WM-1001), Stock ID (WM-0001), Brand or Model..."
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none"
                />
                {stockId && (
                  <button
                    type="button"
                    onClick={() => {
                      setStockId('');
                      setMachineSearchQuery('');
                      setIsSearchOpen(true);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-rose-500 hover:underline font-bold px-1.5 py-0.5"
                  >
                    Change
                  </button>
                )}
              </div>

              {/* Live Search Popup Dropdown */}
              {isSearchOpen && (
                <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 divide-y divide-slate-100 dark:divide-slate-700/60">
                  {searchedMachines.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No available machines match "{machineSearchQuery}".
                    </div>
                  ) : (
                    searchedMachines.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          handleStockChange(m.stockId);
                          setMachineSearchQuery(`${m.stockId} • ${m.brand} ${m.model} (SN: ${m.serialNumber || 'N/A'})`);
                          setIsSearchOpen(false);
                        }}
                        className={`w-full p-2.5 text-left flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                          m.stockId === stockId ? 'bg-teal-50 dark:bg-teal-950/30 font-bold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={m.photos?.[0] || 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80'}
                            alt={m.model}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">{m.stockId}</span>
                              {m.serialNumber && (
                                <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[10px] rounded font-bold">
                                  SN: {m.serialNumber}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{m.brand} {m.model}</p>
                            <p className="text-[10px] text-slate-400">{m.capacityKg}kg • {m.type}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-bold text-xs text-emerald-600 dark:text-emerald-400">₹{m.sellingPrice.toLocaleString('en-IN')}</p>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">{m.status}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {selectedMachine && (
              <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px]">Selected Machine</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedMachine.brand} {selectedMachine.model}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Serial Number</span>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{selectedMachine.serialNumber || 'WM-1001'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Target Selling Price</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{selectedMachine.sellingPrice.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Cost</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">₹{selectedMachine.totalCost.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Customer Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 border-b border-slate-200 dark:border-slate-700 pb-1">
              2. Customer Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Phone * (Auto-checks existing)
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="e.g. +91 98200 11223"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Delivery Address
              </label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Full delivery street address..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
              />
            </div>
          </div>

          {/* Section 3: Sale Pricing & Payment Settlement */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 border-b border-slate-200 dark:border-slate-700 pb-1">
              3. Sale Pricing & Initial Payment
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Discount Given (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Down Payment Paid (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                >
                  <option value="UPI">UPI / Dynamic QR</option>
                  <option value="Cash">Cash Payment</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Financial Summary Pill */}
            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Final Billed Amount:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">₹{finalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-blue-200 dark:border-blue-900/60">
                <span className="text-slate-600 dark:text-slate-400">Remaining Balance Due:</span>
                <span className={`font-black text-sm ${balanceDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'}`}>
                  ₹{balanceDue.toLocaleString('en-IN')} {balanceDue > 0 ? '(UPI QR auto-generated)' : '(Fully Paid)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Calculated Net Profit: ₹{calculatedProfit.toLocaleString('en-IN')} ({marginPct}% margin)</span>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-colors"
          >
            <Check className="w-4 h-4" />
            Complete Sale & Generate Branded Invoice
          </button>
        </div>
      </div>
    </div>
  );
};
