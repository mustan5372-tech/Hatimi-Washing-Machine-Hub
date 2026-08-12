import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Upload, Search, CheckCircle } from 'lucide-react';
import { getInventory } from '../../services/store';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMachine: (stockId: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectMachine
}) => {
  const [manualStockId, setManualStockId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const qrRegionRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setManualStockId('');
      // attempt camera init
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (!qrRegionRef.current) return;
      const html5QrCode = new Html5Qrcode('qr-reader-element');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 }
        },
        (decodedText) => {
          // Success callback
          stopCamera();
          handleScannedResult(decodedText);
        },
        (_error) => {
          // silent error during scan frame
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera access unavailable:', err);
      setIsScanning(false);
      setErrorMessage('Camera access unavailable. You can search or upload a QR image below.');
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping camera:', e);
      }
    }
    setIsScanning(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-element');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScannedResult(decodedText);
    } catch (err) {
      setErrorMessage('Could not read QR code from uploaded image. Try entering Stock ID manually.');
    }
  };

  const handleScannedResult = (text: string) => {
    const raw = text.trim();
    let targetId = raw;

    if (raw.includes('#machine=')) {
      targetId = raw.split('#machine=')[1];
    } else {
      const match = raw.match(/WM-?\d+/i);
      if (match) {
        targetId = match[0];
      }
    }

    const inventory = getInventory();
    const cleanId = targetId.trim().toUpperCase();

    // Match by Stock ID or Serial Number or ID
    const found = inventory.find(
      m => m.stockId.toUpperCase() === cleanId ||
           (m.serialNumber && m.serialNumber.toUpperCase() === cleanId) ||
           m.id === cleanId
    );

    if (found) {
      onSelectMachine(found.stockId);
      onClose();
    } else {
      setErrorMessage(`No washing machine found matching Stock ID / Serial "${cleanId}".`);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStockId.trim()) return;
    handleScannedResult(manualStockId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Scan Machine Stock QR
          </h3>
        </div>

        {/* QR Camera Reader Box */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900 min-h-[220px] flex items-center justify-center border border-slate-700">
          <div id="qr-reader-element" className="w-full" ref={qrRegionRef} />
          {!isScanning && !errorMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
              <Camera className="w-8 h-8 mb-2 animate-pulse text-teal-400" />
              <p className="text-xs">Initializing camera feed...</p>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
            {errorMessage}
          </div>
        )}

        {/* Upload QR File option */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Upload QR Image
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Manual Stock ID Entry */}
        <form onSubmit={handleManualSubmit} className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Or Enter Stock ID Manually
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={manualStockId}
                onChange={(e) => setManualStockId(e.target.value)}
                placeholder="e.g. WM-0001"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Go
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
