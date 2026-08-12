import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  Copy,
  Check,
  X,
  ShieldCheck,
  DollarSign,
  Download,
  Loader2,
  CheckCircle2,
  Share2
} from 'lucide-react';
import type { SaleRecord } from '../../types';
import { Logo } from '../common/Logo';
import { UPIQRCode } from '../common/UPIQRCode';
import { StatusBadge } from '../common/StatusBadge';
import { getSettings, getInventory, recordSalePayment } from '../../services/store';
import { downloadPDF } from '../../utils/pdfGenerator';

interface InvoiceViewProps {
  sale: SaleRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordPayment?: (sale: SaleRecord) => void;
  onPaymentStatusUpdate?: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
  sale: initialSale,
  isOpen,
  onClose,
  onRecordPayment,
  onPaymentStatusUpdate
}) => {
  const [currentSale, setCurrentSale] = useState<SaleRecord | null>(initialSale);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfToastMessage, setPdfToastMessage] = useState('');
  const documentRef = useRef<HTMLDivElement>(null);
  
  const settings = getSettings();
  const inventory = getInventory();

  useEffect(() => {
    setCurrentSale(initialSale);
  }, [initialSale]);

  if (!isOpen || !currentSale) return null;

  const sale = currentSale;
  const machine = inventory.find(m => m.stockId === sale.stockId);
  const publicInvoiceUrl = `${window.location.origin}/#invoice=${sale.invoiceNumber}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    try {
      setIsGeneratingPDF(true);
      await downloadPDF(documentRef.current, `Invoice_${sale.invoiceNumber}.pdf`);
      setPdfToastMessage('📄 PDF Bill downloaded successfully!');
      setTimeout(() => setPdfToastMessage(''), 4000);
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      setPdfToastMessage(`❌ PDF Generation Error: ${err?.message || String(err)}`);
      setTimeout(() => setPdfToastMessage(''), 6000);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleWhatsAppShare = () => {
    const cleanPhone = sale.customerPhone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const shareText = `🧾 *HATIMI WASHING MACHINE HUB*\n*TAX INVOICE:* #${sale.invoiceNumber}\n\n👤 *Customer:* ${sale.customerName}\n📱 *Phone:* ${sale.customerPhone}\n🧺 *Item:* ${sale.machineBrand} ${sale.machineModel} (Stock: ${sale.stockId})\n\n💰 *Total Amount:* ₹${sale.finalAmount.toLocaleString('en-IN')}\n💵 *Amount Paid:* ₹${sale.amountPaid.toLocaleString('en-IN')}\n⭐ *Balance Due:* ₹${sale.balanceDue.toLocaleString('en-IN')} (${sale.paymentStatus.toUpperCase()})\n🛡️ *Warranty:* ${sale.warrantyDays} Days Shop Guarantee\n\n📄 *View Official Digital Tax Invoice:* \n${publicInvoiceUrl}`;

    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');

    setPdfToastMessage(`📲 WhatsApp opened directly for customer (+${formattedPhone})!`);
    setTimeout(() => setPdfToastMessage(''), 5000);
  };

  const handleMarkPaymentCompletedDirectly = () => {
    if (!sale || sale.balanceDue <= 0) return;
    try {
      const updated = recordSalePayment(
        sale.invoiceNumber,
        sale.balanceDue,
        'Cash',
        `Full remaining balance of ₹${sale.balanceDue.toLocaleString('en-IN')} marked completed`
      );
      setCurrentSale(updated);
      if (onPaymentStatusUpdate) onPaymentStatusUpdate();
      setPdfToastMessage('✅ Payment marked as FULLY COMPLETED!');
      setTimeout(() => setPdfToastMessage(''), 4000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update payment status.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicInvoiceUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in no-print-bg">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        {/* Action Toolbar Header (hidden when printing) */}
        <div className="no-print px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-teal-600 dark:text-teal-400">
              {sale.invoiceNumber}
            </span>
            <StatusBadge status={sale.paymentStatus} size="sm" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {sale.balanceDue > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleMarkPaymentCompletedDirectly}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                  title="Mark 100% Fully Paid"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Completed
                </button>
                {onRecordPayment && (
                  <button
                    onClick={() => onRecordPayment(sale)}
                    className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    title="Record Custom Payment Amount"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Custom Pay
                  </button>
                )}
              </div>
            )}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
              title="Download PDF Bill"
            >
              {isGeneratingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Download PDF Bill
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
              title="Send Digital Invoice to Customer WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share WhatsApp
            </button>
            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handleCopyLink}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs"
              title="Copy Public Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {pdfToastMessage && (
          <div className="no-print bg-teal-600 text-white text-xs px-4 py-2.5 flex items-center justify-between font-semibold shadow-md animate-fade-in">
            <span>{pdfToastMessage}</span>
            <button onClick={() => setPdfToastMessage('')} className="text-white/80 hover:text-white font-bold ml-2">×</button>
          </div>
        )}

        {/* Scrollable Document Area */}
        <div ref={documentRef} id="invoice-document" className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 print-area bg-white text-slate-900">
          {/* Quick Payment Banner if Balance Due */}
          {sale.balanceDue > 0 && (
            <div className="no-print p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900 text-xs">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold">Partial Payment / Balance Remaining:</span> ₹{sale.balanceDue.toLocaleString('en-IN')} outstanding
                </div>
              </div>
              <button
                onClick={handleMarkPaymentCompletedDirectly}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Payment Completed
              </button>
            </div>
          )}

          {/* Invoice Header: Brand Logo & Invoice Meta */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-slate-900">
            <div>
              <Logo variant="dark" size="md" />
              <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                <p className="font-semibold text-slate-900">{settings.address}</p>
                <p>Phone: <span className="font-mono">{settings.phone}</span> • WhatsApp: <span className="font-mono">{settings.whatsapp}</span></p>
                <p>Email: {settings.email} {settings.gstNumber && `• GSTIN: ${settings.gstNumber}`}</p>
              </div>
            </div>

            <div className="sm:text-right border-l-2 sm:border-l-0 sm:border-r-0 border-teal-600 pl-3 sm:pl-0">
              <h2 className="text-xl font-black tracking-wider uppercase text-slate-900">
                TAX INVOICE
              </h2>
              <div className="mt-1 font-mono text-sm font-bold text-teal-700">
                {sale.invoiceNumber}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                <p>Date: <span className="font-semibold text-slate-900">{sale.saleDate}</span></p>
                <p>Sold By: <span className="font-bold text-slate-900">{sale.soldBy || 'Hatimi Admin'}</span></p>
                <p>Warranty: <span className="font-bold text-teal-700">{sale.warrantyDays} Days Guarantee</span></p>
              </div>
            </div>
          </div>

          {/* Customer & Product Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">
                Billed To Customer:
              </span>
              <p className="font-bold text-sm text-slate-900">{sale.customerName}</p>
              <p className="font-mono text-slate-700">Phone: {sale.customerPhone}</p>
              <p className="text-slate-600">{sale.customerAddress || 'Address not provided'}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">
                Washing Machine Specifications:
              </span>
              <p className="font-bold text-sm text-slate-900">{sale.machineBrand} {sale.machineModel}</p>
              <p className="font-mono text-slate-700">Stock ID: <span className="font-bold">{sale.stockId}</span></p>
              <p className="text-slate-600">
                Specs: {machine?.capacityKg || 7.0} KG • {machine?.type || 'Fully Automatic'} • {machine?.loadingType || 'Top Load'}
              </p>
              <p className="font-mono text-[11px] text-slate-500">Serial No: {machine?.serialNumber || 'N/A'}</p>
            </div>
          </div>

          {/* Billed Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Stock ID</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-right">Selling Price</th>
                  <th className="p-3 text-right">Discount</th>
                  <th className="p-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="p-3 font-mono font-bold">{sale.stockId}</td>
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block">{sale.machineBrand} {sale.machineModel}</span>
                    <span className="text-[11px] text-slate-500">Includes {sale.warrantyDays}-day shop warranty & inspection check.</span>
                  </td>
                  <td className="p-3 text-right font-mono">₹{sale.sellingPrice.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right font-mono text-rose-600">-₹{sale.discount.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">₹{sale.finalAmount.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & Dynamic UPI QR Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Left: Dynamic UPI Payment QR (If balance due > 0) */}
            <div>
              {sale.balanceDue > 0 ? (
                <UPIQRCode
                  amount={sale.balanceDue}
                  invoiceNumber={sale.invoiceNumber}
                  size={140}
                />
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs">
                  <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-900">PAYMENT FULLY SETTLED</h4>
                    <p className="mt-0.5">Thank you! Full payment of ₹{sale.finalAmount.toLocaleString('en-IN')} has been received.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Payment Totals Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Price:</span>
                <span className="font-mono">₹{sale.sellingPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Discount Applied:</span>
                <span className="font-mono">-₹{sale.discount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total Billed Amount:</span>
                <span className="font-mono">₹{sale.finalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Amount Paid to Date:</span>
                <span className="font-mono">₹{sale.amountPaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-slate-900 text-base font-black text-slate-900">
                <span>Remaining Balance Due:</span>
                <span className={`font-mono ${sale.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  ₹{sale.balanceDue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Warranty Terms & Signature Footer */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="text-[11px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-800">Terms & Warranty Policy:</p>
              <p>{settings.defaultInvoiceFooter}</p>
              <p>Warranty covers functional motor and internal parts repair for {sale.warrantyDays} days from date of sale.</p>
            </div>

            <div className="pt-8 flex justify-between items-end text-xs text-slate-500">
              <div className="text-[10px]">
                System Generated Invoice • Hatimi Washing Machine Hub
              </div>
              <div className="border-t border-slate-400 pt-1 text-center font-bold text-slate-800 w-44">
                Authorized Signature
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

