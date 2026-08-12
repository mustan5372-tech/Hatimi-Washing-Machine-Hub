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
  PaymentMethod
} from '../types';

import {
  INITIAL_SETTINGS,
  INITIAL_INVENTORY,
  INITIAL_PURCHASES,
  INITIAL_CUSTOMERS,
  INITIAL_SALES,
  INITIAL_EXPENSES,
  INITIAL_USERS
} from './seedData';
import { initFirebase } from './firebase';
import {
  syncSettingsToFirestore,
  syncDocToFirestore,
  syncCollectionToFirestore,
  deleteDocFromFirestore
} from './firestoreSync';

const SETTINGS_KEY = 'hwmh_settings';
const INVENTORY_KEY = 'hwmh_inventory';
const PURCHASES_KEY = 'hwmh_purchases';
const CUSTOMERS_KEY = 'hwmh_customers';
const SALES_KEY = 'hwmh_sales';
const EXPENSES_KEY = 'hwmh_expenses';
const USERS_KEY = 'hwmh_users';
const CURRENT_USER_KEY = 'hwmh_current_user';

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
  const settings = !loaded.firebaseApiKey ? { ...INITIAL_SETTINGS, ...loaded } : loaded;
  
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
  
  // Ensure all seed accounts always exist (handles stale browser cache)
  let merged = [...cached];
  let changed = false;
  for (const seedUser of INITIAL_USERS) {
    const exists = merged.some(u => u.email.toLowerCase() === seedUser.email.toLowerCase());
    if (!exists) {
      merged.push(seedUser);
      changed = true;
    } else {
      // Ensure existing seed accounts have PIN if missing
      const idx = merged.findIndex(u => u.email.toLowerCase() === seedUser.email.toLowerCase());
      if (idx >= 0 && !merged[idx].pin && seedUser.pin) {
        merged[idx].pin = seedUser.pin;
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

// --- Inventory ---
export const getInventory = (): InventoryMachine[] => {
  return loadData<InventoryMachine[]>(INVENTORY_KEY, INITIAL_INVENTORY);
};

export const saveMachine = (machine: InventoryMachine) => {
  const inventory = getInventory();
  const idx = inventory.findIndex(m => m.id === machine.id || m.stockId === machine.stockId);
  
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

  // Auto create corresponding inventory item
  const newMachine: InventoryMachine = {
    id: `mach-${Date.now()}`,
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
    sellingPrice: Math.round(purchase.purchasePrice * 1.5),
    minSellingPrice: Math.round(purchase.purchasePrice * 1.3),
    condition: purchase.condition,
    warrantyDays: 30,
    description: `Purchased from ${purchase.sellerName}. ${purchase.notes || ''}`,
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
    warrantyDays: saleData.warrantyDays || machine.warrantyDays || 30,
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
  notifyListeners();

  // Firestore sync all collections
  syncSettingsToFirestore(INITIAL_SETTINGS);
  syncCollectionToFirestore('inventory', INITIAL_INVENTORY);
  syncCollectionToFirestore('purchases', INITIAL_PURCHASES);
  syncCollectionToFirestore('customers', INITIAL_CUSTOMERS);
  syncCollectionToFirestore('sales', INITIAL_SALES);
  syncCollectionToFirestore('expenses', INITIAL_EXPENSES);
  syncCollectionToFirestore('users', INITIAL_USERS);
};
