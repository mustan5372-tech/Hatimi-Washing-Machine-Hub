import React, { useState } from 'react';
import { Hammer, Plus, Search, Filter, Wrench, Trash2, CheckCircle2, AlertCircle, Phone, FileText, Pencil, ShieldCheck, User } from 'lucide-react';
import type { RepairRecord, BusinessSettings, UserProfile } from '../../types';
import { getRepairRecords, deleteRepairRecord, getCurrentUser } from '../../services/store';
import { RepairFormModal } from './RepairFormModal';
import { RepairInvoiceModal } from './RepairInvoiceModal';

interface RepairOverviewProps {
  settings: BusinessSettings;
  currentUser?: UserProfile;
}

export const RepairOverview: React.FC<RepairOverviewProps> = ({ settings, currentUser }) => {
  const activeUser = currentUser || getCurrentUser();
  const userEmail = (activeUser?.email || '').toLowerCase();
  const isSuperAdmin = userEmail === 'mustan5372@gmail.com';

  const [repairs, setRepairs] = useState<RepairRecord[]>(getRepairRecords());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Partially Paid' | 'Unpaid'>('All');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RepairRecord | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<RepairRecord | null>(null);

  const refreshData = () => {
    setRepairs(getRepairRecords());
  };

  const handleDelete = (id: string, inv: string) => {
    if (confirm(`Are you sure you want to delete repairing record #${inv}?`)) {
      deleteRepairRecord(id);
      refreshData();
    }
  };

  // Permission Filter: mustan5372@gmail.com views ALL repair billings, remaining accounts view ONLY their own
  const userVisibleRepairs = repairs.filter((r) => {
    if (isSuperAdmin) return true;
    const rEmail = (r.createdByEmail || '').toLowerCase();
    const rUser = r.createdBy;
    return (rEmail && rEmail === userEmail) || (rUser && rUser === activeUser.id);
  });

  // Search & Status Filter logic
  const filtered = userVisibleRepairs.filter((r) => {
    const matchesSearch =
      r.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerPhone.includes(searchQuery) ||
      r.machineDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.issueDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (isSuperAdmin && (r.createdByName?.toLowerCase().includes(searchQuery.toLowerCase()) || r.createdByEmail?.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesStatus = statusFilter === 'All' || r.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI calculations based on visible repairs
  const totalRepairsCount = userVisibleRepairs.length;
  const totalRevenue = userVisibleRepairs.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalLabour = userVisibleRepairs.reduce((sum, r) => sum + r.labourCharges, 0);
  const pendingBalance = userVisibleRepairs.reduce((sum, r) => sum + r.balanceDue, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 rounded-xl">
            <Hammer className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Repairing & Service Billing
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate repairing cost bills, labour charges & merged spare parts invoices
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingRecord(null);
            setIsFormOpen(true);
          }}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-cyan-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Issue Repairing Bill
        </button>
      </div>

      {/* Account Visibility Banner */}
      {isSuperAdmin ? (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span><strong>Super Admin Mode (mustan5372@gmail.com):</strong> You are viewing all repair billings created by all accounts.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 rounded-xl text-xs font-semibold border border-cyan-200 dark:border-cyan-800">
          <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span><strong>Personal Account View ({activeUser.email}):</strong> Displaying repair billings created by your account.</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Repairs Done
          </span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {totalRepairsCount} <span className="text-xs font-normal text-slate-500">jobs</span>
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Repairing Revenue
          </span>
          <p className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-1 font-mono">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Labour Fees
          </span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            ₹{totalLabour.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Outstanding Due
          </span>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
            ₹{pendingBalance.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={isSuperAdmin ? "Search invoice, customer, creator..." : "Search invoice, customer, machine..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          >
            <option value="All">All Invoices</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            No repair bills found matching search query.
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
            >
              {/* Header: Customer Name & Big Amount */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {r.customerName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    {r.customerPhone || 'N/A'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-cyan-600 dark:text-cyan-400 font-mono block">
                    ₹{r.totalAmount.toLocaleString('en-IN')}
                  </span>
                  {r.balanceDue > 0 ? (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                      Due: ₹{r.balanceDue}
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                      Fully Paid
                    </span>
                  )}
                </div>
              </div>

              {/* Sub-header: Invoice #, Date, Creator tag, Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md">
                    {r.invoiceNumber}
                  </span>
                  <span className="text-slate-400 font-mono">{r.repairDate}</span>
                  {isSuperAdmin && (
                    <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      By: {r.createdByName || r.createdByEmail || 'Admin'}
                    </span>
                  )}
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    r.paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : r.paymentStatus === 'Partially Paid'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                  }`}
                >
                  {r.paymentStatus === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {r.paymentStatus}
                </span>
              </div>

              {/* Appliance Details */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl text-xs space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">{r.machineDetails}</p>
                <p className="text-[11px] text-slate-500">{r.issueDescription}</p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-200/50 dark:border-slate-800">
                  <span>Repair: ₹{r.repairCost} {r.labourCharges > 0 && `+ ₹${r.labourCharges} Labour`}</span>
                  {r.spareParts && r.spareParts.length > 0 && (
                    <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                      <Wrench className="w-3 h-3" /> {r.spareParts.length} parts
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setActiveInvoice(r)}
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4" /> View / Share Bill
                </button>
                <button
                  onClick={() => {
                    setEditingRecord(r);
                    setIsFormOpen(true);
                  }}
                  className="px-3 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  title="Edit Record"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(r.id, r.invoiceNumber)}
                  className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  title="Delete Bill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Repairs Table (Desktop View) */}
      <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">Invoice #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Appliance & Service</th>
                {isSuperAdmin && <th className="p-3">Issued By</th>}
                <th className="p-3 text-right">Labour & Repair</th>
                <th className="p-3 text-right">Total Amount</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 9 : 8} className="p-8 text-center text-slate-400">
                    No repair bills found matching search query.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {r.invoiceNumber}
                    </td>

                    <td className="p-3 text-slate-500 font-mono">
                      {r.repairDate}
                    </td>

                    <td className="p-3">
                      <p className="font-bold text-slate-900 dark:text-white">{r.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {r.customerPhone || 'N/A'}
                      </p>
                    </td>

                    <td className="p-3 max-w-xs">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{r.machineDetails}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{r.issueDescription}</p>
                      {r.spareParts && r.spareParts.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-semibold mt-0.5">
                          <Wrench className="w-3 h-3" /> {r.spareParts.length} parts merged
                        </span>
                      )}
                    </td>

                    {isSuperAdmin && (
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-md font-semibold text-[11px] border border-slate-200 dark:border-slate-700">
                          <User className="w-3 h-3 text-cyan-500" />
                          {r.createdByName || r.createdByEmail || 'Admin'}
                        </span>
                      </td>
                    )}

                    <td className="p-3 text-right font-mono">
                      <span className="text-slate-600 dark:text-slate-400">₹{r.repairCost}</span>
                      {r.labourCharges > 0 && (
                        <span className="block text-[10px] text-emerald-600">+ ₹{r.labourCharges} labour</span>
                      )}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{r.totalAmount.toLocaleString('en-IN')}
                      {r.balanceDue > 0 && (
                        <span className="block text-[10px] text-amber-600">Due: ₹{r.balanceDue}</span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : r.paymentStatus === 'Partially Paid'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                        }`}
                      >
                        {r.paymentStatus === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {r.paymentStatus}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveInvoice(r)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          title="View / Print Receipt & Share WhatsApp"
                        >
                          <FileText className="w-3.5 h-3.5 text-cyan-500" /> Receipt
                        </button>
                        <button
                          onClick={() => {
                            setEditingRecord(r);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg"
                          title="Edit Repair Record"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id, r.invoiceNumber)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                          title="Delete Bill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <RepairFormModal
        isOpen={isFormOpen}
        editRecord={editingRecord}
        currentUser={activeUser}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRecord(null);
        }}
        onSuccess={(savedRecord) => {
          refreshData();
          setActiveInvoice(savedRecord);
        }}
      />

      {/* Invoice View Modal */}
      <RepairInvoiceModal
        isOpen={!!activeInvoice}
        repairRecord={activeInvoice}
        settings={settings}
        onClose={() => setActiveInvoice(null)}
      />
    </div>
  );
};

