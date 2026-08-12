import React, { useState } from 'react';
import {
  Package,
  PlusCircle,
  Search,
  QrCode,
  Eye,
  Receipt
} from 'lucide-react';
import type { InventoryMachine, UserProfile } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface InventoryListProps {
  inventory: InventoryMachine[];
  currentUser: UserProfile;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenAddMachine: () => void;
  onSelectMachine: (stockId: string) => void;
  onEditMachine: (machine: InventoryMachine) => void;
  onDeleteMachine: (id: string) => void;
  onOpenQRModal: (machine: InventoryMachine) => void;
  onOpenExpenseModal: (stockId: string) => void;
  onOpenSellModal: (stockId: string) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  inventory,
  currentUser: _currentUser,
  searchTerm,
  onSearchChange,
  onOpenAddMachine,
  onSelectMachine,
  onEditMachine: _onEditMachine,
  onDeleteMachine: _onDeleteMachine,
  onOpenQRModal,
  onOpenExpenseModal: _onOpenExpenseModal,
  onOpenSellModal
}) => {
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'brand_asc'>('default');

  // Unique Brands & Types for filters
  const brands = ['All', ...Array.from(new Set(inventory.map(m => m.brand)))];
  const types = ['All', 'Fully Automatic', 'Semi Automatic', 'Front Load', 'Top Load'];
  const statuses = ['All', 'Available', 'Reserved', 'Under Repair', 'Pending Inspection', 'Sold', 'Returned'];

  // Filtered & Sorted List
  const filteredMachines = inventory.filter((m) => {
    const matchesSearch =
      m.stockId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.serialNumber && m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBrand = selectedBrand === 'All' || m.brand === selectedBrand;
    const matchesType = selectedType === 'All' || m.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || m.status === selectedStatus;

    const price = m.sellingPrice;
    const minP = minPrice !== '' ? Number(minPrice) : 0;
    const maxP = maxPrice !== '' ? Number(maxPrice) : Infinity;
    const matchesPrice = price >= minP && price <= maxP;

    return matchesSearch && matchesBrand && matchesType && matchesStatus && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.sellingPrice - b.sellingPrice;
    if (sortBy === 'price_desc') return b.sellingPrice - a.sellingPrice;
    if (sortBy === 'brand_asc') return a.brand.localeCompare(b.brand);
    return 0;
  });

  const clearBudgetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedBrand('All');
    setSelectedType('All');
    setSelectedStatus('All');
    setSortBy('default');
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Inventory Stock Management ({filteredMachines.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage second-hand washing machine stock, repair expenses, budget sorting, and QR codes.
          </p>
        </div>

        <button
          onClick={onOpenAddMachine}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          + Add Washing Machine
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="card-panel p-3 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Stock ID, Brand, Model, Serial..."
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Brand Filter */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1">
              <span className="text-slate-400 font-medium text-[11px]">Brand:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-none"
              >
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1">
              <span className="text-slate-400 font-medium text-[11px]">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-none"
              >
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1">
              <span className="text-slate-400 font-medium text-[11px]">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-none"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Sort By Dropdown */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1">
              <span className="text-slate-400 font-medium text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="default">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="brand_asc">Brand (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Budget Range Filter Strip */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/60 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">💰 Budget Range:</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min ₹ (5000)"
                className="w-28 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
              />
              <span className="text-slate-400 font-bold">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max ₹ (10000)"
                className="w-28 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
              />
            </div>

            {/* Quick Budget Preset Badges */}
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => { setMinPrice('0'); setMaxPrice('5000'); }}
                className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-md transition-colors"
              >
                Under ₹5k
              </button>
              <button
                onClick={() => { setMinPrice('5000'); setMaxPrice('10000'); }}
                className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-md transition-colors"
              >
                ₹5k - ₹10k
              </button>
              <button
                onClick={() => { setMinPrice('10000'); setMaxPrice('15000'); }}
                className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-md transition-colors"
              >
                ₹10k - ₹15k
              </button>
            </div>
          </div>

          {(minPrice || maxPrice || selectedBrand !== 'All' || selectedType !== 'All' || selectedStatus !== 'All' || sortBy !== 'default') && (
            <button
              onClick={clearBudgetFilters}
              className="text-[11px] text-rose-500 hover:underline font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Desktop Data Table */}
      <div className="hidden md:block card-panel overflow-hidden">
        {filteredMachines.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No washing machines match your filters.
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Try adjusting your search query or filter options.
            </p>
            <button
              onClick={onOpenAddMachine}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
            >
              + Add Machine Stock
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Stock ID</th>
                <th>Machine & Model</th>
                <th>Capacity / Type</th>
                <th>Condition</th>
                <th>Acquisition Cost</th>
                <th>Selling Price</th>
                <th>Expected Profit</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMachines.map((m) => {
                const profit = m.sellingPrice - m.totalCost;
                const margin = m.sellingPrice > 0 ? ((profit / m.sellingPrice) * 100).toFixed(0) : '0';

                return (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td>
                      <button
                        onClick={() => onSelectMachine(m.stockId)}
                        className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        {m.stockId}
                      </button>
                    </td>

                    <td>
                      <div className="flex items-center gap-2">
                        <img
                          src={m.photos?.[0] || 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80'}
                          alt={m.model}
                          className="w-8 h-8 rounded-md object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{m.brand} {m.model}</p>
                          <span className="text-[10px] text-slate-400 font-mono">SN: {m.serialNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="text-xs text-slate-700 dark:text-slate-300">
                      {m.capacityKg} KG • {m.type}
                    </td>

                    <td className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {m.condition}
                    </td>

                    <td className="font-semibold text-xs text-slate-900 dark:text-white">
                      ₹{m.totalCost.toLocaleString('en-IN')}
                    </td>

                    <td className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      ₹{m.sellingPrice.toLocaleString('en-IN')}
                    </td>

                    <td>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        ₹{profit.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-teal-600 font-semibold">{margin}% margin</span>
                    </td>

                    <td>
                      <StatusBadge status={m.status} size="sm" />
                    </td>

                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectMachine(m.stockId)}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenQRModal(m)}
                          className="p-1.5 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg"
                          title="QR Sticker Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {m.status !== 'Sold' && (
                          <button
                            onClick={() => onOpenSellModal(m.stockId)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                            title="Sell Machine"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Compact Cards View */}
      <div className="md:hidden space-y-3">
        {filteredMachines.length === 0 ? (
          <div className="card-panel p-8 text-center text-xs text-slate-400">
            No washing machines found matching filters.
          </div>
        ) : (
          filteredMachines.map((m) => {
            const profit = m.sellingPrice - m.totalCost;
            return (
              <div
                key={m.id}
                className="card-panel p-3.5 space-y-2 relative border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={m.photos?.[0] || 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80'}
                      alt={m.model}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">{m.stockId}</span>
                        <StatusBadge status={m.status} size="sm" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">{m.brand} {m.model}</h4>
                      <p className="text-[11px] text-slate-500">{m.capacityKg} KG • {m.type}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Cost</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{m.totalCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Selling Price</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{m.sellingPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Profit</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{profit.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectMachine(m.stockId)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                    <button
                      onClick={() => onOpenQRModal(m)}
                      className="p-1 bg-teal-50 text-teal-600 rounded-lg"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>

                  {m.status !== 'Sold' && (
                    <button
                      onClick={() => onOpenSellModal(m.stockId)}
                      className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5" /> Sell Machine
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
