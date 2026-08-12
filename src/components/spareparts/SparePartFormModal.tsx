import React, { useState, useEffect } from 'react';
import { X, Wrench, Save } from 'lucide-react';
import type { SparePart, SparePartCategory } from '../../types';
import { generateNextSparePartNumber, saveSparePart } from '../../services/store';

interface SparePartFormModalProps {
  isOpen: boolean;
  editingPart: SparePart | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const SparePartFormModal: React.FC<SparePartFormModalProps> = ({
  isOpen,
  editingPart,
  onClose,
  onSuccess
}) => {
  const [partNumber, setPartNumber] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SparePartCategory>('Buffer & Rubber');
  const [price, setPrice] = useState('250');
  const [brandCompatibility, setBrandCompatibility] = useState('Universal');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingPart) {
        setPartNumber(editingPart.partNumber);
        setName(editingPart.name);
        setCategory(editingPart.category);
        setPrice(editingPart.price.toString());
        setBrandCompatibility(editingPart.brandCompatibility || 'Universal');
        setDescription(editingPart.description || '');
        setImageUrl(editingPart.imageUrl || '');
      } else {
        setPartNumber(generateNextSparePartNumber());
        setName('');
        setCategory('Buffer & Rubber');
        setPrice('250');
        setBrandCompatibility('Universal / LG / Samsung');
        setDescription('');
        setImageUrl('');
      }
      setError('');
    }
  }, [isOpen, editingPart]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enterSpare Part Name.');
      return;
    }
    const numPrice = parseFloat(price) || 0;
    if (numPrice <= 0) {
      setError('Price must be greater than 0.');
      return;
    }

    try {
      const partRecord: SparePart = {
        id: editingPart ? editingPart.id : `sp-${Date.now()}`,
        partNumber: partNumber.trim().toUpperCase(),
        name: name.trim(),
        category,
        price: numPrice,
        totalSold: editingPart ? editingPart.totalSold : 0,
        isUnlimited: true,
        brandCompatibility: brandCompatibility.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
        createdAt: editingPart ? editingPart.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveSparePart(partRecord);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save spare part.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingPart ? `Edit Part ${editingPart.partNumber}` : 'Add New Spare Part Item'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Part Code (Auto) *
              </label>
              <input
                type="text"
                required
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="Buffer & Rubber">Buffer & Rubber</option>
                <option value="Drum & Tub">Drum & Tub</option>
                <option value="Electrical & Timer">Electrical & Timer</option>
                <option value="Motors & Gearbox">Motors & Gearbox</option>
                <option value="Valves & Hoses">Valves & Hoses</option>
                <option value="General Spare">General Spare</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Part Name (e.g. Buffer Seal, Drier Drum, Wash Motor) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Spin Tub Rubber Buffer Seal"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Brand Compatibility
              </label>
              <input
                type="text"
                value={brandCompatibility}
                onChange={(e) => setBrandCompatibility(e.target.value)}
                placeholder="e.g. Universal / LG / Samsung"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description & Specifications
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Technical specs, material, or fitment details..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
            ℹ️ <strong>Stock Policy:</strong> All spare parts are listed as <strong>Unlimited Stock</strong> by default. The system tracks the cumulative <strong>Units Sold</strong> counter for inventory reporting.
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
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            {editingPart ? 'Update Spare Part' : 'Save Spare Part'}
          </button>
        </div>
      </div>
    </div>
  );
};
