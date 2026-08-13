import type { BusinessSettings, InventoryMachine, Customer, PurchaseRecord, SaleRecord, MachineExpense, UserProfile, SparePart, SparePartSaleRecord, RepairRecord } from '../types';

export const INITIAL_SETTINGS: BusinessSettings = {
  shopName: "Hatimi Washing Machine Hub",
  address: "Shop No. 12, Appliance Plaza, Station Road, Near Central Market, Mumbai, MH - 400001",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  email: "mustan5372@gmail.com",
  gstNumber: "",
  upiId: "hatimiwmh@okaxis",
  defaultInvoiceFooter: "Thank you for shopping with Hatimi Washing Machine Hub! Quality refurbished appliances guaranteed.",
  defaultWarrantyDays: 30,
  invoicePrefix: "INV-2026-",
  firebaseConfigured: true,
  firebaseApiKey: "AIzaSyAS8bc3bI3pZzTzWZ8mFZUlZ48TWymh1Ow",
  firebaseAuthDomain: "hatimi-washing-machine-hub.firebaseapp.com",
  firebaseProjectId: "hatimi-washing-machine-hub",
  firebaseStorageBucket: "hatimi-washing-machine-hub.firebasestorage.app",
  firebaseMessagingSenderId: "162513883446",
  firebaseAppId: "1:162513883446:web:3a3d3b9ebc2fb84c7e6397"
};

export const INITIAL_USERS: UserProfile[] = [
  {
    id: "user-mustan",
    name: "Mustansir Sanawadwala",
    email: "mustan5372@gmail.com",
    role: "admin",
    phone: "+91 92387 28746",
    active: true,
    pin: "515253"
  },
  {
    id: "user-husain",
    name: "Husain Ali",
    email: "husainali1972@gmail.com",
    role: "admin",
    phone: "+91 98262 47802",
    active: true,
    pin: "515253"
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_INVENTORY: InventoryMachine[] = [];

export const INITIAL_PURCHASES: PurchaseRecord[] = [];

export const INITIAL_EXPENSES: MachineExpense[] = [];

export const INITIAL_SALES: SaleRecord[] = [];

export const INITIAL_SPARE_PARTS: SparePart[] = [];

export const INITIAL_SPARE_PART_SALES: SparePartSaleRecord[] = [];

export const INITIAL_REPAIRS: RepairRecord[] = [
  {
    id: "rep-1",
    invoiceNumber: "REP-2026-0001",
    repairDate: "2026-08-10",
    customerName: "Imran Sheikh",
    customerPhone: "+91 98333 44555",
    customerAddress: "Bandra West, Mumbai",
    machineDetails: "LG 7.0kg Semi-Automatic Washing Machine",
    issueDescription: "Spin motor noise, drum vibration & timer rewinding service",
    technicianName: "Mustansir Sanawadwala",
    repairCost: 800,
    labourCharges: 400,
    spareParts: [],
    subtotal: 1200,
    discount: 0,
    totalAmount: 1200,
    amountPaid: 1200,
    balanceDue: 0,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    notes: "Motor serviced and buffer replaced.",
    createdAt: "2026-08-10T10:00:00.000Z"
  },
  {
    id: "rep-2",
    invoiceNumber: "REP-2026-0002",
    repairDate: "2026-08-10",
    customerName: "Shri ji",
    customerPhone: "+91 98262 47802",
    customerAddress: "Station Road, Mumbai",
    machineDetails: "Semi-Automatic Washing Machine",
    issueDescription: "Washing machine repair & service",
    technicianName: "Mustansir Sanawadwala",
    repairCost: 500,
    labourCharges: 200,
    spareParts: [],
    subtotal: 700,
    discount: 0,
    totalAmount: 700,
    amountPaid: 700,
    balanceDue: 0,
    paymentMethod: "Cash",
    paymentStatus: "Paid",
    notes: "Original repair record for Shri ji",
    createdAt: "2026-08-10T11:00:00.000Z"
  }
];
