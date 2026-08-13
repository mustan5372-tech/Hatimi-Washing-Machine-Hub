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
  },
  {
    id: "user-mufaddal",
    name: "Mufaddal",
    email: "mufaddalhussain5152@gmail.com",
    role: "admin",
    phone: "+91 98765 43210",
    active: true,
    pin: "515253"
  },
  {
    id: "user-sunil",
    name: "Sunil Piple",
    email: "sunilpiple8@gmail.com",
    role: "staff",
    phone: "+91 98765 00000",
    active: true,
    pin: "012345"
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
    repairDate: "2026-08-13",
    customerName: "Shri ji",
    customerPhone: "",
    customerAddress: "Main Market, Mumbai",
    machineDetails: "Samsung Semi-Automatic Washing Machine",
    issueDescription: "Dryer motor winding",
    technicianName: "Mustansir Sanawadwala",
    repairCost: 2400,
    labourCharges: 0,
    spareParts: [],
    subtotal: 2400,
    discount: 0,
    totalAmount: 2400,
    amountPaid: 2400,
    balanceDue: 0,
    paymentMethod: "Cash",
    paymentStatus: "Paid",
    notes: "Dryer motor winding service",
    createdAt: "2026-08-13T04:00:00.000Z"
  }
];
