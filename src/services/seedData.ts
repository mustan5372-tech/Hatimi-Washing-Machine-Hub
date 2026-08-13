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

export const INITIAL_SPARE_PARTS: SparePart[] = [
  {
    id: "sp-1",
    partNumber: "SP-0001",
    name: "Spin Tub Rubber Buffer Seal",
    category: "Buffer & Rubber",
    price: 250,
    totalSold: 0,
    isUnlimited: true,
    brandCompatibility: "Universal / LG / Samsung / Whirlpool",
    description: "Heavy-duty waterproof rubber buffer seal for semi-automatic spin tub shaft.",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "sp-2",
    partNumber: "SP-0002",
    name: "Drier Drum Assembly (Semi-Auto)",
    category: "Drum & Tub",
    price: 850,
    totalSold: 0,
    isUnlimited: true,
    brandCompatibility: "LG / Samsung 6.5kg - 8.0kg",
    description: "Stainless steel high balance spin drier drum for replacement.",
    imageUrl: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-08-01T08:30:00.000Z",
    updatedAt: "2026-08-01T08:30:00.000Z"
  },
  {
    id: "sp-3",
    partNumber: "SP-0003",
    name: "Washer Pulsator Drum Disc",
    category: "Drum & Tub",
    price: 600,
    totalSold: 0,
    isUnlimited: true,
    brandCompatibility: "Universal Semi Automatic",
    description: "Heavy plastic wash agitator pulsator plate.",
    imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z"
  },
  {
    id: "sp-4",
    partNumber: "SP-0004",
    name: "4-Wire Mechanical Wash Timer Switch",
    category: "Electrical & Timer",
    price: 350,
    totalSold: 0,
    isUnlimited: true,
    brandCompatibility: "Universal Semi Automatic",
    description: "15 minute wash timer mechanism with copper contacts.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-08-01T09:30:00.000Z",
    updatedAt: "2026-08-01T09:30:00.000Z"
  },
  {
    id: "sp-5",
    partNumber: "SP-0005",
    name: "150W Copper Wash Motor",
    category: "Motors & Gearbox",
    price: 1800,
    totalSold: 0,
    isUnlimited: true,
    brandCompatibility: "LG / Samsung / Whirlpool",
    description: "High torque 100% pure copper winding wash motor assembly.",
    imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z"
  },
  {
    id: "sp-6",
    partNumber: "SP-0006",
    name: "60W Heavy Duty Spin Motor",
    category: "Motors & Gearbox",
    price: 1400,
    totalSold: 0,
    isUnlimited: true,
    brandCompatibility: "Universal 1350 RPM",
    description: "High speed spin drier motor with thermal overload protector.",
    imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-08-01T10:30:00.000Z",
    updatedAt: "2026-08-01T10:30:00.000Z"
  },
  {
    id: "sp-7",
    partNumber: "SP-0007",
    name: "Square Shaft Gearbox Reducer",
    category: "Motors & Gearbox",
    price: 650,
    totalSold: 0,
    isUnlimited: true,
    brandCompatibility: "LG Roller Jet Pulsator",
    description: "Double gear planetary gear box reducer for wash pulsator.",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-08-01T11:00:00.000Z",
    updatedAt: "2026-08-01T11:00:00.000Z"
  },
  {
    id: "sp-8",
    partNumber: "SP-0008",
    name: "Universal Drain Valve Rubber & Bellow",
    category: "Valves & Hoses",
    price: 150,
    totalSold: 0,
    isUnlimited: true,
    brandCompatibility: "Universal",
    description: "Waterproof rubber drain valve seal bellow spring set.",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-08-01T11:30:00.000Z",
    updatedAt: "2026-08-01T11:30:00.000Z"
  },
  {
    id: "sp-9",
    partNumber: "SP-0009",
    name: "Dual Run Capacitor (10+5 uF)",
    category: "Electrical & Timer",
    price: 220,
    totalSold: 0,
    isUnlimited: true,
    brandCompatibility: "Universal 440V AC",
    description: "Wash & spin dual motor run capacitor.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-08-01T12:00:00.000Z",
    updatedAt: "2026-08-01T12:00:00.000Z"
  },
  {
    id: "sp-10",
    partNumber: "SP-0010",
    name: "Universal Pulsator Disc 330mm",
    category: "Buffer & Rubber",
    price: 450,
    totalSold: 0,
    isUnlimited: true,
    brandCompatibility: "Samsung / LG Semi-Auto",
    description: "11-teeth gear pulsator wheel for intense wash agitation.",
    imageUrl: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-08-01T12:30:00.000Z",
    updatedAt: "2026-08-01T12:30:00.000Z"
  }
];

export const INITIAL_SPARE_PART_SALES: SparePartSaleRecord[] = [];

export const INITIAL_REPAIRS: RepairRecord[] = [
  {
    id: "rep-1",
    invoiceNumber: "REP-2026-0001",
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
