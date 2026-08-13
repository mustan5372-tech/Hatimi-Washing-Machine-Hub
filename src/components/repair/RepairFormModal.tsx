import React, { useState } from 'react';
import { X, CheckCircle, Wrench, Plus, Trash2, Hammer } from 'lucide-react';
import type { PaymentMethod, RepairSparePartItem } from '../../types';
import { createRepairRecord, getCustomers, getSpareParts } from '../../services/store';

interface RepairFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRecord: any) => void;
}

export const RepairFormModal: React.FC<RepairFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const catalogParts = getSpareParts();

  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [machineDetails, setMachineDetails] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [technicianName, setTechnicianName] = useState('');

  const [repairCost, setRepairCost] = useState('500');
  const [labourCharges, setLabourCharges] = useState('300');

  // Merged Spare Parts list
  const [spareParts, setSpareParts] = useState<RepairSparePartItem[]>([]);

  // Spare Part Selector Fields
  const [selectedCatalogPartId, setSelectedCatalogPartId] = useState('');
  const [customPartName, setCustomPartName] = useState('');
  const [customPartPrice, setCustomPartPrice] = useState('');
  const [customPartQty, setCustomPartQty] = useState('1');

  const [discount, setDiscount] = useState('0');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Auto-fill customer info if phone matches
  const handlePhoneChange = (phone: string) => {
    setCustomerPhone(phone);
    const existing = getCustomers().find((c) => c.phone.trim() === phone.trim());
    if (existing) {
      setCustomerName(existing.name);
      setCustomerAddress(existing.address || '');
    }
  };

  // Add Part to Repairing List
  const handleAddPartToRepair = () => {
    if (selectedCatalogPartId) {
      const p = catalogParts.find((item) => item.id === selectedCatalogPartId);
      if (p) {
        const qty = parseInt(customPartQty, 10) || 1;
        setSpareParts([
          ...spareParts,
          {
            partId: p.id,
            partNumber: p.partNumber,
            partName: p.name,
            quantity: qty,
            unitPrice: p.price,
            totalPrice: p.price * qty
          }
        ]);
        setSelectedCatalogPartId('');
        setCustomPartQty('1');
        return;
      }
    }

    if (customPartName.trim()) {
      const price = parseFloat(customPartPrice) || 0;
      const qty = parseInt(customPartQty, 10) || 1;
      setSpareParts([
        ...spareParts,
        {
          partName: customPartName.trim(),
          quantity: qty,
          unitPrice: price,
          totalPrice: price * qty
        }
      ]);
      setCustomPartName('');
      setCustomPartPrice('');
      setCustomPartQty('1');
    }
  };

  const handleRemovePart = (idx: number) => {
    setSpareParts(spareParts.filter((_, i) => i !== idx));
  };

  // Calculate Totals
  const numRepairCost = parseFloat(repairCost) || 0;
  const numLabourCharges = parseFloat(labourCharges) || 0;
  const numPartsCost = spareParts.reduce((sum, item) => sum + item.totalPrice, 0);
  const subtotal = numRepairCost + numLabourCharges + numPartsCost;
  const numDiscount = parseFloat(discount) || 0;
  const totalAmount = Math.max(0, subtotal - numDiscount);
  const numPaid = amountPaid !== '' ? parseFloat(amountPaid) || 0 : totalAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim() || !customerName.trim()) {
      setError('Please provide Customer Phone and Name.');
      return;
    }
    if (!machineDetails.trim() || !issueDescription.trim()) {
      setError('Please specify Machine Details and Issue Description.');
      return;
    }

    try {
      const record = createRepairRecord({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        machineDetails: machineDetails.trim(),
        issueDescription: issueDescription.trim(),
        technicianName: technicianName.trim() || 'Hatimi Admin',
        repairCost: numRepairCost,
        labourCharges: numLabourCharges,
        spareParts,
        discount: numDiscount,
        amountPaid: numPaid,
        paymentMethod
      });

      onSuccess(record);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create repairing bill.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 rounded-xl">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">New Repairing & Service Bill</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Issue repair charges, labour fees & optional spare parts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 font-medium">
              {error}
            </div>
          )}

          {/* Section 1: Customer Details */}
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">1. Customer Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+91 98200 00000"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer Name"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Address / Area (Optional)
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Street / Area / City"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Machine & Work Description */}
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">2. Appliance & Repairing Work</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Machine Model & Brand *
                </label>
                <input
                  type="text"
                  required
                  value={machineDetails}
                  onChange={(e) => setMachineDetails(e.target.value)}
                  placeholder="e.g. LG 7.0kg Semi Automatic"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Technician / Engineer Name
                </label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  placeholder="e.g. Mustan Admin"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Issue / Work Performed Description *
                </label>
                <input
                  type="text"
                  required
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="e.g. Motor rewinding, gear box service & drum alignment"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Repair & Labour Costs */}
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">3. Repairing & Labour Charges</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Repairing Cost (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={repairCost}
                  onChange={(e) => setRepairCost(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Labour / Service Fees (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={labourCharges}
                  onChange={(e) => setLabourCharges(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Merged Spare Parts (Optional) */}
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-slate-400 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-amber-500" /> 4. Merge Spare Parts to Bill (Optional)
              </h3>
            </div>

            {/* Part Selection Form */}
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Select Catalog Spare Part</label>
                  <select
                    value={selectedCatalogPartId}
                    onChange={(e) => setSelectedCatalogPartId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                  >
                    <option value="">-- Choose from Catalog --</option>
                    {catalogParts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.partNumber}) - ₹{p.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={customPartQty}
                    onChange={(e) => setCustomPartQty(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              {!selectedCatalogPartId && (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <input
                      type="text"
                      placeholder="Or enter custom part name..."
                      value={customPartName}
                      onChange={(e) => setCustomPartName(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={customPartPrice}
                      onChange={(e) => setCustomPartPrice(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddPartToRepair}
                className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Attach Spare Part to Bill
              </button>
            </div>

            {/* List of attached parts */}
            {spareParts.length > 0 && (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {spareParts.map((sp, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{sp.partName}</span>
                      <span className="text-slate-400 ml-2">x{sp.quantity} @ ₹{sp.unitPrice}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{sp.totalPrice}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePart(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Financial Settlement */}
          <div className="space-y-3 p-4 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl border border-cyan-200 dark:border-cyan-800">
            <h3 className="font-bold uppercase tracking-wider text-[10px] text-cyan-800 dark:text-cyan-300">5. Settlement & Total Payment</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Paid (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder={`Default ₹${totalAmount}`}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-emerald-600"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-cyan-200 dark:border-cyan-900 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Total Billed Amount:</span>
              <span className="text-base font-black text-cyan-900 dark:text-cyan-300 font-mono">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-colors mt-2"
          >
            <CheckCircle className="w-4 h-4" /> Issue Repairing Bill & Generate Receipt
          </button>
        </form>
      </div>
    </div>
  );
};
