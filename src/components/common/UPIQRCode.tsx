import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Smartphone, Copy, Check } from 'lucide-react';
import { getSettings } from '../../services/store';

interface UPIQRCodeProps {
  amount: number;
  invoiceNumber?: string;
  note?: string;
  size?: number;
  showDetails?: boolean;
  className?: string;
}

export const UPIQRCode: React.FC<UPIQRCodeProps> = ({
  amount,
  invoiceNumber,
  note = 'Payment for Washing Machine Invoice',
  size = 180,
  showDetails = true,
  className = ''
}) => {
  const settings = getSettings();
  const upiId = settings.upiId || 'hatimiwmh@okaxis';
  const shopName = settings.shopName || 'Hatimi Washing Machine Hub';
  const [copied, setCopied] = React.useState(false);

  // Encode UPI payment URL
  // upi://pay?pa=UPI_ID&pn=SHOP_NAME&am=AMOUNT&cu=INR&tn=NOTE
  const encodedShopName = encodeURIComponent(shopName);
  const encodedNote = encodeURIComponent(invoiceNumber ? `Invoice ${invoiceNumber}` : note);
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodedShopName}&am=${amount.toFixed(2)}&cu=INR&tn=${encodedNote}`;

  const copyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md text-center ${className}`}>
      {/* Scan Header */}
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-2">
        <QrCode className="w-4 h-4" />
        <span>Scan To Pay Instantly</span>
      </div>

      {/* Amount Pill */}
      <div className="text-xl font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700/80 px-4 py-1.5 rounded-full mb-3 shadow-inner">
        ₹{amount.toLocaleString('en-IN')}
      </div>

      {/* QR Code Graphic Container */}
      <div className="p-3 bg-white rounded-xl shadow-lg border border-slate-100 relative group transition-transform hover:scale-105">
        <QRCodeSVG
          value={upiUri}
          size={size}
          level="H"
          includeMargin={true}
        />
      </div>

      {showDetails && (
        <div className="mt-3 flex flex-col items-center gap-1.5 w-full max-w-xs">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/40 px-3 py-1 rounded-lg w-full">
            <Smartphone className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            <span className="truncate font-mono">{upiId}</span>
            <button
              onClick={copyUPI}
              title="Copy UPI ID"
              className="ml-auto p-1 hover:text-teal-600 transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400">
            Open PhonePe, GPay, Paytm, or BHIM to pay
          </p>
        </div>
      )}
    </div>
  );
};
