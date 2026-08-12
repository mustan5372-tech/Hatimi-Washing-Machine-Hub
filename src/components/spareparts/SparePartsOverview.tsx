import React, { useState, useEffect } from 'react';
import {
  Wrench,
  ShoppingBag,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  CheckCircle,
  History,
  Tag,
  PackageCheck,
  Printer,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';
import type { SparePart, SparePartCategory, SparePartCartItem, SparePartSaleRecord, BusinessSettings } from '../../types';
import {
  getSpareParts,
  getSparePartSales,
  createSparePartSale,
  deleteSparePart,
  getCustomers
} from '../../services/store';
import { SparePartFormModal } from './SparePartFormModal';
import { SparePartInvoiceModal } from './SparePartInvoiceModal';

interface SparePartsOverviewProps {
  settings: BusinessSettings;
  initialMode?: 'catalog' | 'checkout';
  onNavigateCheckout?: () => void;
  onNavigateCatalog?: () => void;
}

export const SparePartsOverview: React.FC<SparePartsOverviewProps> = ({
  settings,
  initialMode = 'catalog',
  onNavigateCheckout,
  onNavigateCatalog
}) => {
  const [parts, setParts] = useState<SparePart[]>(getSpareParts());
  const [salesHistory, setSalesHistory] = useState<SparePartSaleRecord[]>(getSparePartSales());
  const [activeTab, setActiveTab] = useState<'catalog' | 'checkout' | 'history'>(initialMode);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);

  const [selectedInvoice, setSelectedInvoice] = useState<SparePartSaleRecord | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Added to Cart Toast Notification State
  const [addedToast, setAddedToast] = useState<{
    partName: string;
    partNumber: string;
    quantity: number;
  } | null>(null);

  // Cart State
  const [cartItems, setCartItems] = useState<SparePartCartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [discount, setDiscount] = useState('0');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Bank Transfer' | 'Other'>('Cash');
  const [checkoutError, setCheckoutError] = useState('');

  // Sync mode from props if initialMode changes
  useEffect(() => {
    if (initialMode) {
      setActiveTab(initialMode);
    }
  }, [initialMode]);

  const refreshData = () => {
    setParts(getSpareParts());
    setSalesHistory(getSparePartSales());
  };

  // Filter Parts
  const filteredParts = parts.filter((part) => {
    const matchesCat = selectedCategory === 'All' || part.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      part.name.toLowerCase().includes(q) ||
      part.partNumber.toLowerCase().includes(q) ||
      (part.brandCompatibility && part.brandCompatibility.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  // Cart Operations
  const addToCart = (part: SparePart, qty = 1) => {
    const existing = cartItems.find((ci) => ci.partId === part.id);
    let newCount = qty;
    if (existing) {
      newCount = existing.quantity + qty;
      setCartItems(
        cartItems.map((ci) =>
          ci.partId === part.id
            ? { ...ci, quantity: newCount, totalPrice: ci.unitPrice * newCount }
            : ci
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          partId: part.id,
          partNumber: part.partNumber,
          partName: part.name,
          unitPrice: part.price,
          quantity: qty,
          totalPrice: part.price * qty
        }
      ]);
    }

    // Trigger Popup Toast Toast
    setAddedToast({
      partName: part.name,
      partNumber: part.partNumber,
      quantity: newCount
    });

    // Auto dismiss toast after 4 seconds
    setTimeout(() => {
      setAddedToast((prev) => (prev?.partNumber === part.partNumber ? null : prev));
    }, 4000);
  };

  const updateCartQty = (partId: string, delta: number) => {
    setCartItems(
      cartItems
        .map((ci) => {
          if (ci.partId === partId) {
            const newQty = ci.quantity + delta;
            return newQty > 0
              ? { ...ci, quantity: newQty, totalPrice: ci.unitPrice * newQty }
              : null;
          }
          return ci;
        })
        .filter(Boolean) as SparePartCartItem[]
    );
  };

  const updateCartPrice = (partId: string, price: number) => {
    setCartItems(
      cartItems.map((ci) =>
        ci.partId === partId
          ? { ...ci, unitPrice: price, totalPrice: price * ci.quantity }
          : ci
      )
    );
  };

  const removeFromCart = (partId: string) => {
    setCartItems(cartItems.filter((ci) => ci.partId !== partId));
  };

  const clearCart = () => {
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setDiscount('0');
    setAmountPaid('');
    setCheckoutError('');
  };

  // Auto-fill customer info if phone matches
  const handlePhoneChange = (phone: string) => {
    setCustomerPhone(phone);
    const existing = getCustomers().find((c) => c.phone.trim() === phone.trim());
    if (existing) {
      setCustomerName(existing.name);
      setCustomerAddress(existing.address || '');
    }
  };

  // Calculated Financials for Cart
  const cartSubtotal = cartItems.reduce(
    (sum, ci) => sum + ci.unitPrice * ci.quantity,
    0
  );
  const numDisc = parseFloat(discount) || 0;
  const cartTotal = Math.max(0, cartSubtotal - numDisc);
  const numPaid = amountPaid !== '' ? parseFloat(amountPaid) || 0 : cartTotal;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setCheckoutError('Shopping cart is empty.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setCheckoutError('Please enter Customer Name and Phone.');
      return;
    }

    try {
      const saleRecord = createSparePartSale({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        items: cartItems,
        discount: numDisc,
        amountPaid: numPaid,
        paymentMethod,
        saleDate: new Date().toISOString().split('T')[0]
      });

      refreshData();
      clearCart();
      setSelectedInvoice(saleRecord);
      setIsInvoiceOpen(true);
    } catch (err: any) {
      setCheckoutError(err.message || 'Checkout failed.');
    }
  };

  const handleDeletePart = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete spare part "${name}"?`)) {
      deleteSparePart(id);
      refreshData();
    }
  };

  const goToCheckoutSection = () => {
    if (onNavigateCheckout) {
      onNavigateCheckout();
    } else {
      setActiveTab('checkout');
      if (window.location.pathname !== '/spareparts/checkout') {
        window.history.pushState({}, '', '/spareparts/checkout');
      }
    }
  };

  const goToCatalogSection = () => {
    if (onNavigateCatalog) {
      onNavigateCatalog();
    } else {
      setActiveTab('catalog');
      if (window.location.pathname !== '/spareparts') {
        window.history.pushState({}, '', '/spareparts');
      }
    }
  };

  // Category list
  const categories: (SparePartCategory | 'All')[] = [
    'All',
    'Buffer & Rubber',
    'Drum & Tub',
    'Electrical & Timer',
    'Motors & Gearbox',
    'Valves & Hoses',
    'General Spare'
  ];

  // Global Stat Counters
  const totalPartsListed = parts.length;
  const totalUnitsSold = parts.reduce((sum, p) => sum + p.totalSold, 0);
  const totalSpareRevenue = salesHistory.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="space-y-6 pb-12 animate-fade-in relative">
      {/* Floating Popup Toast Notification (Real-App Style) */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-4 max-w-md animate-slide-up">
          <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase font-mono">
                {addedToast.partNumber}
              </span>
              <button
                onClick={() => setAddedToast(null)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs font-bold truncate mt-0.5">{addedToast.partName}</p>
            <p className="text-[11px] text-slate-300">Added to Cart! Total Qty: {addedToast.quantity}</p>
          </div>
          <button
            onClick={() => {
              setAddedToast(null);
              goToCheckoutSection();
            }}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 transition-colors shadow-md"
          >
            Checkout <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-xl">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Spare Parts Hub & Counter Checkout
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage spare parts stock (Buffers, Drier Drums, Washers, Timers) & process counter cart sales
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab !== 'checkout' ? (
            <button
              onClick={goToCheckoutSection}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-colors relative"
            >
              <ShoppingCart className="w-4 h-4" /> Go to Cart Checkout
              {cartItems.length > 0 && (
                <span className="px-1.5 py-0.5 bg-white text-amber-800 font-extrabold text-[10px] rounded-full">
                  {cartItems.reduce((sum, c) => sum + c.quantity, 0)}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={goToCatalogSection}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-900 dark:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Parts Catalog
            </button>
          )}

          <button
            onClick={() => {
              setEditingPart(null);
              setIsFormModalOpen(true);
            }}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Spare Part Item
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Parts Catalog</span>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{totalPartsListed} Items Listed</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Stock Sold</span>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{totalUnitsSold} Units Sold</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Parts Revenue</span>
            <p className="text-lg font-bold text-slate-900 dark:text-white">₹{totalSpareRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button
          onClick={goToCatalogSection}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'catalog'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Spare Parts Catalog ({parts.length})
        </button>

        <button
          onClick={goToCheckoutSection}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'checkout'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> Cart Checkout ({cartItems.reduce((sum, c) => sum + c.quantity, 0)})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'history'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <History className="w-4 h-4" /> Sales History ({salesHistory.length})
        </button>
      </div>

      {/* VIEW 1: PARTS CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filter Pills & Search Input */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spare parts (Buffer, Drier drum, Timer, LG, Samsung, SP-0001)..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Parts Grid */}
          {filteredParts.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400">
              <Wrench className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No spare parts found</p>
              <p className="text-xs">Try selecting a different category or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredParts.map((part) => {
                const inCart = cartItems.find((ci) => ci.partId === part.id);
                return (
                  <div
                    key={part.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              part.imageUrl ||
                              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'
                            }
                            alt={part.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded">
                              {part.partNumber}
                            </span>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug mt-1">
                              {part.name}
                            </h3>
                            <p className="text-[10px] text-slate-400">{part.brandCompatibility || 'Universal'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Price & Stock Stats */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Unit Price</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                            ₹{part.price.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded">
                            Stock: Unlimited
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5 font-bold">
                            Sold: {part.totalSold} units
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Action Buttons */}
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingPart(part);
                            setIsFormModalOpen(true);
                          }}
                          className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:underline px-1.5"
                        >
                          Edit
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          onClick={() => handleDeletePart(part.id, part.name)}
                          className="text-[11px] font-semibold text-rose-500 hover:underline px-1.5"
                        >
                          Delete
                        </button>
                      </div>

                      <button
                        onClick={() => addToCart(part, 1)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                          inCart
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {inCart ? `Added (${inCart.quantity})` : '+ Add to Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: DEDICATED FULL-SECTION CHECKOUT (`/spareparts/checkout`) */}
      {activeTab === 'checkout' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Detailed Itemized Cart */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Itemized Spare Parts Cart ({cartItems.length} Products)
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToCatalogSection}
                    className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                  >
                    + Add More Parts
                  </button>
                  {cartItems.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-xs text-rose-500 hover:underline font-semibold ml-2"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>
              </div>

              {cartItems.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-3">
                  <ShoppingBag className="w-12 h-12 mx-auto opacity-30 text-amber-500" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Counter Cart is Empty</p>
                  <p className="text-xs text-slate-500">Add buffer rubber, drier drums, timers, or motors to start generating a counter bill.</p>
                  <button
                    onClick={goToCatalogSection}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md inline-flex items-center gap-1.5 mt-2"
                  >
                    Browse Spare Parts Catalog →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {cartItems.map((ci) => (
                    <div
                      key={ci.partId}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded">
                          {ci.partNumber}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                          {ci.partName}
                        </h4>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Custom Price Editable Field */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Unit Price (₹)</label>
                          <input
                            type="number"
                            value={ci.unitPrice}
                            onChange={(e) => updateCartPrice(ci.partId, parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        {/* Quantity Stepper */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-0.5 text-center">Quantity</label>
                          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            <button
                              onClick={() => updateCartQty(ci.partId, -1)}
                              className="w-6 h-6 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-200"
                            >
                              -
                            </button>
                            <span className="font-bold text-slate-900 dark:text-white px-2">
                              {ci.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQty(ci.partId, 1)}
                              className="w-6 h-6 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-200"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Row Subtotal */}
                        <div className="text-right min-w-[80px]">
                          <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Line Total</label>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                            ₹{(ci.unitPrice * ci.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <button
                          onClick={() => removeFromCart(ci.partId)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Customer & Checkout Form */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                Customer & Payment Settlement
              </h3>

              {checkoutError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium">
                  {checkoutError}
                </div>
              )}

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Customer Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+91 98200 00000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Buyer Full Name"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Customer Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Area / City"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e: any) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal Price:</span>
                    <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount:</span>
                    <span>- ₹{numDisc.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white text-base pt-2 border-t border-amber-200 dark:border-amber-900">
                    <span>Total Billed Amount:</span>
                    <span className="text-amber-700 dark:text-amber-300">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cartItems.length === 0}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Complete Counter Sale & Issue Receipt
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SALES HISTORY TABLE */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Spare Parts Counter Invoices History
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {salesHistory.length} Invoices Issued
            </span>
          </div>

          {salesHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">No spare part sales invoices recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3">Invoice #</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Items Sold</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3 text-right">Total Amount</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {salesHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                      <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {record.invoiceNumber}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">
                        {record.saleDate}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900 dark:text-white">{record.customerName}</p>
                        <p className="font-mono text-[10px] text-slate-400">{record.customerPhone}</p>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        {record.items.map((i) => `${i.partName} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">
                        {record.paymentMethod}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                        ₹{record.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedInvoice(record);
                            setIsInvoiceOpen(true);
                          }}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-[11px] flex items-center gap-1 mx-auto transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Spare Part Edit/Add Modal */}
      <SparePartFormModal
        isOpen={isFormModalOpen}
        editingPart={editingPart}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={refreshData}
      />

      {/* Spare Part Printable Invoice Modal */}
      <SparePartInvoiceModal
        isOpen={isInvoiceOpen}
        saleRecord={selectedInvoice}
        settings={settings}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
};
