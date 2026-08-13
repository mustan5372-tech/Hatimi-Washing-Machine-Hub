import type {
  BusinessSettings,
  InventoryMachine,
  Customer,
  PurchaseRecord,
  SaleRecord,
  MachineExpense,
  UserProfile,
  AppNotification,
  DashboardStats,
  PaymentTransaction,
  PaymentMethod,
  SparePart,
  SparePartSaleRecord,
  SparePartCartItem,
  RepairRecord,
  RepairSparePartItem
} from '../types';

import {
  INITIAL_SETTINGS,
  INITIAL_INVENTORY,
  INITIAL_PURCHASES,
  INITIAL_CUSTOMERS,
  INITIAL_SALES,
  INITIAL_EXPENSES,
  INITIAL_USERS,
  INITIAL_SPARE_PARTS,
  INITIAL_SPARE_PART_SALES,
  INITIAL_REPAIRS
} from './seedData';
import { initFirebase } from './firebase';
import {
  syncSettingsToFirestore,
  syncDocToFirestore,
  syncCollectionToFirestore,
  deleteDocFromFirestore
} from './firestoreSync';
import { calculateDefaultWarranty } from '../utils/warranty';

const SETTINGS_KEY = 'hwmh_settings';
const INVENTORY_KEY = 'hwmh_inventory';
const PURCHASES_KEY = 'hwmh_purchases';
const CUSTOMERS_KEY = 'hwmh_customers';
const SALES_KEY = 'hwmh_sales';
const EXPENSES_KEY = 'hwmh_expenses';
const USERS_KEY = 'hwmh_users';
const CURRENT_USER_KEY = 'hwmh_current_user';
const SPARE_PARTS_KEY = 'hwmh_spare_parts';
const SPARE_PART_SALES_KEY = 'hwmh_spare_part_sales';
const REPAIRS_KEY = 'hwmh_repairs';
const CLEANUP_VERSION_KEY = 'hwmh_junk_data_cleaned_v2';

// Perform 1-time purge of legacy fake/junk data on load
if (typeof window !== 'undefined' && localStorage.getItem(CLEANUP_VERSION_KEY) !== 'true') {
  localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(INITIAL_USERS[0]));
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(INITIAL_INVENTORY));
  localStorage.setItem(PURCHASES_KEY, JSON.stringify(INITIAL_PURCHASES));
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
  localStorage.setItem(SALES_KEY, JSON.stringify(INITIAL_SALES));
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(INITIAL_EXPENSES));
  localStorage.setItem(SPARE_PART_SALES_KEY, JSON.stringify(INITIAL_SPARE_PART_SALES));
  localStorage.setItem(REPAIRS_KEY, JSON.stringify(INITIAL_REPAIRS));
  localStorage.setItem(CLEANUP_VERSION_KEY, 'true');
}

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const subscribeStore = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(l => l());
};

// Helper for localStorage with initial fallbacks
const loadData = <T>(key: string, defaultData: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return defaultData;
  }
};

const saveData = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyListeners();
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
};

// --- Settings ---
export const getSettings = (): BusinessSettings => {
  const loaded = loadData<BusinessSettings>(SETTINGS_KEY, INITIAL_SETTINGS);
  let settings = !loaded.firebaseApiKey ? { ...INITIAL_SETTINGS, ...loaded } : loaded;
  
  if (settings.email === 'contact@hatimiwmh.com' || !settings.email) {
    settings = { ...settings, email: 'mustan5372@gmail.com' };
  }
  if (settings.gstNumber) {
    settings = { ...settings, gstNumber: '' };
  }

  if (settings.firebaseApiKey && settings.firebaseProjectId) {
    initFirebase({
      apiKey: settings.firebaseApiKey,
      authDomain: settings.firebaseAuthDomain || '',
      projectId: settings.firebaseProjectId,
      storageBucket: settings.firebaseStorageBucket || '',
      messagingSenderId: settings.firebaseMessagingSenderId || '',
      appId: settings.firebaseAppId || ''
    });
  }
  return settings;
};

export const updateSettings = (settings: Partial<BusinessSettings>): BusinessSettings => {
  const current = getSettings();
  const updated = { ...current, ...settings };
  saveData(SETTINGS_KEY, updated);
  // Firestore sync
  syncSettingsToFirestore(updated);
  return updated;
};

// --- Users & Auth ---
export const getUsers = (): UserProfile[] => {
  const cached = loadData<UserProfile[]>(USERS_KEY, INITIAL_USERS);
  
  // Filter out any legacy accounts not present in current system
  const validSeedEmails = new Set(INITIAL_USERS.map(u => u.email.toLowerCase()));
  let merged = cached.filter(u => validSeedEmails.has(u.email.toLowerCase()));
  let changed = merged.length !== cached.length;

  for (const seedUser of INITIAL_USERS) {
    const idx = merged.findIndex(u => u.email.toLowerCase() === seedUser.email.toLowerCase());
    if (idx === -1) {
      merged.push(seedUser);
      changed = true;
    } else {
      if (merged[idx].name !== seedUser.name || merged[idx].phone !== seedUser.phone || (!merged[idx].pin && seedUser.pin)) {
        merged[idx] = {
          ...merged[idx],
          name: seedUser.name,
          phone: seedUser.phone,
          pin: merged[idx].pin || seedUser.pin
        };
        changed = true;
      }
    }
  }

  if (changed) {
    saveData(USERS_KEY, merged);
  }
  return merged;
};

