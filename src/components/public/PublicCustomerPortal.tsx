import React, { useState, useEffect } from 'react';
import { Logo } from '../common/Logo';
import { Phone, MapPin, MessageCircle, Clock, ShieldCheck, Lock, Search, FileText, ChevronRight } from 'lucide-react';
import type { BusinessSettings, SaleRecord, RepairRecord, SparePartSaleRecord } from '../../types';
import { getRepairRecords, getSparePartSales } from '../../services/store';
import { InvoiceView } from '../invoices/InvoiceView';
import { RepairInvoiceModal } from '../repair/RepairInvoiceModal';
import { SparePartInvoiceModal } from '../spareparts/SparePartInvoiceModal';

export interface SearchResultItem {
  id: string;
  type: 'sale' | 'repair' | 'spare_part';
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  date: string;
  title: string;
  subtitle: string;
  totalAmount: number;
  balanceDue: number;
  paymentStatus: string;
  rawRecord: SaleRecord | RepairRecord | SparePartSaleRecord;
}

interface PublicCustomerPortalProps {
  settings: BusinessSettings;
  sales: SaleRecord[];
  activeInvoiceNumber?: string | null;
  onOpenLoginModal: () => void;
  onClearInvoiceQuery?: () => void;
}

export const PublicCustomerPortal: React.FC<PublicCustomerPortalProps> = ({
  settings,
  sales,
  activeInvoiceNumber,
  onOpenLoginModal,
  onClearInvoiceQuery
}) => {
  const [repairs] = useState<RepairRecord[]>(() => getRepairRecords());
  const [sparePartSales] = useState<SparePartSaleRecord[]>(() => getSparePartSales());

  const [searchInvoiceQuery, setSearchInvoiceQuery] = useState(activeInvoiceNumber || '');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResultItem | null>(null);

  const performSearch = (query: string): SearchResultItem[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const items: SearchResultItem[] = [];

    // 1. Search Machine Sales
    sales.forEach(s => {
      if (
        s.invoiceNumber.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.customerPhone.includes(q)
      ) {
        items.push({
          id: s.id,
          type: 'sale',
          invoiceNumber: s.invoiceNumber,
          customerName: s.customerName,
          customerPhone: s.customerPhone,
          date: s.saleDate,
          title: `Machine Sale: ${s.machineBrand || ''} ${s.machineModel || ''}`,
          subtitle: `${s.warrantyDays || 30} Days Warranty`,
          totalAmount: s.finalAmount,
          balanceDue: s.balanceDue,
          paymentStatus: s.paymentStatus,
          rawRecord: s
        });
      }
    });

    // 2. Search Repairing Records
    repairs.forEach(r => {
      if (
        r.invoiceNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        (r.customerPhone && r.customerPhone.includes(q))
      ) {
        items.push({
          id: r.id,
          type: 'repair',
          invoiceNumber: r.invoiceNumber,
          customerName: r.customerName,
          customerPhone: r.customerPhone || 'N/A',
          date: r.repairDate,
          title: `Repairing & Service: ${r.machineDetails}`,
          subtitle: r.issueDescription,
          totalAmount: r.totalAmount,
          balanceDue: r.balanceDue,
          paymentStatus: r.paymentStatus,
          rawRecord: r
        });
      }
    });

    // 3. Search Spare Part Sales
    sparePartSales.forEach(sp => {
      if (
        sp.invoiceNumber.toLowerCase().includes(q) ||
        sp.customerName.toLowerCase().includes(q) ||
        (sp.customerPhone && sp.customerPhone.includes(q))
      ) {
        items.push({
          id: sp.id,
          type: 'spare_part',
          invoiceNumber: sp.invoiceNumber,
          customerName: sp.customerName,
          customerPhone: sp.customerPhone || 'N/A',
          date: sp.saleDate,
          title: `Spare Parts Purchase (${sp.items?.length || 0} items)`,
          subtitle: sp.items?.map(i => i.partName).join(', ') || 'Counter Spare Parts Sale',
          totalAmount: sp.totalAmount,
          balanceDue: sp.balanceDue,
          paymentStatus: sp.paymentStatus,
          rawRecord: sp
        });
      }
    });

    return items;
  };

  useEffect(() => {
    if (activeInvoiceNumber) {
      const results = performSearch(activeInvoiceNumber);
      setSearchResults(results);
      setHasSearched(true);
      if (results.length === 1) {
        setSelectedResult(results[0]);
      }
    }
  }, [activeInvoiceNumber]);

  const handleSearchInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInvoiceQuery.trim()) return;

    const results = performSearch(searchInvoiceQuery);
    setSearchResults(results);
    setHasSearched(true);
    if (results.length === 1) {
      setSelectedResult(results[0]);
    } else {
      setSelectedResult(null);
    }
  };

  // Format WhatsApp Link
  const whatsappNumberClean = (settings.whatsapp || settings.phone).replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumberClean}?text=${encodeURIComponent("Hello Hatimi Washing Machine Hub, I have an inquiry regarding refurbished washing machines.")}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-teal-500 selection:text-white">
      {/* Header Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo variant="light" size="sm" showSubtitle={true} />

          <div className="flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              WhatsApp Us
            </a>
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              Staff Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Public Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Active Modal Views */}
        {selectedResult?.type === 'sale' && (
          <InvoiceView
            sale={selectedResult.rawRecord as SaleRecord}
            isOpen={true}
            onClose={() => {
              setSelectedResult(null);
              if (onClearInvoiceQuery) onClearInvoiceQuery();
            }}
          />
        )}

        {selectedResult?.type === 'repair' && (
          <RepairInvoiceModal
            isOpen={true}
            repairRecord={selectedResult.rawRecord as RepairRecord}
            settings={settings}
            onClose={() => {
              setSelectedResult(null);
              if (onClearInvoiceQuery) onClearInvoiceQuery();
            }}
          />
        )}

        {selectedResult?.type === 'spare_part' && (
          <SparePartInvoiceModal
            isOpen={true}
            saleRecord={selectedResult.rawRecord as SparePartSaleRecord}
            settings={settings}
            onClose={() => {
              setSelectedResult(null);
              if (onClearInvoiceQuery) onClearInvoiceQuery();
            }}
          />
        )}

        {/* Hero Banner Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden text-center sm:text-left">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full text-xs font-bold uppercase tracking-wider text-teal-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Appliance Specialist
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Welcome to <br />
              <span className="text-teal-400">{settings.shopName}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Certified refurbished washing machines, fully tested, chemically sanitized with up to 90 days warranty & free door delivery.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp ({settings.whatsapp || settings.phone})
              </a>
              <a
                href={`tel:${settings.phone}`}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-teal-400" />
                Call Shop: {settings.phone}
              </a>
            </div>
          </div>
        </section>

        {/* Public Invoice & Receipt Lookup Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <FileText className="w-5 h-5 text-teal-400" />
            Customer Invoice & Receipt Lookup
          </div>
          <p className="text-xs text-slate-400">
            Search your receipts by entering your <strong>Customer Name</strong>, <strong>Phone Number</strong>, or <strong>Invoice Number</strong>:
          </p>

          <form onSubmit={handleSearchInvoice} className="flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInvoiceQuery}
                onChange={(e) => setSearchInvoiceQuery(e.target.value)}
                placeholder="Enter Customer Name, Phone (e.g. 98200) or Invoice #"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              className="py-2 px-5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-colors shrink-0"
            >
              Search Receipts
            </button>
          </form>

          {/* Results List */}
          {hasSearched && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-teal-400 font-bold border-b border-slate-800 pb-2">
                <span>
                  {searchResults.length === 0
                    ? `No receipts found matching "${searchInvoiceQuery}"`
                    : `Found ${searchResults.length} Receipt(s) for "${searchInvoiceQuery}"`}
                </span>
                <button
                  onClick={() => {
                    setHasSearched(false);
                    setSearchResults([]);
                    setSelectedResult(null);
                    setSearchInvoiceQuery('');
                  }}
                  className="text-slate-400 hover:text-white underline font-normal"
                >
                  Clear Search
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedResult(item)}
                      className="bg-slate-950 border border-slate-800 hover:border-teal-500/50 p-4 rounded-xl cursor-pointer transition-all hover:bg-slate-900 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.type === 'repair'
                                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                                : item.type === 'sale'
                                ? 'bg-teal-950 text-teal-400 border border-teal-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {item.type === 'repair'
                              ? '🛠️ Repair Bill'
                              : item.type === 'sale'
                              ? '🧺 Machine Invoice'
                              : '🔧 Spare Parts'}
                          </span>
                          <span className="font-mono font-bold text-xs text-white">{item.invoiceNumber}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-teal-400 shrink-0">
                          ₹{item.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="mt-2">
                        <h4 className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors">
                          {item.customerName}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono">{item.customerPhone}</p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span className="text-[11px] truncate max-w-[220px]">{item.title}</span>
                        <span className="text-teal-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
                          View Receipt <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Store Information Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Shop Location</h3>
            <p className="text-xs text-slate-400 leading-normal">{settings.address}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Working Hours</h3>
            <p className="text-xs text-slate-400">Monday – Sunday: 10:00 AM – 9:00 PM</p>
            <p className="text-[10px] text-teal-400 font-semibold">Open All 7 Days</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Privacy & Store Portal</h3>
            <p className="text-xs text-slate-400">
              Internal stock inventory, buying prices, and financial reports are restricted to authorized Hatimi staff members.
            </p>
            <button
              onClick={onOpenLoginModal}
              className="text-xs font-bold text-teal-400 hover:text-teal-300 underline block pt-1"
            >
              Authorized Staff Sign In →
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>© 2026 {settings.shopName}. All rights reserved.</p>
        <p className="text-[10px] text-slate-600 mt-1">Protected Store Management Portal</p>
      </footer>
    </div>
  );
};
