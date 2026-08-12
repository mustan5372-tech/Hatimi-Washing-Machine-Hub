import React, { useState } from 'react';
import { X, ShoppingBag, Check } from 'lucide-react';
import type { MachineType, MachineCondition, PaymentMethod } from '../../types';
import { addPurchaseRecord, generateNextSerialNumber } from '../../services/store';

interface PurchaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (stockId: string) => void;
}

export const PurchaseFormModal: React.FC<PurchaseFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');

  const [machineBrand, setMachineBrand] = useState('LG');
  const [machineModel, setMachineModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [capacityKg, setCapacityKg] = useState('7.0');
  const [type, setType] = useState<MachineType>('Fully Automatic');
  const [condition, setCondition] = useState<MachineCondition>('Good');

  const [purchasePrice, setPurchasePrice] = useState('7000');
  const [amountPaid, setAmountPaid] = useState('7000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setSerialNumber(generateNextSerialNumber());
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerName.trim() || !sellerPhone.trim()) {
      setError('Please provide Seller Name and Phone Number.');
      return;
    }
    if (!machineModel.trim()) {
      setError('Please enter Machine Model name.');
      return;
    }
    const price = parseFloat(purchasePrice) || 0;
    const paid = parseFloat(amountPaid) || 0;
    if (price <= 0) {
      setError('Purchase price must be greater than 0.');
      return;
    }

    try {
      const record = addPurchaseRecord({
        sellerName: sellerName.trim(),
        sellerPhone: sellerPhone.trim(),
        sellerAddress: sellerAddress.trim(),
        machineBrand,
        machineModel: machineModel.trim(),
        serialNumber: serialNumber.trim(),
        capacityKg: parseFloat(capacityKg) || 7.0,
        type,
        condition,
        photos: ['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80'],
        purchasePrice: price,
        amountPaid: paid,
        remainingAmount: Math.max(0, price - paid),
        paymentMethod,
        purchaseDate
      });

      onSuccess(record.stockId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save purchase transaction.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Buy Second-Hand Washing Machine (New Purchase)
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

          {/* Section 1: Seller Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 border-b border-slate-200 dark:border-slate-700 pb-1">
              1. Seller / Source Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Seller Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="e.g. Ahmed Sheikh"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder="e.g. +91 98211 55443"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Seller Address & ID Ref
              </label>
              <input
                type="text"
                value={sellerAddress}
                onChange={(e) => setSellerAddress(e.target.value)}
                placeholder="Residential address / Pickup locality"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
              />
            </div>
          </div>

          {/* Section 2: Machine Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 border-b border-slate-200 dark:border-slate-700 pb-1">
              2. Washing Machine Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Brand *
                </label>
                <select
                  value={machineBrand}
                  onChange={(e) => setMachineBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                >
                  <option value="LG">LG</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Whirlpool">Whirlpool</option>
                  <option value="IFB">IFB</option>
                  <option value="Godrej">Godrej</option>
                  <option value="Bosch">Bosch</option>
                  <option value="Haier">Haier</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Model Name *
                </label>
                <input
                  type="text"
                  required
                  value={machineModel}
                  onChange={(e) => setMachineModel(e.target.value)}
                  placeholder="e.g. Smart Inverter 7.0kg"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Capacity (KG)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={capacityKg}
                  onChange={(e) => setCapacityKg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Type *
                </label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                >
                  <option value="Fully Automatic">Fully Automatic</option>
                  <option value="Semi Automatic">Semi Automatic</option>
                  <option value="Front Load">Front Load</option>
                  <option value="Top Load">Top Load</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e: any) => setCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                >
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Refurbished">Refurbished</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Serial Number
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial Settlement */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 border-b border-slate-200 dark:border-slate-700 pb-1">
              3. Purchase Payment Settlement
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Agreed Purchase Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={purchasePrice}
                  onChange={(e) => {
                    setPurchasePrice(e.target.value);
                    setAmountPaid(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Paid Now (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
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
                  <option value="UPI">UPI Payment</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Purchase Date *
                </label>
                <input
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                />
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
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-colors"
          >
            <Check className="w-4 h-4" />
            Complete Purchase & Generate Stock ID
          </button>
        </div>
      </div>
    </div>
  );
};
