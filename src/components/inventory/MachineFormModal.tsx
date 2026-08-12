import React, { useState, useEffect } from 'react';
import { X, Package, Save, Calculator, Plus, Trash2 } from 'lucide-react';
import type { InventoryMachine, MachineType, MachineCondition, MachineStatus } from '../../types';
import { generateNextStockId, generateNextSerialNumber, saveMachine } from '../../services/store';

interface MachineFormModalProps {
  isOpen: boolean;
  editingMachine: InventoryMachine | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const MachineFormModal: React.FC<MachineFormModalProps> = ({
  isOpen,
  editingMachine,
  onClose,
  onSuccess
}) => {
  const [stockId, setStockId] = useState('');
  const [brand, setBrand] = useState('LG');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [capacityKg, setCapacityKg] = useState('7.0');
  const [type, setType] = useState<MachineType>('Fully Automatic');
  const [loadingType, setLoadingType] = useState<'Top Load' | 'Front Load'>('Top Load');
  const [color, setColor] = useState('Silver');
  
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchasePrice, setPurchasePrice] = useState('6000');
  const [repairExpenses, setRepairExpenses] = useState('0');
  const [cleaningExpenses, setCleaningExpenses] = useState('200');
  const [transportExpenses, setTransportExpenses] = useState('300');
  const [otherExpenses, setOtherExpenses] = useState('0');

