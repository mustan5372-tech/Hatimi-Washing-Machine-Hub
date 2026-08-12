import React, { useState } from 'react';
import { X, Wrench, Check } from 'lucide-react';
import { addMachineExpense } from '../../services/store';

interface RepairExpenseModalProps {
  isOpen: boolean;
  stockId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const RepairExpenseModal: React.FC<RepairExpenseModalProps> = ({
  isOpen,
  stockId: initialStockId = '',
  onClose,
  onSuccess
}) => {
  const [stockId, setStockId] = useState(initialStockId);
  const [category, setCategory] = useState<'Repair' | 'Spare Parts' | 'Labour' | 'Cleaning' | 'Transportation' | 'Other'>('Repair');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [vendorTechnician, setVendorTechnician] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    setStockId(initialStockId);
    setError('');
  }, [initialStockId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockId.trim()) {
      setError('Please enter or select a Stock ID (e.g. WM-0001).');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid expense amount (> 0).');
      return;
    }

    try {
      addMachineExpense({
        stockId: stockId.trim().toUpperCase(),
        date: new Date().toISOString().split('T')[0],
        category,
        description: description.trim() || `${category} Expense`,
        amount: numAmount,
        vendorTechnician: vendorTechnician.trim(),
        notes: notes.trim()
      });

      // reset form
      setDescription('');
      setAmount('');
      setVendorTechnician('');
      setNotes('');
      setError('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record repair expense.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Add Repair / Maintenance Expense
          </h3>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Stock ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Machine Stock ID *
            </label>
            <input
              type="text"
              required
              value={stockId}
              onChange={(e) => setStockId(e.target.value)}
              placeholder="e.g. WM-0001"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Expense Category *
            </label>
            <select
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
            >
              <option value="Repair">Repair (Motor, PCB, Belt, Pump)</option>
              <option value="Spare Parts">Spare Parts Replacement</option>
              <option value="Labour">Labour / Technician Fee</option>
              <option value="Cleaning">Chemical Washing & Sanitization</option>
              <option value="Transportation">Pickup / Transport Fare</option>
              <option value="Other">Other Miscellaneous Expense</option>
            </select>
          </div>

          {/* Amount & Vendor Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1200"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Technician / Vendor
              </label>
              <input
                type="text"
                value={vendorTechnician}
                onChange={(e) => setVendorTechnician(e.target.value)}
                placeholder="e.g. Suresh Electrician"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Work Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Replaced capacitor and serviced spin tub motor"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              Save Expense & Update Total Cost
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
