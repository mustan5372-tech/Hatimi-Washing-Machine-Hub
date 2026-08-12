import React from 'react';
import { X, Printer } from 'lucide-react';
import type { PurchaseRecord } from '../../types';
import { Logo } from '../common/Logo';
import { getSettings } from '../../services/store';

interface PurchaseReceiptModalProps {
  purchase: PurchaseRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PurchaseReceiptModal: React.FC<PurchaseReceiptModalProps> = ({
  purchase,
  isOpen,
  onClose
}) => {
  const settings = getSettings();

  if (!isOpen || !purchase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print-bg">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
        <button
          onClick={onClose}
          className="no-print absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Voucher Content */}
        <div className="print-area space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <Logo variant="dark" size="sm" />
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 block">
                PURCHASE VOUCHER / RECEIPT
              </span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                {purchase.stockId}
              </span>
              <span className="block text-[11px] text-slate-500">
                Date: {purchase.purchaseDate}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] text-slate-400">
                Purchaser / Shop Info
              </h4>
              <p className="font-bold text-slate-900 dark:text-white">{settings.shopName}</p>
              <p className="text-slate-600 dark:text-slate-300">{settings.address}</p>
              <p className="text-slate-600 dark:text-slate-300">Phone: {settings.phone}</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] text-slate-400">
                Seller Information
              </h4>
              <p className="font-bold text-slate-900 dark:text-white">{purchase.sellerName}</p>
              <p className="font-mono text-slate-600 dark:text-slate-300">{purchase.sellerPhone}</p>
              <p className="text-slate-600 dark:text-slate-300">{purchase.sellerAddress || 'Address not provided'}</p>
            </div>
          </div>

          {/* Machine Purchased Summary */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="p-2.5">Stock ID</th>
                  <th className="p-2.5">Item Purchased</th>
                  <th className="p-2.5">Condition</th>
                  <th className="p-2.5 text-right">Agreed Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                <tr>
                  <td className="p-2.5 font-mono font-bold">{purchase.stockId}</td>
                  <td className="p-2.5 font-semibold">
                    {purchase.machineBrand} {purchase.machineModel} ({purchase.capacityKg} KG • {purchase.type})
                  </td>
                  <td className="p-2.5">{purchase.condition}</td>
                  <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">
                    ₹{purchase.purchasePrice.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Settlement Box */}
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 flex items-center justify-between text-xs font-bold">
            <div>
              <span className="text-teal-800 dark:text-teal-300 block">
                Payment Settled via {purchase.paymentMethod}
              </span>
              <span className="text-[10px] text-teal-600 font-normal">
                Amount Paid: ₹{purchase.amountPaid.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-base text-teal-700 dark:text-teal-300 font-black">
              ₹{purchase.purchasePrice.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="border-t border-slate-300 dark:border-slate-700 pt-2 text-slate-500">
              Seller Signature ({purchase.sellerName})
            </div>
            <div className="border-t border-slate-300 dark:border-slate-700 pt-2 text-slate-500">
              Authorized Shop Receiver
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
          <button
            onClick={() => window.print()}
            className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Purchase Voucher
          </button>
        </div>
      </div>
    </div>
  );
};