  const [sellingPrice, setSellingPrice] = useState('11000');
  const [minSellingPrice, setMinSellingPrice] = useState('10000');
  const [condition, setCondition] = useState<MachineCondition>('Good');
  const [warrantyDays, setWarrantyDays] = useState('30');
  const [status, setStatus] = useState<MachineStatus>('Available');
  const [description, setDescription] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingMachine) {
        setStockId(editingMachine.stockId);
        setBrand(editingMachine.brand);
        setModel(editingMachine.model);
        setSerialNumber(editingMachine.serialNumber || '');
        setCapacityKg(editingMachine.capacityKg.toString());
        setType(editingMachine.type);
        setLoadingType(editingMachine.loadingType);
        setColor(editingMachine.color || 'Silver');
        setPurchaseDate(editingMachine.purchaseDate);
        setPurchasePrice(editingMachine.purchasePrice.toString());
        setRepairExpenses(editingMachine.repairExpenses.toString());
        setCleaningExpenses(editingMachine.cleaningExpenses.toString());
        setTransportExpenses(editingMachine.transportExpenses.toString());
        setOtherExpenses(editingMachine.otherExpenses.toString());
        setSellingPrice(editingMachine.sellingPrice.toString());
        setMinSellingPrice(editingMachine.minSellingPrice.toString());
        setCondition(editingMachine.condition);
        setWarrantyDays(editingMachine.warrantyDays.toString());
        setStatus(editingMachine.status);
        setDescription(editingMachine.description || '');
        setSellerName(editingMachine.sellerName || '');
        setSellerPhone(editingMachine.sellerPhone || '');
        setPhotos(editingMachine.photos || []);
      } else {
        // New machine
        setStockId(generateNextStockId());
        setBrand('LG');
        setModel('');
        setSerialNumber(generateNextSerialNumber());
        setCapacityKg('7.0');
        setType('Fully Automatic');
        setLoadingType('Top Load');
        setColor('Silver');
        setPurchaseDate(new Date().toISOString().split('T')[0]);
        setPurchasePrice('6000');
        setRepairExpenses('0');
        setCleaningExpenses('200');
        setTransportExpenses('300');
        setOtherExpenses('0');
        setSellingPrice('11000');
        setMinSellingPrice('10000');
        setCondition('Good');
        setWarrantyDays('30');
        setStatus('Available');
        setDescription('');
        setSellerName('');
        setSellerPhone('');
        setPhotos(['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80']);
      }
      setError('');
    }
  }, [isOpen, editingMachine]);

  // Derived Calculations
  const numPur = parseFloat(purchasePrice) || 0;
  const numRep = parseFloat(repairExpenses) || 0;
  const numClean = parseFloat(cleaningExpenses) || 0;
  const numTrans = parseFloat(transportExpenses) || 0;
  const numOth = parseFloat(otherExpenses) || 0;
  const calculatedTotalCost = numPur + numRep + numClean + numTrans + numOth;
  
  const numSell = parseFloat(sellingPrice) || 0;
  const expectedProfit = numSell - calculatedTotalCost;
  const profitMarginPct = numSell > 0 ? ((expectedProfit / numSell) * 100).toFixed(1) : '0.0';

  if (!isOpen) return null;

  const handleAddPhoto = () => {
    if (!photoUrlInput.trim()) return;
    setPhotos([...photos, photoUrlInput.trim()]);
    setPhotoUrlInput('');
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim()) {
      setError('Please enter Machine Model name.');
      return;
    }
    if (calculatedTotalCost <= 0) {
      setError('Total cost must be greater than 0.');
      return;
    }

    try {
      const machineRecord: InventoryMachine = {
        id: editingMachine ? editingMachine.id : `mach-${Date.now()}`,
        stockId: stockId.trim().toUpperCase(),
        brand,
        model: model.trim(),
        serialNumber: serialNumber.trim(),
        capacityKg: parseFloat(capacityKg) || 7.0,
        type,
        loadingType,
        color: color.trim(),
        purchaseDate,
        purchasePrice: numPur,
        repairExpenses: numRep,
        cleaningExpenses: numClean,
        transportExpenses: numTrans,
        otherExpenses: numOth,
        totalCost: calculatedTotalCost,
        sellingPrice: numSell,
        minSellingPrice: parseFloat(minSellingPrice) || numSell * 0.9,
        condition,
        warrantyDays: parseInt(warrantyDays, 10) || 30,
        description: description.trim(),
        photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80'],
        sellerName: sellerName.trim(),
        sellerPhone: sellerPhone.trim(),
        status,
        createdAt: editingMachine ? editingMachine.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveMachine(machineRecord);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save inventory record.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingMachine ? `Edit Stock Item ${editingMachine.stockId}` : 'Add New Washing Machine Stock'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Section 1: Basic Identification & Specifications */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 border-b border-slate-200 dark:border-slate-700 pb-1">
              1. Machine Identification & Specifications
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Stock ID (Auto) *
                </label>
                <input
                  type="text"
                  required
                  value={stockId}
                  onChange={(e) => setStockId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Brand *
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
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
                  <option value="Other">Other Brand</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Model Name / Number *
                </label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Smart Inverter 7.0kg"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Capacity (KG) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={capacityKg}
                  onChange={(e) => setCapacityKg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Washer Type *
                </label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                >
                  <option value="Fully Automatic">Fully Automatic</option>
                  <option value="Semi Automatic">Semi Automatic</option>
                  <option value="Front Load">Front Load</option>
                  <option value="Top Load">Top Load</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Loading Style *
                </label>
                <select
                  value={loadingType}
                  onChange={(e: any) => setLoadingType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                >
                  <option value="Top Load">Top Load</option>
                  <option value="Front Load">Front Load</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Serial Number
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. SN-984311"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Acquisition & Cost Calculation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 border-b border-slate-200 dark:border-slate-700 pb-1">
              2. Purchase Price & Refurbishing Expenses (Cost Breakdown)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Purchase Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Repair Expense (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={repairExpenses}
                  onChange={(e) => setRepairExpenses(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cleaning (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={cleaningExpenses}
                  onChange={(e) => setCleaningExpenses(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Transport (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={transportExpenses}
                  onChange={(e) => setTransportExpenses(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Other Cost (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={otherExpenses}
                  onChange={(e) => setOtherExpenses(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>
            </div>

            {/* Total Cost Display Box */}
            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Calculated Total Acquisition Cost:
                </span>
              </div>
              <span className="text-base font-black text-teal-700 dark:text-teal-300">
                ₹{calculatedTotalCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Section 3: Selling Price & Status */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 border-b border-slate-200 dark:border-slate-700 pb-1">
              3. Selling Price & Stock Status
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Selling Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Min Selling Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={minSellingPrice}
                  onChange={(e) => setMinSellingPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e: any) => setCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
                >
                  <option value="Like New">Like New</option>
                  <option value="Good">Good Condition</option>
                  <option value="Fair">Fair</option>
                  <option value="Refurbished">Refurbished</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Stock Status *
                </label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:border-teal-500"
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Under Repair">Under Repair</option>
                  <option value="Pending Inspection">Pending Inspection</option>
                  <option value="Sold">Sold</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>
            </div>

            {/* Expected Profit Calculation Banner */}
            <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Expected Gross Profit:
              </span>
              <div className="flex items-center gap-3 font-bold">
                <span className={expectedProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}>
                  ₹{expectedProfit.toLocaleString('en-IN')}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px]">
                  {profitMarginPct}% Margin
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Machine Description & Seller Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 border-b border-slate-200 dark:border-slate-700 pb-1">
              4. Additional Details & Photos
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Original Seller Name & Phone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="Seller Name"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    placeholder="Seller Phone"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Warranty Days
                </label>
                <input
                  type="number"
                  value={warrantyDays}
                  onChange={(e) => setWarrantyDays(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Machine Condition Notes & Features
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention any replaced parts, cosmetic condition, or special features..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-teal-500"
              />
            </div>

            {/* Photo URLs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Machine Photos (Image URLs)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  placeholder="Paste image URL (https://...)"
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {/* Photo Thumbnails Preview */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 group">
                    <img src={url} alt="Machine preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-0.5 right-0.5 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
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
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            {editingMachine ? 'Update Machine' : 'Save To Inventory'}
          </button>
        </div>
      </div>
    </div>
  );
};