export const saveUser = (user: UserProfile) => {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  saveData(USERS_KEY, users);
  // Firestore sync
  syncDocToFirestore('users', user.id, user);
};

export const deleteUser = (id: string) => {
  const users = getUsers().filter(u => u.id !== id);
  saveData(USERS_KEY, users);
  // Firestore sync
  deleteDocFromFirestore('users', id);
};

export const getCurrentUser = (): UserProfile => {
  const users = getUsers();
  return loadData<UserProfile>(CURRENT_USER_KEY, users[0] || INITIAL_USERS[0]);
};

export const setCurrentUser = (user: UserProfile) => {
  saveData(CURRENT_USER_KEY, user);
};

export const generateNextSerialNumber = (): string => {
  const inventory = getInventory();
  const purchases = getPurchases();
  
  const allSerials = [
    ...inventory.map(i => i.serialNumber || ''),
    ...purchases.map(p => p.serialNumber || '')
  ];

  const wmNumbers = allSerials
    .map(s => {
      const match = s.match(/WM-?(\d+)/i);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n): n is number => n !== null);

  const maxNum = wmNumbers.length > 0 ? Math.max(...wmNumbers) : 1000;
  const nextNum = maxNum >= 1000 ? maxNum + 1 : 1001;
  return `WM-${nextNum}`;
};

