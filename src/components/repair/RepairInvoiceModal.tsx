import React, { useState, useRef } from 'react';
import { X, Printer, CheckCircle, Wrench, Share2, Download, Loader2, Hammer, Languages, ShieldCheck } from 'lucide-react';
import type { RepairRecord, BusinessSettings } from '../../types';
import { downloadPDF } from '../../utils/pdfGenerator';
import { translations } from '../../utils/i18n';

interface RepairInvoiceModalProps {
  isOpen: boolean;
  repairRecord: RepairRecord | null;
  settings: BusinessSettings;
  onClose: () => void;
}

export const RepairInvoiceModal: React.FC<RepairInvoiceModalProps> = ({
  isOpen,
  repairRecord,
  settings,
  onClose
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [billLang, setBillLang] = useState<'en' | 'hi'>('en');
  const [toastMessage, setToastMessage] = useState('');
  const documentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !repairRecord) return null;

  const tBill = (key: string) => translations[billLang][key] || translations['en'][key] || key;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    try {
      setIsGeneratingPDF(true);
      await downloadPDF(documentRef.current, `Repair_Invoice_${repairRecord.invoiceNumber}.pdf`);
      setToastMessage('📄 PDF Repairing Bill downloaded successfully!');
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      setToastMessage(`❌ PDF Generation Error: ${err?.message || String(err)}`);
      setTimeout(() => setToastMessage(''), 5000);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleWhatsAppShare = () => {
    const cleanPhone = repairRecord.customerPhone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const partsSummary = repairRecord.spareParts && repairRecord.spareParts.length > 0
      ? `\n\n🔧 *${tBill('attached_parts')}:*\n` + repairRecord.spareParts.map(p => `• ${p.partName} x${p.quantity} @ ₹${p.unitPrice.toLocaleString('en-IN')}`).join('\n')
      : '';

    const publicUrl = `${window.location.origin}/#invoice=${repairRecord.invoiceNumber}`;

    const shopName = billLang === 'hi' ? 'हातिमी वाशिंग मशीन हब' : settings.shopName;
    const invoiceTitle = tBill('repair_bill');

    const text = `🛠️ *${shopName}*\n*${invoiceTitle}:* #${repairRecord.invoiceNumber}\n\n👤 *${tBill('customer_details')}:* ${repairRecord.customerName}\n📱 *${tBill('phone_wa')}:* ${repairRecord.customerPhone}\n🧺 *${tBill('appliance_specs')}:* ${repairRecord.machineDetails}\n📋 *${tBill('description')}:* ${repairRecord.issueDescription}\n\n💰 *${tBill('repair_charges')}:* ₹${repairRecord.repairCost.toLocaleString('en-IN')}\n🧰 *${tBill('labour_fees')}:* ₹${repairRecord.labourCharges.toLocaleString('en-IN')}${partsSummary}\n\n💵 *${tBill('total_amount')}:* ₹${repairRecord.totalAmount.toLocaleString('en-IN')}\n✅ *${tBill('amount_paid')}:* ₹${repairRecord.amountPaid.toLocaleString('en-IN')}\n⭐ *${tBill('balance_due')}:* ₹${repairRecord.balanceDue.toLocaleString('en-IN')} (${repairRecord.paymentStatus})\n\n📄 *Digital Bill Link:* \n${publicUrl}`;

    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');

    setToastMessage(`📲 Repair Bill WhatsApp sent to +${formattedPhone}!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in no-print-backdrop">
      <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Hammer className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold font-mono text-cyan-300">
              #{repairRecord.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Bill Language Toggle */}
            <button
              onClick={() => setBillLang(billLang === 'en' ? 'hi' : 'en')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors border border-slate-700"
              title="Toggle Bill Language (English / Hindi)"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{billLang === 'en' ? 'Bill: EN' : 'Bill: HI (हिंदी)'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              title="Download PDF Repairing Bill"
            >
              {isGeneratingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              PDF Bill
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              title="Share on Customer WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp Share
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {toastMessage && (
          <div className="no-print bg-cyan-600 text-white text-xs px-4 py-2 flex items-center justify-between font-semibold shadow-sm">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage('')} className="text-white font-bold ml-2">×</button>
          </div>
        )}

        {/* Printable Invoice Sheet */}
        <div ref={documentRef} className="p-8 overflow-y-auto space-y-6 flex-1 bg-white printable-area">
          {/* Shop Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                {billLang === 'hi' ? 'हातिमी वाशिंग मशीन हब' : settings.shopName}
              </h1>
              <p className="text-xs text-slate-600 font-medium">{settings.address}</p>
              <p className="text-xs text-slate-600">{tBill('phone_wa')}: <span className="font-bold text-slate-900">{settings.phone}</span> • {tBill('email')}: <span className="font-bold text-slate-900">{settings.email || 'mustan5372@gmail.com'}</span></p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-900 font-black text-xs uppercase rounded-md tracking-wider border border-cyan-300">
                {tBill('repair_bill')}
              </span>
              <p className="text-sm font-mono font-bold text-slate-900 mt-2">{repairRecord.invoiceNumber}</p>
              <p className="text-xs text-slate-500">{tBill('date')}: {repairRecord.repairDate}</p>
            </div>
          </div>

          {/* Customer & Machine Info Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {tBill('customer_details')}
              </span>
              <p className="font-bold text-slate-900 text-sm">{repairRecord.customerName}</p>
              <p className="font-mono text-slate-700 font-semibold">{repairRecord.customerPhone}</p>
              {repairRecord.customerAddress && (
                <p className="text-slate-600 text-[11px] mt-0.5">{repairRecord.customerAddress}</p>
              )}
            </div>

            <div className="text-right space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {tBill('appliance_specs')}
              </span>
              <p className="font-bold text-slate-900 text-xs">{repairRecord.machineDetails}</p>
              <p className="text-slate-600 text-[11px]"><span className="font-semibold text-slate-800">{tBill('description')}:</span> {repairRecord.issueDescription}</p>
              {repairRecord.technicianName && (
                <p className="text-[11px] text-cyan-800 font-semibold">Tech: {repairRecord.technicianName}</p>
              )}
            </div>
          </div>

          {/* Charges Breakdown Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              {tBill('repair_charges')} & {tBill('labour_fees')}
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                  <th className="p-2.5 rounded-l-lg">#</th>
                  <th className="p-2.5">{tBill('description')}</th>
                  <th className="p-2.5 text-right rounded-r-lg">{tBill('amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-bold text-slate-400">1</td>
                  <td className="p-2.5 font-bold text-slate-900">
                    {tBill('repair_charges')}
                    <span className="block text-[11px] font-normal text-slate-500">{repairRecord.issueDescription}</span>
                  </td>
                  <td className="p-2.5 text-right font-bold text-slate-900">₹{repairRecord.repairCost.toLocaleString('en-IN')}</td>
                </tr>

                {repairRecord.labourCharges > 0 && (
                  <tr>
                    <td className="p-2.5 font-bold text-slate-400">2</td>
                    <td className="p-2.5 font-bold text-slate-900">{tBill('labour_fees')}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">₹{repairRecord.labourCharges.toLocaleString('en-IN')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Attached Spare Parts (If Merged) */}
          {repairRecord.spareParts && repairRecord.spareParts.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-600" /> {tBill('attached_parts')}
              </h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="p-2 font-bold">{tBill('description')}</th>
                    <th className="p-2 text-center font-bold">Qty</th>
                    <th className="p-2 text-right font-bold">Unit Price</th>
                    <th className="p-2 text-right font-bold">{tBill('amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {repairRecord.spareParts.map((sp, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-semibold text-slate-900">{sp.partName} {sp.partNumber ? `(${sp.partNumber})` : ''}</td>
                      <td className="p-2 text-center font-bold">{sp.quantity}</td>
                      <td className="p-2 text-right">₹{sp.unitPrice.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right font-bold text-slate-900">₹{(sp.unitPrice * sp.quantity).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Financial Breakdown */}
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{tBill('subtotal')}:</span>
                <span className="font-semibold text-slate-900">₹{repairRecord.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {repairRecord.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>{tBill('discount')}:</span>
                  <span>- ₹{repairRecord.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-900">
                <span>{tBill('total_amount')}:</span>
                <span>₹{repairRecord.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700 font-bold">
                <span>{tBill('amount_paid')}:</span>
                <span>₹{repairRecord.amountPaid.toLocaleString('en-IN')}</span>
              </div>
              {repairRecord.balanceDue > 0 && (
                <div className="flex justify-between text-amber-700 font-bold pt-1 border-t border-slate-200">
                  <span>{tBill('balance_due')}:</span>
                  <span>₹{repairRecord.balanceDue.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* 30-Day Repair Warranty Badge */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-amber-900 text-xs font-bold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{tBill('repair_warranty')}</span>
            </div>
            <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] rounded-md uppercase font-black tracking-wider shrink-0">
              30 Days Warranty
            </span>
          </div>

          {/* Stamp / Footer Notes */}
          <div className="pt-4 border-t border-slate-200 text-center space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-600">
              {tBill('thank_you')}
            </p>
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-bold">
              <CheckCircle className="w-3.5 h-3.5" /> Official Verified Invoice
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
