import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Copy, Check, Tag } from 'lucide-react';
import type { InventoryMachine } from '../../types';
import { getSettings } from '../../services/store';

interface MachineQRModalProps {
  machine: InventoryMachine | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MachineQRModal: React.FC<MachineQRModalProps> = ({
  machine,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);
  const settings = getSettings();

  if (!isOpen || !machine) return null;

  // Link encoded in QR
  const shareableUrl = `${window.location.origin}/#machine=${machine.stockId}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print-bg">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
        <button
          onClick={onClose}
          className="no-print absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center print-area">
          {/* Shop Header Badge */}
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-1">
            <Tag className="w-3.5 h-3.5" />
            {settings.shopName}
          </div>

          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase font-mono tracking-wider">
            {machine.stockId}
          </h3>

          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
            {machine.brand} {machine.model}
          </p>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {machine.capacityKg} KG • {machine.type} • {machine.loadingType}
          </p>

          {/* QR Code Container */}
          <div className="my-4 p-4 bg-white rounded-xl border border-slate-200 inline-block shadow-md">
            <QRCodeSVG
              value={shareableUrl}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">
            SN: {machine.serialNumber || 'N/A'}
          </div>

          <div className="mt-2 text-xs font-bold text-teal-600 dark:text-teal-400">
            ₹{machine.sellingPrice.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2">
          <button
            onClick={handlePrint}
            className="py-2 px-3 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Sticker
          </button>
          <button
            onClick={handleCopyLink}
            className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
};
