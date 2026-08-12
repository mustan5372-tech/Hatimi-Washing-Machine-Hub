export type UserRole = 'admin' | 'staff';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  active?: boolean;
  avatar?: string;
}

export type MachineStatus = 'Available' | 'Reserved' | 'Sold' | 'Under Repair' | 'Pending Inspection' | 'Returned';
export type MachineType = 'Fully Automatic' | 'Semi Automatic' | 'Front Load' | 'Top Load';
export type MachineCondition = 'Like New' | 'Good' | 'Fair' | 'Refurbished';
export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Other';
export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Unpaid' | 'Refunded';

export interface MachineExpense {
  id: string;
  stockId: string;
  date: string;
  category: 'Repair' | 'Spare Parts' | 'Labour' | 'Cleaning' | 'Transportation' | 'Other';
  description: string;
  amount: number;
  vendorTechnician?: string;
  notes?: string;
  createdAt: string;
}

export interface InventoryMachine {
  id: string;
  stockId: string; // e.g. WM-0001
  brand: string;
  model: string;
  serialNumber: string;
  capacityKg: number;
  type: MachineType;
  loadingType: 'Top Load' | 'Front Load';
  color: string;
  purchaseDate: string;
  purchasePrice: number;
  repairExpenses: number;
  cleaningExpenses: number;
  transportExpenses: number;
  otherExpenses: number;
  totalCost: number; // Purchase + Repair + Cleaning + Transport + Other
  sellingPrice: number;
  minSellingPrice: number;
  condition: MachineCondition;
  warrantyDays: number;
  description: string;
  photos: string[];
  sellerId?: string;
  sellerName?: string;
  sellerPhone?: string;
  status: MachineStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRecord {
  id: string;
  stockId: string;
  sellerName: string;
  sellerPhone: string;
  sellerAddress: string;
  sellerIdRef?: string;
  notes?: string;
  machineBrand: string;
  machineModel: string;
  serialNumber?: string;
  capacityKg: number;
  type: MachineType;
  condition: MachineCondition;
  photos?: string[];
  purchasePrice: number;
  amountPaid: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod;
  purchaseDate: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  customerId: string; // CUST-0001
  name: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  email?: string;
  totalSpent: number;
  pendingAmount: number;
  notes?: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  invoiceNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  recordedBy?: string;
}

export interface SaleRecord {
  id: string;
  invoiceNumber: string; // INV-2026-0001
  stockId: string;
  machineBrand: string;
  machineModel: string;
  machineTotalCost: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerEmail?: string;
  sellingPrice: number;
  discount: number;
  finalAmount: number; // sellingPrice - discount
  amountPaid: number;
  balanceDue: number; // finalAmount - amountPaid
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  saleDate: string;
  warrantyDays: number;
  calculatedProfit: number; // finalAmount - machineTotalCost
  profitMarginPct: number;
  notes?: string;
  soldBy?: string;
  soldByRole?: string;
  paymentHistory: PaymentTransaction[];
  createdAt: string;
}

export interface BusinessSettings {
  shopName: string;
  logoUrl?: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  gstNumber: string;
  upiId: string;
  defaultInvoiceFooter: string;
  defaultWarrantyDays: number;
  invoicePrefix: string;
  firebaseConfigured?: boolean;
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
}

export interface AppNotification {
  id: string;
  type: 'under_repair' | 'pending_payment' | 'reserved' | 'no_selling_price' | 'low_margin';
  title: string;
  message: string;
  severity: 'warning' | 'info' | 'error';
  date: string;
  read: boolean;
  stockId?: string;
  invoiceNumber?: string;
}

export interface DashboardStats {
  todayStockCount: number;
  todayPurchasedCount: number;
  todaySoldCount: number;
  todayRevenue: number;
  todayPurchaseExpenditure: number;
  todayProfit: number;
  todayPendingPayments: number;
  
  totalInventoryValue: number;
  monthlySoldMachines: number;
  monthlyRevenue: number;
  monthlyPurchaseCost: number;
  monthlyRepairExpenses: number;
  monthlyGrossProfit: number;
  outstandingPayments: number;
}
