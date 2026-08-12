import React from 'react';
import { X, Printer, CheckCircle, Wrench } from 'lucide-react';
import type { SparePartSaleRecord, BusinessSettings } from '../../types';

interface SparePartInvoiceModalProps {
  isOpen: boolean;
  saleRecord: SparePartSaleRecord | null;
  settings: BusinessSettings;
  onClose: () => void;
}

export const SparePartInvoiceModal: React.FC<SparePartInvoiceModalProps> = ({
  isOpen,
  saleRecord,
  settings,
  onClose
}) => {
  if (!isOpen || !saleRecord) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in no-print-backdrop">
      <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold">Spare Parts Sale Receipt #{saleRecord.invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 bg-white printable-area">
          {/* Shop Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                {settings.shopName}
              </h1>
              <p className="text-xs text-slate-600 font-medium">{settings.address}</p>
              <p className="text-xs text-slate-600">Phone / WhatsApp: <span className="font-bold text-slate-900">{settings.phone}</span></p>
              {settings.gstNumber && (
                <p className="text-[11px] text-slate-500 font-mono">GSTIN: {settings.gstNumber}</p>
              )}
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-black text-xs uppercase rounded-md tracking-wider border border-amber-300">
                SPARE PARTS INVOICE
              </span>
              <p className="text-sm font-mono font-bold text-slate-900 mt-2">{saleRecord.invoiceNumber}</p>
              <p className="text-xs text-slate-500">Date: {saleRecord.saleDate}</p>
            </div>
          </div>

          {/* Customer Details & Billing Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billed To (Customer)
              </span>
              <p className="font-bold text-slate-900 text-sm">{saleRecord.customerName}</p>
              <p className="font-mono text-slate-700 font-semibold">{saleRecord.customerPhone}</p>
              {saleRecord.customerAddress && (
                <p className="text-slate-600 text-[11px] mt-0.5">{saleRecord.customerAddress}</p>
              )}
            </div>

            <div className="text-right space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Payment Details
              </span>
              <p className="text-xs font-semibold text-slate-700">Method: <span className="font-bold text-slate-900">{saleRecord.paymentMethod}</span></p>
              <p className="text-xs font-semibold text-slate-700">Status: 
                <span className={`ml-1 font-bold ${saleRecord.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {saleRecord.paymentStatus}
                </span>
              </p>
            </div>
          </div>

          {/* Items Purchased Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Items Purchased
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                  <th className="p-2.5 rounded-l-lg">#</th>
                  <th className="p-2.5">Part Code</th>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Unit Price</th>
                  <th className="p-2.5 text-right rounded-r-lg">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {saleRecord.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-2.5 font-mono font-bold text-amber-700">{item.partNumber}</td>
                    <td className="p-2.5 font-bold text-slate-900">{item.partName}</td>
                    <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                    <td className="p-2.5 text-right">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Breakdown */}
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{saleRecord.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {saleRecord.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount:</span>
                  <span>- ₹{saleRecord.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-900">
                <span>Total Billed Amount:</span>
                <span>₹{saleRecord.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700 font-bold">
                <span>Amount Paid:</span>
                <span>₹{saleRecord.amountPaid.toLocaleString('en-IN')}</span>
              </div>
              {saleRecord.balanceDue > 0 && (
                <div className="flex justify-between text-amber-700 font-bold pt-1 border-t border-slate-200">
                  <span>Balance Due:</span>
                  <span>₹{saleRecord.balanceDue.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stamp / Footer Notes */}
          <div className="pt-6 border-t border-slate-200 text-center space-y-2">
            <p className="text-[11px] font-semibold text-slate-600">
              {settings.defaultInvoiceFooter || "Thank you for buying original spare parts from Hatimi Washing Machine Hub!"}
            </p>
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-bold">
              <CheckCircle className="w-3.5 h-3.5" /> Official Verified Counter Invoice
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
