import React, { useState } from 'react';
import { Users, Search, User, X, DollarSign } from 'lucide-react';
import type { Customer, SaleRecord } from '../../types';
import { getSales } from '../../services/store';

interface CustomerListProps {
  customers: Customer[];
  sales?: SaleRecord[];
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  onSelectSale?: (invoiceNumber: string) => void;
  onViewInvoice?: (sale: SaleRecord) => void;
  onRecordPayment?: (sale: SaleRecord) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  searchTerm: propSearchTerm = '',
  onSearchChange,
  onSelectSale,
  onViewInvoice,
  onRecordPayment
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const searchTerm = propSearchTerm || localSearchTerm;

  const handleSearchChange = (val: string) => {
    setLocalSearchTerm(val);
    if (onSearchChange) onSearchChange(val);
  };

  const sales = getSales();

  const filteredCustomers = customers.filter((c) => {
    const query = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query) ||
      c.customerId.toLowerCase().includes(query) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.address && c.address.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Customer Management ({customers.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Search buyers by customer name, phone number, address, or customer ID.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card-panel p-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search Customer Name, Phone, Address, ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Desktop Data Table */}
      <div className="hidden md:block card-panel overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No customer records found matching search.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name & Contact</th>
                <th>Address</th>
                <th>Total Spent (₹)</th>
                <th>Pending Amount (₹)</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td>
                    <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">
                      {c.customerId}
                    </span>
                  </td>
                  <td>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{c.name}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{c.phone}</span>
                  </td>
                  <td className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {c.address || 'N/A'}
                  </td>
                  <td className="font-bold text-xs text-slate-900 dark:text-white">
                    ₹{c.totalSpent.toLocaleString('en-IN')}
                  </td>
                  <td className="font-bold text-xs">
                    <span className={c.pendingAmount > 0 ? 'text-amber-600 font-mono' : 'text-slate-400'}>
                      ₹{c.pendingAmount.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg"
                    >
                      History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Customer Cards */}
      <div className="md:hidden space-y-3">
        {filteredCustomers.map((c) => (
          <div key={c.id} className="card-panel p-3.5 space-y-2 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">{c.customerId}</span>
              <span className="font-bold text-xs text-slate-900 dark:text-white">{c.name}</span>
            </div>
            <p className="text-xs text-slate-500 font-mono">{c.phone}</p>
            {c.address && <p className="text-[11px] text-slate-400">{c.address}</p>}

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Spent: ₹{c.totalSpent.toLocaleString('en-IN')}</span>
              </div>
              <button
                onClick={() => setSelectedCustomer(c)}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg"
              >
                View History
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Detail & Purchase History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedCustomer.name} ({selectedCustomer.customerId})
                </h3>
                <p className="text-xs text-slate-500 font-mono">{selectedCustomer.phone}</p>
              </div>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs space-y-1 border border-slate-200 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-300">
                  <span className="font-bold">Address: </span>
                  {selectedCustomer.address || 'N/A'}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 font-bold">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">Total Spent</span>
                    <span className="text-slate-900 dark:text-white">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">Pending Balance</span>
                    <span className="text-amber-600">₹{selectedCustomer.pendingAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Purchase & Invoice History
              </h4>

              <div className="space-y-2">
                {sales.filter(s => s.customerPhone.trim() === selectedCustomer.phone.trim() || s.customerId === selectedCustomer.id).length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No invoice history found for this customer.</p>
                ) : (
                  sales
                    .filter(s => s.customerPhone.trim() === selectedCustomer.phone.trim() || s.customerId === selectedCustomer.id)
                    .map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedCustomer(null);
                          if (onViewInvoice) onViewInvoice(s);
                          else if (onSelectSale) onSelectSale(s.invoiceNumber);
                        }}
                        className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{s.invoiceNumber}</span>
                            <span className="text-slate-500">{s.saleDate}</span>
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{s.machineBrand} {s.machineModel}</p>
                        </div>
                        <div className="flex items-center gap-2 text-right">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">₹{s.finalAmount.toLocaleString('en-IN')}</span>
                            {s.balanceDue > 0 ? (
                              <span className="text-[10px] text-amber-600 font-bold block">Due: ₹{s.balanceDue.toLocaleString('en-IN')}</span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-semibold block">Paid</span>
                            )}
                          </div>
                          {s.balanceDue > 0 && onRecordPayment && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomer(null);
                                onRecordPayment(s);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm"
                            >
                              <DollarSign className="w-3 h-3" /> Pay
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