// --- Helper for Auto-generating Stock ID ---
export const generateNextStockId = (): string => {
  const inventory = getInventory();
  let maxNum = 0;
  inventory.forEach(m => {
    const match = m.stockId.match(/WM-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  const nextNum = maxNum + 1;
  return `WM-${nextNum.toString().padStart(4, '0')}`;
};

// --- Helper for Auto-generating Customer ID ---
export const generateNextCustomerId = (): string => {
  const customers = getCustomers();
  let maxNum = 0;
  customers.forEach(c => {
    const match = c.customerId.match(/CUST-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  const nextNum = maxNum + 1;
  return `CUST-${nextNum.toString().padStart(4, '0')}`;
};

// --- Helper for Auto-generating Invoice Number ---
export const generateNextInvoiceNumber = (): string => {
  const settings = getSettings();
  const sales = getSales();
  let maxNum = 0;
  sales.forEach(s => {
    const match = s.invoiceNumber.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  const nextNum = maxNum + 1;
  return `${settings.invoicePrefix}${nextNum.toString().padStart(4, '0')}`;
};

// --- Helper for Same Model Price Synchronization ---
export const syncSameModelPrices = (brand: string, model: string, sellingPrice: number, minSellingPrice?: number) => {
  const inventory = getInventory();
  const cleanBrand = brand.trim().toLowerCase();
  const cleanModel = model.trim().toLowerCase();
  let changed = false;

  const updatedInventory = inventory.map(m => {
    if (m.brand.trim().toLowerCase() === cleanBrand && m.model.trim().toLowerCase() === cleanModel) {
      if (m.sellingPrice !== sellingPrice) {
        changed = true;
        const updatedMachine = {
          ...m,
          sellingPrice,
          minSellingPrice: minSellingPrice !== undefined ? minSellingPrice : Math.round(sellingPrice * 0.9),
          updatedAt: new Date().toISOString()
        };
        syncDocToFirestore('inventory', updatedMachine.id || updatedMachine.stockId, updatedMachine);
        return updatedMachine;
      }
    }
    return m;
  });

  if (changed) {
    saveData(INVENTORY_KEY, updatedInventory);
  }
};

// --- Inventory ---
export const getInventory = (): InventoryMachine[] => {
  return loadData<InventoryMachine[]>(INVENTORY_KEY, INITIAL_INVENTORY);
};

export const saveMachine = (machine: InventoryMachine, syncModelPrice: boolean = true) => {
  const inventory = getInventory();
  const idx = inventory.findIndex(m => m.id === machine.id || m.stockId === machine.stockId);
  
  // Auto calculate default warranty based on selling price if not custom
  if (!machine.warrantyDays) {
    machine.warrantyDays = calculateDefaultWarranty(machine.sellingPrice);
  }

  // recalculate total cost
  machine.totalCost = (machine.purchasePrice || 0) + 
                      (machine.repairExpenses || 0) + 
                      (machine.cleaningExpenses || 0) + 
                      (machine.transportExpenses || 0) + 
                      (machine.otherExpenses || 0);

  if (idx >= 0) {
    inventory[idx] = { ...machine, updatedAt: new Date().toISOString() };
  } else {
    inventory.unshift({ ...machine, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  saveData(INVENTORY_KEY, inventory);
  // Firestore sync
  syncDocToFirestore('inventory', machine.id || machine.stockId, machine);

  // Sync price across all machines of the same model if enabled
  if (syncModelPrice && machine.brand && machine.model && machine.sellingPrice > 0) {
    syncSameModelPrices(machine.brand, machine.model, machine.sellingPrice, machine.minSellingPrice);
  }
};

export const deleteMachine = (id: string) => {
  const machine = getInventory().find(m => m.id === id || m.stockId === id);
  const inventory = getInventory().filter(m => m.id !== id && m.stockId !== id);
  saveData(INVENTORY_KEY, inventory);
  // Firestore sync
  if (machine) {
    deleteDocFromFirestore('inventory', machine.id || machine.stockId);
  }
};

// --- Expenses ---
export const getExpenses = (): MachineExpense[] => {
  return loadData<MachineExpense[]>(EXPENSES_KEY, INITIAL_EXPENSES);
};

export const addMachineExpense = (expense: Omit<MachineExpense, 'id' | 'createdAt'>) => {
  const expenses = getExpenses();
  const newExp: MachineExpense = {
    ...expense,
    id: `exp-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  expenses.unshift(newExp);
  saveData(EXPENSES_KEY, expenses);
  // Firestore sync
  syncDocToFirestore('expenses', newExp.id, newExp);

  // Update Inventory machine costs
  const inventory = getInventory();
  const idx = inventory.findIndex(m => m.stockId === expense.stockId);
  if (idx >= 0) {
    const m = inventory[idx];
    if (expense.category === 'Repair' || expense.category === 'Spare Parts' || expense.category === 'Labour') {
      m.repairExpenses += expense.amount;
    } else if (expense.category === 'Cleaning') {
      m.cleaningExpenses += expense.amount;
    } else if (expense.category === 'Transportation') {
      m.transportExpenses += expense.amount;
    } else {
      m.otherExpenses += expense.amount;
    }
    m.totalCost = m.purchasePrice + m.repairExpenses + m.cleaningExpenses + m.transportExpenses + m.otherExpenses;
    m.updatedAt = new Date().toISOString();
    saveData(INVENTORY_KEY, inventory);
    // Firestore sync the updated machine
    syncDocToFirestore('inventory', m.id || m.stockId, m);
  }
};

// --- Purchases ---
export const getPurchases = (): PurchaseRecord[] => {
  return loadData<PurchaseRecord[]>(PURCHASES_KEY, INITIAL_PURCHASES);
};

export const addPurchaseRecord = (purchase: Omit<PurchaseRecord, 'id' | 'stockId' | 'createdAt'> & { stockId?: string }): PurchaseRecord => {
  const purchases = getPurchases();
  const stockId = purchase.stockId || generateNextStockId();
  
  const newPurchase: PurchaseRecord = {
    ...purchase,
    id: `pur-${Date.now()}`,
    stockId,
    createdAt: new Date().toISOString()
  };
  purchases.unshift(newPurchase);
  saveData(PURCHASES_KEY, purchases);
  // Firestore sync
  syncDocToFirestore('purchases', newPurchase.id, newPurchase);

  const targetSellingPrice = Math.round(purchase.purchasePrice * 1.5);

  // Check if existing machines of same model exist to sync price
  const inventory = getInventory();
  const existingSameModel = inventory.find(
    m => m.brand.toLowerCase().trim() === purchase.machineBrand.toLowerCase().trim() &&
         m.model.toLowerCase().trim() === purchase.machineModel.toLowerCase().trim() &&
         m.sellingPrice > 0
  );
  
  const finalSellingPrice = existingSameModel ? existingSameModel.sellingPrice : targetSellingPrice;
  const finalMinSellingPrice = existingSameModel ? existingSameModel.minSellingPrice : Math.round(targetSellingPrice * 0.9);

  // Auto create corresponding inventory item with price-based default warranty tier
  const newMachine: InventoryMachine = {
    id: `mach-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    stockId: stockId,
    brand: purchase.machineBrand,
    model: purchase.machineModel,
    serialNumber: purchase.serialNumber || `SN-${Date.now().toString().slice(-6)}`,
    capacityKg: purchase.capacityKg,
    type: purchase.type,
    loadingType: purchase.type === 'Front Load' ? 'Front Load' : 'Top Load',
    color: 'Standard',
    purchaseDate: purchase.purchaseDate,
    purchasePrice: purchase.purchasePrice,
    repairExpenses: 0,
    cleaningExpenses: 0,
    transportExpenses: 0,
    otherExpenses: 0,
    totalCost: purchase.purchasePrice,
    sellingPrice: finalSellingPrice,
    minSellingPrice: finalMinSellingPrice,
    condition: purchase.condition,
    warrantyDays: calculateDefaultWarranty(finalSellingPrice),
    description: `Purchased from ${purchase.sellerName || 'Bulk Lot'}. ${purchase.notes || ''}`,
    photos: purchase.photos && purchase.photos.length > 0 ? purchase.photos : ['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80'],
    sellerId: newPurchase.id,
    sellerName: purchase.sellerName,
    sellerPhone: purchase.sellerPhone,
    status: 'Pending Inspection',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  saveMachine(newMachine);

  return newPurchase;
};

// --- Bulk Purchase Machine Lots (Without Buyer / Custom Prices) ---
export const addBulkPurchaseRecords = (bulkLot: {
  sellerName?: string;
  sellerPhone?: string;
  sellerAddress?: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  purchaseDate?: string;
  items: Array<{
    brand: string;
    model: string;
    capacityKg: number;
    type: any;
    condition: any;
    quantity: number;
    purchasePricePerUnit: number;
    sellingPricePerUnit?: number;
  }>;
}): PurchaseRecord[] => {
  const createdPurchases: PurchaseRecord[] = [];
  const seller = bulkLot.sellerName?.trim() || 'Bulk Lot / Wholesale Purchase';
  const phone = bulkLot.sellerPhone?.trim() || 'N/A';
  const address = bulkLot.sellerAddress?.trim() || 'Bulk Lot';
  const pDate = bulkLot.purchaseDate || new Date().toISOString().split('T')[0];
  const pMethod = bulkLot.paymentMethod || 'UPI';

  bulkLot.items.forEach((item) => {
    const qty = Math.max(1, item.quantity || 1);
    const unitPurPrice = Number(item.purchasePricePerUnit) || 0;
    
    for (let q = 0; q < qty; q++) {
      const stockId = generateNextStockId();
      const serialNumber = generateNextSerialNumber();

      const pRecord = addPurchaseRecord({
        stockId,
        sellerName: seller,
        sellerPhone: phone,
        sellerAddress: address,
        machineBrand: item.brand,
        machineModel: item.model,
        serialNumber,
        capacityKg: item.capacityKg || 7.0,
        type: item.type || 'Fully Automatic',
        condition: item.condition || 'Good',
        purchasePrice: unitPurPrice,
        amountPaid: unitPurPrice,
        remainingAmount: 0,
        paymentMethod: pMethod,
        purchaseDate: pDate,
        notes: `Bulk Addition: Unit ${q + 1} of ${qty}. ${bulkLot.notes || ''}`
      });

      // If explicit selling price was set in bulk form, update it & sync model prices
      if (item.sellingPricePerUnit && item.sellingPricePerUnit > 0) {
        const inv = getInventory();
        const mach = inv.find(m => m.stockId === stockId);
        if (mach) {
          mach.sellingPrice = item.sellingPricePerUnit;
          mach.minSellingPrice = Math.round(item.sellingPricePerUnit * 0.9);
          mach.warrantyDays = calculateDefaultWarranty(item.sellingPricePerUnit);
          saveMachine(mach, true);
        }
      }

      createdPurchases.push(pRecord);
    }
  });

  return createdPurchases;
};

// --- Customers ---
export const getCustomers = (): Customer[] => {
  return loadData<Customer[]>(CUSTOMERS_KEY, INITIAL_CUSTOMERS);
};

export const saveCustomer = (customer: Omit<Customer, 'id' | 'customerId' | 'createdAt' | 'totalSpent' | 'pendingAmount'> & { id?: string; customerId?: string }): Customer => {
  const customers = getCustomers();
  const idx = customer.id ? customers.findIndex(c => c.id === customer.id) : -1;

  if (idx >= 0) {
    const updated = { ...customers[idx], ...customer };
    customers[idx] = updated;
    saveData(CUSTOMERS_KEY, customers);
    // Firestore sync
    syncDocToFirestore('customers', updated.id, updated);
    return updated;
  } else {
    const newCust: Customer = {
      ...customer,
      id: `cust-${Date.now()}`,
      customerId: customer.customerId || generateNextCustomerId(),
      totalSpent: 0,
      pendingAmount: 0,
      createdAt: new Date().toISOString()
    };
    customers.unshift(newCust);
    saveData(CUSTOMERS_KEY, customers);
    // Firestore sync
    syncDocToFirestore('customers', newCust.id, newCust);
    return newCust;
  }
};

// --- Sales & Billing ---
export const getSales = (): SaleRecord[] => {
  return loadData<SaleRecord[]>(SALES_KEY, INITIAL_SALES);
};

export const createSaleTransaction = (saleData: {
  stockId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerEmail?: string;
  sellingPrice: number;
  discount: number;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  saleDate: string;
  warrantyDays?: number;
  notes?: string;
  soldBy?: string;
}): { sale: SaleRecord; machine: InventoryMachine; customer: Customer } => {
  const inventory = getInventory();
  const machine = inventory.find(m => m.stockId === saleData.stockId || m.id === saleData.stockId);
  
  if (!machine) {
    throw new Error(`Machine with Stock ID ${saleData.stockId} not found.`);
  }

  if (machine.status === 'Sold') {
    throw new Error(`Machine ${machine.stockId} is already SOLD.`);
  }

  const finalAmount = Math.max(0, saleData.sellingPrice - saleData.discount);
  const balanceDue = Math.max(0, finalAmount - saleData.amountPaid);
  const paymentStatus = balanceDue === 0 ? 'Paid' : (saleData.amountPaid > 0 ? 'Partially Paid' : 'Unpaid');
  
  const calculatedProfit = finalAmount - machine.totalCost;
  const profitMarginPct = finalAmount > 0 ? Number(((calculatedProfit / finalAmount) * 100).toFixed(2)) : 0;

  // Auto-calculated warranty tier based on final billed amount if not specified
  const effectiveWarrantyDays = saleData.warrantyDays !== undefined && saleData.warrantyDays > 0
    ? saleData.warrantyDays
    : calculateDefaultWarranty(finalAmount);

  // Find or create customer
  let customers = getCustomers();
  let customer = customers.find(c => c.phone.trim() === saleData.customerPhone.trim() || c.name.toLowerCase().trim() === saleData.customerName.toLowerCase().trim());
  
  if (!customer) {
    customer = saveCustomer({
      name: saleData.customerName,
      phone: saleData.customerPhone,
      address: saleData.customerAddress,
      email: saleData.customerEmail
    });
  } else {
    // update customer phone/address if changed
    customer.address = saleData.customerAddress || customer.address;
    customer.email = saleData.customerEmail || customer.email;
  }

  // Update customer financials
  customer.totalSpent += finalAmount;
  customer.pendingAmount += balanceDue;
  saveCustomer(customer);

  // Generate Invoice Number
  const invoiceNumber = generateNextInvoiceNumber();

  const initialPaymentHistory: PaymentTransaction[] = saleData.amountPaid > 0 ? [
    {
      id: `pmt-${Date.now()}`,
      invoiceNumber,
      amount: saleData.amountPaid,
      paymentDate: saleData.saleDate,
      paymentMethod: saleData.paymentMethod,
      notes: paymentStatus === 'Paid' ? 'Full payment' : 'Down payment'
    }
  ] : [];

  const currentUser = getCurrentUser();
  const newSale: SaleRecord = {
    id: `sale-${Date.now()}`,
    invoiceNumber,
    stockId: machine.stockId,
    machineBrand: machine.brand,
    machineModel: machine.model,
    machineTotalCost: machine.totalCost,
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerAddress: customer.address,
    customerEmail: customer.email,
    sellingPrice: saleData.sellingPrice,
    discount: saleData.discount,
    finalAmount,
    amountPaid: saleData.amountPaid,
    balanceDue,
    paymentStatus,
    paymentMethod: saleData.paymentMethod,
    saleDate: saleData.saleDate,
    warrantyDays: effectiveWarrantyDays,
    calculatedProfit,
    profitMarginPct,
    notes: saleData.notes,
    soldBy: saleData.soldBy || currentUser.name,
    soldByRole: currentUser.role,
    paymentHistory: initialPaymentHistory,
    createdAt: new Date().toISOString()
  };

  const sales = getSales();
  sales.unshift(newSale);
  saveData(SALES_KEY, sales);
  // Firestore sync
  syncDocToFirestore('sales', newSale.id, newSale);

  // Update machine status to Sold
  machine.status = 'Sold';
  machine.sellingPrice = saleData.sellingPrice;
  machine.warrantyDays = effectiveWarrantyDays;
  saveMachine(machine);

  return { sale: newSale, machine, customer };
};

export const recordSalePayment = (invoiceNumber: string, amount: number, paymentMethod: PaymentMethod, notes?: string): SaleRecord => {
  const sales = getSales();
  const idx = sales.findIndex(s => s.invoiceNumber === invoiceNumber);
  if (idx < 0) {
    throw new Error(`Invoice ${invoiceNumber} not found.`);
  }

  const sale = sales[idx];
  const newAmountPaid = sale.amountPaid + amount;
  const newBalanceDue = Math.max(0, sale.finalAmount - newAmountPaid);
  const newPaymentStatus = newBalanceDue === 0 ? 'Paid' : 'Partially Paid';

  const transaction: PaymentTransaction = {
    id: `pmt-${Date.now()}`,
    invoiceNumber,
    amount,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod,
    notes: notes || `Payment received: ₹${amount.toLocaleString('en-IN')}`
  };

  sale.amountPaid = newAmountPaid;
  sale.balanceDue = newBalanceDue;
  sale.paymentStatus = newPaymentStatus;
  sale.paymentHistory = [...(sale.paymentHistory || []), transaction];

  sales[idx] = sale;
  saveData(SALES_KEY, sales);
  // Firestore sync
  syncDocToFirestore('sales', sale.id, sale);

  // Update Customer pending amount
  const customers = getCustomers();
  const cIdx = customers.findIndex(c => c.id === sale.customerId || c.phone === sale.customerPhone);
  if (cIdx >= 0) {
    customers[cIdx].pendingAmount = Math.max(0, customers[cIdx].pendingAmount - amount);
    saveData(CUSTOMERS_KEY, customers);
    // Firestore sync
    syncDocToFirestore('customers', customers[cIdx].id, customers[cIdx]);
  }

  return sale;
};

// --- SPARE PARTS MANAGEMENT ---
export const getSpareParts = (): SparePart[] => {
  return loadData<SparePart[]>(SPARE_PARTS_KEY, INITIAL_SPARE_PARTS);
};

export const generateNextSparePartNumber = (): string => {
  const parts = getSpareParts();
  let maxNum = 0;
  parts.forEach(p => {
    const match = p.partNumber.match(/SP-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  const nextNum = maxNum + 1;
  return `SP-${nextNum.toString().padStart(4, '0')}`;
};

export const saveSparePart = (part: SparePart) => {
  const parts = getSpareParts();
  const idx = parts.findIndex(p => p.id === part.id || p.partNumber === part.partNumber);

  if (idx >= 0) {
    parts[idx] = { ...part, updatedAt: new Date().toISOString() };
  } else {
    parts.unshift({ ...part, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  saveData(SPARE_PARTS_KEY, parts);
  // Firestore sync
  syncDocToFirestore('spareParts', part.id || part.partNumber, part);
};

export const deleteSparePart = (id: string) => {
  const part = getSpareParts().find(p => p.id === id || p.partNumber === id);
  const parts = getSpareParts().filter(p => p.id !== id && p.partNumber !== id);
  saveData(SPARE_PARTS_KEY, parts);
  // Firestore sync
  if (part) {
    deleteDocFromFirestore('spareParts', part.id || part.partNumber);
  }
};

// --- SPARE PART SALES & CART SYSTEM ---
export const getSparePartSales = (): SparePartSaleRecord[] => {
  return loadData<SparePartSaleRecord[]>(SPARE_PART_SALES_KEY, INITIAL_SPARE_PART_SALES);
};

export const generateNextSparePartInvoiceNumber = (): string => {
  const sales = getSparePartSales();
  let maxNum = 0;
  sales.forEach(s => {
    const match = s.invoiceNumber.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  const nextNum = maxNum + 1;
  return `SPINV-2026-${nextNum.toString().padStart(4, '0')}`;
};

export const createSparePartSale = (saleData: {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: SparePartCartItem[];
  discount: number;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  saleDate: string;
  notes?: string;
}): SparePartSaleRecord => {
  if (!saleData.items || saleData.items.length === 0) {
    throw new Error('Cart is empty. Select at least one spare part to purchase.');
  }

  const subtotal = saleData.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalAmount = Math.max(0, subtotal - saleData.discount);
  const balanceDue = Math.max(0, totalAmount - saleData.amountPaid);
  const paymentStatus = balanceDue === 0 ? 'Paid' : (saleData.amountPaid > 0 ? 'Partially Paid' : 'Unpaid');

  // Generate Spare Part Invoice Number
  const invoiceNumber = generateNextSparePartInvoiceNumber();

  // 1. Increment totalSold count for each sold spare part
  const parts = getSpareParts();
  saleData.items.forEach(cartItem => {
    const pIdx = parts.findIndex(p => p.id === cartItem.partId || p.partNumber === cartItem.partNumber);
    if (pIdx >= 0) {
      parts[pIdx].totalSold = (parts[pIdx].totalSold || 0) + cartItem.quantity;
      parts[pIdx].updatedAt = new Date().toISOString();
      syncDocToFirestore('spareParts', parts[pIdx].id, parts[pIdx]);
    }
  });
  saveData(SPARE_PARTS_KEY, parts);

  // 2. Save or update customer
  let customers = getCustomers();
  let customer = customers.find(c => c.phone.trim() === saleData.customerPhone.trim() || c.name.toLowerCase().trim() === saleData.customerName.toLowerCase().trim());
  
  if (!customer) {
    customer = saveCustomer({
      name: saleData.customerName,
      phone: saleData.customerPhone,
      address: saleData.customerAddress
    });
  } else {
    customer.address = saleData.customerAddress || customer.address;
  }

  customer.totalSpent += totalAmount;
  customer.pendingAmount += balanceDue;
  saveCustomer(customer);

  // 3. Create Spare Part Sale Record
  const newSpareSale: SparePartSaleRecord = {
    id: `spsale-${Date.now()}`,
    invoiceNumber,
    customerName: saleData.customerName,
    customerPhone: saleData.customerPhone,
    customerAddress: saleData.customerAddress,
    items: saleData.items,
    subtotal,
    discount: saleData.discount,
    totalAmount,
    amountPaid: saleData.amountPaid,
    balanceDue,
    paymentMethod: saleData.paymentMethod,
    paymentStatus,
    saleDate: saleData.saleDate,
    notes: saleData.notes,
    createdAt: new Date().toISOString()
  };

  const spareSales = getSparePartSales();
  spareSales.unshift(newSpareSale);
  saveData(SPARE_PART_SALES_KEY, spareSales);

  // Firestore sync
  syncDocToFirestore('sparePartSales', newSpareSale.id, newSpareSale);

  return newSpareSale;
};

// --- Repairing & Service Records ---
export const getRepairRecords = (): RepairRecord[] => {
  return loadData<RepairRecord[]>(REPAIRS_KEY, INITIAL_REPAIRS);
};

export const generateNextRepairInvoiceNumber = (): string => {
  const repairs = getRepairRecords();
  const year = new Date().getFullYear();
  const prefix = `REP-${year}-`;
  
  const existingNumbers = repairs
    .map(r => r.invoiceNumber)
    .filter(inv => inv && inv.startsWith(prefix))
    .map(inv => parseInt(inv.replace(prefix, ''), 10))
    .filter(num => !isNaN(num));

  const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
  const nextNum = maxNum + 1;
  return `${prefix}${String(nextNum).padStart(4, '0')}`;
};

export const createRepairRecord = (repairData: {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  machineDetails: string;
  issueDescription: string;
  technicianName?: string;
  repairCost: number;
  labourCharges: number;
  spareParts?: RepairSparePartItem[];
  discount: number;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  repairDate?: string;
  notes?: string;
}): RepairRecord => {
  const sparePartsList = repairData.spareParts || [];
  const partsSubtotal = sparePartsList.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const subtotal = repairData.repairCost + repairData.labourCharges + partsSubtotal;
  const totalAmount = Math.max(0, subtotal - repairData.discount);
  const balanceDue = Math.max(0, totalAmount - repairData.amountPaid);
  const paymentStatus = balanceDue === 0 ? 'Paid' : (repairData.amountPaid > 0 ? 'Partially Paid' : 'Unpaid');

  const invoiceNumber = generateNextRepairInvoiceNumber();

  // If spare parts from catalog were used, update totalSold
  if (sparePartsList.length > 0) {
    const catalogParts = getSpareParts();
    sparePartsList.forEach(item => {
      if (item.partId || item.partNumber) {
        const pIdx = catalogParts.findIndex(p => p.id === item.partId || p.partNumber === item.partNumber);
        if (pIdx >= 0) {
          catalogParts[pIdx].totalSold = (catalogParts[pIdx].totalSold || 0) + item.quantity;
          catalogParts[pIdx].updatedAt = new Date().toISOString();
          syncDocToFirestore('spareParts', catalogParts[pIdx].id, catalogParts[pIdx]);
        }
      }
    });
    saveData(SPARE_PARTS_KEY, catalogParts);
  }

  // Update customer
  let customers = getCustomers();
  let customer = customers.find(c => c.phone.trim() === repairData.customerPhone.trim() || c.name.toLowerCase().trim() === repairData.customerName.toLowerCase().trim());
  if (!customer) {
    customer = saveCustomer({
      name: repairData.customerName,
      phone: repairData.customerPhone,
      address: repairData.customerAddress
    });
  } else {
    customer.address = repairData.customerAddress || customer.address;
  }
  customer.totalSpent += totalAmount;
  customer.pendingAmount += balanceDue;
  saveCustomer(customer);

  const newRepair: RepairRecord = {
    id: `rep-${Date.now()}`,
    invoiceNumber,
    repairDate: repairData.repairDate || new Date().toISOString().split('T')[0],
    customerName: repairData.customerName,
    customerPhone: repairData.customerPhone,
    customerAddress: repairData.customerAddress,
    machineDetails: repairData.machineDetails,
    issueDescription: repairData.issueDescription,
    technicianName: repairData.technicianName,
    repairCost: repairData.repairCost,
    labourCharges: repairData.labourCharges,
    spareParts: sparePartsList,
    subtotal,
    discount: repairData.discount,
    totalAmount,
    amountPaid: repairData.amountPaid,
    balanceDue,
    paymentMethod: repairData.paymentMethod,
    paymentStatus,
    notes: repairData.notes,
    createdAt: new Date().toISOString()
  };

  const repairs = getRepairRecords();
  repairs.unshift(newRepair);
  saveData(REPAIRS_KEY, repairs);

  // Sync to Firestore
  syncDocToFirestore('repairs', newRepair.id, newRepair);

  return newRepair;
};

export const deleteRepairRecord = (id: string) => {
  const repairs = getRepairRecords().filter(r => r.id !== id);
  saveData(REPAIRS_KEY, repairs);
  deleteDocFromFirestore('repairs', id);
};

// --- Notifications & Alerts ---
export const getNotifications = (): AppNotification[] => {
  const inventory = getInventory();
  const sales = getSales();
  const alerts: AppNotification[] = [];

  // Under Repair alert
  const underRepair = inventory.filter(m => m.status === 'Under Repair');
  if (underRepair.length > 0) {
    alerts.push({
      id: 'alert-repair',
      type: 'under_repair',
      title: `${underRepair.length} Machine(s) Under Repair`,
      message: `Machines currently in shop under repair: ${underRepair.map(m => m.stockId).join(', ')}`,
      severity: 'warning',
      date: new Date().toISOString().split('T')[0],
      read: false
    });
  }

  // Pending Payments alert
  const pendingSales = sales.filter(s => s.balanceDue > 0);
  if (pendingSales.length > 0) {
    const totalPending = pendingSales.reduce((sum, s) => sum + s.balanceDue, 0);
    alerts.push({
      id: 'alert-payments',
      type: 'pending_payment',
      title: `Pending Customer Payments`,
      message: `Total ₹${totalPending.toLocaleString('en-IN')} outstanding across ${pendingSales.length} invoice(s)`,
      severity: 'error',
      date: new Date().toISOString().split('T')[0],
      read: false
    });
  }

  // Reserved Machines alert
  const reserved = inventory.filter(m => m.status === 'Reserved');
  if (reserved.length > 0) {
    alerts.push({
      id: 'alert-reserved',
      type: 'reserved',
      title: `${reserved.length} Machine(s) Reserved`,
      message: `Reserved stock items: ${reserved.map(m => m.stockId).join(', ')}`,
      severity: 'info',
      date: new Date().toISOString().split('T')[0],
      read: false
    });
  }

  // Low margin inventory (<15%)
  const lowMargin = inventory.filter(m => m.status === 'Available' && m.sellingPrice > 0 && ((m.sellingPrice - m.totalCost) / m.sellingPrice) < 0.15);
  if (lowMargin.length > 0) {
    alerts.push({
      id: 'alert-low-margin',
      type: 'low_margin',
      title: `${lowMargin.length} Low Profit Margin Item(s)`,
      message: `Stock ID: ${lowMargin.map(m => m.stockId).join(', ')} has profit margin below 15%`,
      severity: 'warning',
      date: new Date().toISOString().split('T')[0],
      read: false
    });
  }

  return alerts;
};

// --- Dashboard Statistics Calculator ---
export const getDashboardStats = (): DashboardStats => {
  const inventory = getInventory();
  const sales = getSales();
  const purchases = getPurchases();
  const expenses = getExpenses();

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM

  // Today stats
  const todayPurchased = purchases.filter(p => p.purchaseDate === todayStr);
  const todaySales = sales.filter(s => s.saleDate === todayStr);

  const todayRevenue = todaySales.reduce((sum, s) => sum + s.finalAmount, 0);
  const todayPurchaseExpenditure = todayPurchased.reduce((sum, p) => sum + p.purchasePrice, 0);
  const todayProfit = todaySales.reduce((sum, s) => sum + s.calculatedProfit, 0);
  const todayPendingPayments = todaySales.reduce((sum, s) => sum + s.balanceDue, 0);

  // Overall & Monthly stats
  const availableInventory = inventory.filter(m => m.status === 'Available' || m.status === 'Reserved' || m.status === 'Under Repair' || m.status === 'Pending Inspection');
  const totalInventoryValue = availableInventory.reduce((sum, m) => sum + m.totalCost, 0);

  const monthlySales = sales.filter(s => s.saleDate.startsWith(currentMonthStr));
  const monthlyPurchases = purchases.filter(p => p.purchaseDate.startsWith(currentMonthStr));
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(currentMonthStr));

  const monthlySoldMachines = monthlySales.length;
  const monthlyRevenue = monthlySales.reduce((sum, s) => sum + s.finalAmount, 0);
  const monthlyPurchaseCost = monthlyPurchases.reduce((sum, p) => sum + p.purchasePrice, 0);
  const monthlyRepairExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlyGrossProfit = monthlySales.reduce((sum, s) => sum + s.calculatedProfit, 0);

  const outstandingPayments = sales.reduce((sum, s) => sum + s.balanceDue, 0);

  return {
    todayStockCount: availableInventory.length,
    todayPurchasedCount: todayPurchased.length,
    todaySoldCount: todaySales.length,
    todayRevenue,
    todayPurchaseExpenditure,
    todayProfit,
    todayPendingPayments,
    totalInventoryValue,
    monthlySoldMachines,
    monthlyRevenue,
    monthlyPurchaseCost,
    monthlyRepairExpenses,
    monthlyGrossProfit,
    outstandingPayments
  };
};

// --- Reset Store to Seed Data ---
export const resetStoreToSeedData = () => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(INITIAL_INVENTORY));
  localStorage.setItem(PURCHASES_KEY, JSON.stringify(INITIAL_PURCHASES));
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
  localStorage.setItem(SALES_KEY, JSON.stringify(INITIAL_SALES));
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(INITIAL_EXPENSES));
  localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(INITIAL_USERS[0]));
  localStorage.setItem(SPARE_PARTS_KEY, JSON.stringify(INITIAL_SPARE_PARTS));
  localStorage.setItem(SPARE_PART_SALES_KEY, JSON.stringify(INITIAL_SPARE_PART_SALES));
  notifyListeners();

  // Firestore sync all collections
  syncSettingsToFirestore(INITIAL_SETTINGS);
  syncCollectionToFirestore('inventory', INITIAL_INVENTORY);
  syncCollectionToFirestore('purchases', INITIAL_PURCHASES);
  syncCollectionToFirestore('customers', INITIAL_CUSTOMERS);
  syncCollectionToFirestore('sales', INITIAL_SALES);
  syncCollectionToFirestore('expenses', INITIAL_EXPENSES);
  syncCollectionToFirestore('users', INITIAL_USERS);
  syncCollectionToFirestore('spareParts', INITIAL_SPARE_PARTS);
  syncCollectionToFirestore('sparePartSales', INITIAL_SPARE_PART_SALES);
};
