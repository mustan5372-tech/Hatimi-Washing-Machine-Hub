import React, { useState } from 'react';
import { X, DollarSign, Check, CheckCircle2 } from 'lucide-react';
import type { SaleRecord, PaymentMethod } from '../../types';
import { recordSalePayment } from '../../services/store';

interface PaymentModalProps {
  sale: SaleRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedSale?: SaleRecord) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  sale,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (sale) {
      setAmount(sale.balanceDue.toString());
      setNotes('');
      setError('');
    }
  }, [sale, isOpen]);

  if (!isOpen || !sale) return null;

  const handleRecordPayment = (payAmount: number, payNotes?: string) => {
    if (isNaN(payAmount) || payAmount <= 0) {
      setError('Please enter a valid payment amount (> 0).');
      return;
    }
    if (payAmount > sale.balanceDue) {
      setError(`Payment amount cannot exceed remaining balance due of ₹${sale.balanceDue.toLocaleString('en-IN')}.`);
      return;
    }

    try {
      const updated = recordSalePayment(sale.invoiceNumber, payAmount, paymentMethod, payNotes || notes.trim() || `Payment received via ${paymentMethod}`);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRecordPayment(parseFloat(amount));
  };

  const handleMarkFullyPaid = () => {
    handleRecordPayment(sale.balanceDue, `Full balance completed via ${paymentMethod}`);
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
          <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Record Customer Payment
          </h3>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl mb-4 text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Invoice:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{sale.invoiceNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Customer:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{sale.customerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Machine Billed:</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{sale.machineBrand} {sale.machineModel} ({sale.stockId})</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 font-bold">
            <span className="text-slate-600 dark:text-slate-300">Remaining Balance Due:</span>
            <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">
              ₹{sale.balanceDue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Quick Mark Payment Completed Banner */}
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">Buyer Completing Payment?</span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Mark full ₹{sale.balanceDue.toLocaleString('en-IN')} as received</span>
          </div>
          <button
            type="button"
            onClick={handleMarkFullyPaid}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1 shrink-0 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark Payment Completed
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Payment Amount Received (₹) *
            </label>
            <input
              type="number"
              required
              min="1"
              max={sale.balanceDue}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
              <option value="UPI">UPI Payment</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Payment Reference / Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Final balance paid in cash / UPI reference"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
            />
          </div>

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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              Save Payment & Update Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

