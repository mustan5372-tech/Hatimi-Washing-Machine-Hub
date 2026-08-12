import React, { useState } from 'react';
import { X, Layers, Plus, Trash2, CheckCircle2, Calculator } from 'lucide-react';
import type { MachineType, MachineCondition, PaymentMethod } from '../../types';
import { addBulkPurchaseRecords } from '../../services/store';

interface BulkPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface BulkRowItem {
  id: string;
  brand: string;
  model: string;
  capacityKg: number;
  type: MachineType;
  condition: MachineCondition;
  quantity: number;
  purchasePricePerUnit: number;
  sellingPricePerUnit: number;
}

export const BulkPurchaseModal: React.FC<BulkPurchaseModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [sellerName, setSellerName] = useState('Bulk Lot / Wholesale Purchase');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes] = useState('');

  const [items, setItems] = useState<BulkRowItem[]>([
    {
      id: 'item-1',
      brand: 'LG',
      model: 'Smart Inverter 7.0kg',
      capacityKg: 7.0,
      type: 'Fully Automatic',
      condition: 'Good',
      quantity: 2,
      purchasePricePerUnit: 5500,
      sellingPricePerUnit: 11000
    },
    {
      id: 'item-2',
      brand: 'Samsung',
      model: 'Wobble 6.5kg Top Load',
      capacityKg: 6.5,
      type: 'Fully Automatic',
      condition: 'Refurbished',
      quantity: 3,
      purchasePricePerUnit: 4200,
      sellingPricePerUnit: 8500
    }
  ]);

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        brand: 'LG',
        model: '',
        capacityKg: 7.0,
        type: 'Fully Automatic',
        condition: 'Good',
        quantity: 1,
        purchasePricePerUnit: 5000,
        sellingPricePerUnit: 9500
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof BulkRowItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const totalMachines = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const totalInvestment = items.reduce((sum, item) => sum + ((Number(item.purchasePricePerUnit) || 0) * (Number(item.quantity) || 1)), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    for (let i = 0; i < items.length; i++) {
      if (!items[i].model.trim()) {
        setError(`Row #${i + 1}: Please specify the model name.`);
        return;
      }
      if (items[i].purchasePricePerUnit <= 0) {
        setError(`Row #${i + 1}: Purchase price must be greater than 0.`);
        return;
      }
    }

    try {
      addBulkPurchaseRecords({
        sellerName,
        sellerPhone,
        sellerAddress,
        notes,
        paymentMethod,
        purchaseDate,
        items
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add bulk machines to stock.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-teal-900 text-white">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-300" />
            <div>
              <h3 className="text-base font-bold">Bulk Purchase & Inventory Stock Lot Entry</h3>
              <p className="text-[11px] text-teal-200">Add multiple machines at once without pre-assigned buyers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-teal-200 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium">
              {error}
            </div>
          )}

          {/* Supplier & Batch Information */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Batch Supplier & Purchase Details (Optional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Supplier / Seller Name
                </label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="e.g. Wholesale Dealer Mumbai"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Supplier Contact Phone
                </label>
                <input
                  type="text"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder="+91 98200 00000"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Machine Items Multi-Row Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                Bulk Machine Items ({items.length} Model Types)
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                + Add Another Model Row
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
              {items.map((item, index) => (
                <div key={item.id} className="p-3.5 bg-slate-50/50 dark:bg-slate-900/40 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[10px] rounded-md">
                      Model #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Row
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Brand</label>
                      <select
                        value={item.brand}
                        onChange={(e) => handleItemChange(item.id, 'brand', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                      >
                        <option value="LG">LG</option>
                        <option value="Samsung">Samsung</option>
                        <option value="Whirlpool">Whirlpool</option>
                        <option value="IFB">IFB</option>
                        <option value="Godrej">Godrej</option>
                        <option value="Bosch">Bosch</option>
                        <option value="Haier">Haier</option>
                        <option value="Panasonic">Panasonic</option>
                        <option value="Onida">Onida</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Model Name *</label>
                      <input
                        type="text"
                        required
                        value={item.model}
                        onChange={(e) => handleItemChange(item.id, 'model', e.target.value)}
                        placeholder="e.g. Smart Inverter 7.0kg"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Capacity (KG)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={item.capacityKg}
                        onChange={(e) => handleItemChange(item.id, 'capacityKg', parseFloat(e.target.value) || 7.0)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Type</label>
                      <select
                        value={item.type}
                        onChange={(e) => handleItemChange(item.id, 'type', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                      >
                        <option value="Fully Automatic">Fully Automatic</option>
                        <option value="Semi Automatic">Semi Automatic</option>
                        <option value="Front Load">Front Load</option>
                        <option value="Top Load">Top Load</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Quantity (Units)</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value, 10) || 1)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-teal-600 dark:text-teal-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Pur. Price / Unit (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        value={item.purchasePricePerUnit}
                        onChange={(e) => handleItemChange(item.id, 'purchasePricePerUnit', parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Selling Price / Unit (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={item.sellingPricePerUnit}
                        onChange={(e) => handleItemChange(item.id, 'sellingPricePerUnit', parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Condition</label>
                      <select
                        value={item.condition}
                        onChange={(e) => handleItemChange(item.id, 'condition', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                      >
                        <option value="Like New">Like New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Refurbished">Refurbished</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Summary Pill */}
          <div className="p-4 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  Total Bulk Stock Units: <span className="text-teal-600 dark:text-teal-400 font-extrabold">{totalMachines} Machines</span>
                </p>
                <p className="text-[11px] text-slate-500">Auto-generates individual Stock IDs and assigns price-based warranty tiers</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Investment</span>
              <span className="text-lg font-black text-teal-700 dark:text-teal-300">
                ₹{totalInvestment.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Batch Add {totalMachines} Machine(s) To Stock
          </button>
        </div>
      </div>
    </div>
  );
};
