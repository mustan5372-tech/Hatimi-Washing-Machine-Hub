import { useState, useEffect } from 'react';
import type { UserProfile, InventoryMachine, PurchaseRecord, SaleRecord } from './types';
import {
  getInventory,
  getPurchases,
  getSales,
  getExpenses,
  getCustomers,
  getSettings,
  deleteMachine,
  getDashboardStats,
  getCurrentUser,
  setCurrentUser as saveCurrentUser,
  getUsers
} from './services/store';

// Component Imports
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { InventoryList } from './components/inventory/InventoryList';
import { MachineDetailPage } from './components/inventory/MachineDetailPage';
import { MachineFormModal } from './components/inventory/MachineFormModal';
import { MachineQRModal } from './components/common/MachineQRModal';
import { RepairExpenseModal } from './components/inventory/RepairExpenseModal';
import { PurchaseList } from './components/purchases/PurchaseList';
import { PurchaseFormModal } from './components/purchases/PurchaseFormModal';
import { PurchaseReceiptModal } from './components/purchases/PurchaseReceiptModal';
import { SalesList } from './components/sales/SalesList';
import { SellMachineModal } from './components/sales/SellMachineModal';
import { PaymentModal } from './components/sales/PaymentModal';
import { InvoiceView } from './components/invoices/InvoiceView';
import { CustomerList } from './components/customers/CustomerList';
import { ReportsOverview } from './components/reports/ReportsOverview';
import { QRScannerModal } from './components/common/QRScannerModal';
import { SparePartsOverview } from './components/spareparts/SparePartsOverview';
import { BulkPurchaseModal } from './components/purchases/BulkPurchaseModal';

import { StaffLoginModal } from './components/auth/StaffLoginModal';
import { PublicCustomerPortal } from './components/public/PublicCustomerPortal';
import { SettingsView } from './components/settings/SettingsView';
import { initFirestoreSync, onFirestoreSync } from './services/firestoreSync';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('hwmh_is_authenticated');
    return savedAuth === 'true';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [urlInvoiceNumber, setUrlInvoiceNumber] = useState<string | null>(() => {
    const hash = window.location.hash;
    return hash.includes('#invoice=') ? hash.split('#invoice=')[1] : null;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hatimi_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  // Reactive Data Stores
  const [inventory, setInventory] = useState(getInventory());
  const [purchases, setPurchases] = useState(getPurchases());
  const [sales, setSales] = useState(getSales());
  const [expenses, setExpenses] = useState(getExpenses());
  const [customers, setCustomers] = useState(getCustomers());
  const [businessSettings, setBusinessSettings] = useState(getSettings());

  // Refresh handler
  const refreshData = () => {
    setInventory(getInventory());
    setPurchases(getPurchases());
    setSales(getSales());
    setExpenses(getExpenses());
    setCustomers(getCustomers());
    setBusinessSettings(getSettings());
  };

  // Initialize Firestore real-time sync on mount
  useEffect(() => {
    // Register cross-device sync callback: when Firestore pushes data, refresh UI
    onFirestoreSync(() => {
      refreshData();
    });

    // Initialize Firestore sync (upload local data if needed, start listeners)
    initFirestoreSync().then((connected) => {
      if (connected) {
        console.log('[App] Firestore real-time sync connected successfully.');
      }
    });
  }, []);

  // Modals state
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<InventoryMachine | null>(null);
  const [selectedMachineStockId, setSelectedMachineStockId] = useState<string | null>(null);
  const [qrMachine, setQrMachine] = useState<InventoryMachine | null>(null);
  
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isBulkPurchaseModalOpen, setIsBulkPurchaseModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRecord | null>(null);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [sellModalStockId, setSellModalStockId] = useState<string | undefined>(undefined);
  const [selectedInvoice, setSelectedInvoice] = useState<SaleRecord | null>(null);
  const [paymentModalSale, setPaymentModalSale] = useState<SaleRecord | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseStockId, setExpenseStockId] = useState<string | undefined>(undefined);

  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  // Sync theme to HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('hatimi_theme', theme);
  }, [theme]);

  // Auto-open invoice if URL contains #invoice=INV-XXXX
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('#invoice=')) {
        const invNum = hash.split('#invoice=')[1];
        if (invNum) {
          const matched = sales.find(s => s.invoiceNumber.toLowerCase() === invNum.toLowerCase());
          if (matched) {
            setSelectedInvoice(matched);
          }
        }
      } else if (hash.includes('#machine=')) {
        const targetId = hash.split('#machine=')[1];
        if (targetId) {
          const matched = inventory.find(
            m => m.stockId.toLowerCase() === targetId.toLowerCase() ||
                 (m.serialNumber && m.serialNumber.toLowerCase() === targetId.toLowerCase())
          );
          if (matched) {
            setSelectedMachineStockId(matched.stockId);
            setActiveTab('inventory');
          }
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [sales, inventory]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const handleSelectMachine = (stockId: string) => {
    setSelectedMachineStockId(stockId);
  };

  const handleDeleteMachine = (id: string) => {
    if (window.confirm('Are you sure you want to delete this machine stock entry?')) {
      deleteMachine(id);
      refreshData();
      setSelectedMachineStockId(null);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('hwmh_is_authenticated', 'false');
  };

  const stats = getDashboardStats();
  const selectedMachine = inventory.find(m => m.stockId === selectedMachineStockId) || null;

  if (!isAuthenticated) {
    return (
      <>
        <PublicCustomerPortal
          settings={getSettings()}
          sales={sales}
          activeInvoiceNumber={urlInvoiceNumber}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onClearInvoiceQuery={() => setUrlInvoiceNumber(null)}
        />
        <StaffLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthenticated(true);
            localStorage.setItem('hwmh_is_authenticated', 'true');
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-teal-500 selection:text-white transition-colors duration-200">
      {/* Header Bar */}
      <Header
        currentUser={currentUser}
        allUsers={getUsers()}
        onSwitchUser={(user) => {
          saveCurrentUser(user);
          setCurrentUser(user);
          refreshData();
        }}
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          if (val && activeTab !== 'inventory' && activeTab !== 'sales' && activeTab !== 'purchases' && activeTab !== 'customers') {
            const matchesCustomer = customers.some(c => c.name.toLowerCase().includes(val.toLowerCase()) || c.phone.includes(val));
            if (matchesCustomer) {
              setActiveTab('customers');
            } else {
              setActiveTab('inventory');
            }
          }
        }}
        theme={theme}
        isDarkMode={theme === 'dark'}
        onToggleTheme={toggleTheme}
        onToggleDarkMode={toggleTheme}
        onOpenQuickBuy={() => setIsPurchaseModalOpen(true)}
        onOpenQuickSell={() => {
          setSellModalStockId(undefined);
          setIsSaleModalOpen(true);
        }}
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
        notifications={[]}
        onMarkNotificationRead={() => {}}
        onSwitchRole={(role) => setCurrentUser(prev => ({ ...prev, role }))}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSearchTerm('');
          }}
          currentUser={currentUser}
          isDarkMode={theme === 'dark'}
          onToggleDarkMode={toggleTheme}
          onToggleTheme={toggleTheme}
          onOpenQRScanner={() => setIsQRScannerOpen(true)}
          onOpenQuickBuy={() => setIsPurchaseModalOpen(true)}
          onOpenQuickSell={() => {
            setSellModalStockId(undefined);
            setIsSaleModalOpen(true);
          }}
          onLogout={handleLogout}
          stats={{
            totalStock: inventory.length,
            availableStock: inventory.filter(m => m.status === 'Available').length,
            pendingPaymentsCount: sales.filter(s => s.balanceDue > 0).length
          }}
        />

        {/* Dynamic Content View */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-20 md:pb-6">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              stats={stats}
              inventory={inventory}
              sales={sales}
              purchases={purchases}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenAddMachine={() => {
                setEditingMachine(null);
                setIsAddMachineOpen(true);
              }}
              onOpenAddPurchase={() => setIsPurchaseModalOpen(true)}
              onOpenAddSale={() => {
                setSellModalStockId(undefined);
                setIsSaleModalOpen(true);
              }}
              onOpenQuickBuy={() => setIsPurchaseModalOpen(true)}
              onOpenQuickSell={() => {
                setSellModalStockId(undefined);
                setIsSaleModalOpen(true);
              }}
              onOpenQRScanner={() => setIsQRScannerOpen(true)}
              onSelectMachine={handleSelectMachine}
              onOpenQRModal={(machine) => setQrMachine(machine)}
              onRecordPayment={(s: SaleRecord) => setPaymentModalSale(s)}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryList
              inventory={inventory}
              currentUser={currentUser}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenAddMachine={() => {
                setEditingMachine(null);
                setIsAddMachineOpen(true);
              }}
              onSelectMachine={handleSelectMachine}
              onEditMachine={(m) => {
                setEditingMachine(m);
                setIsAddMachineOpen(true);
              }}
              onDeleteMachine={handleDeleteMachine}
              onOpenQRModal={(m) => setQrMachine(m)}
              onOpenExpenseModal={(stockId) => {
                setExpenseStockId(stockId);
                setIsExpenseModalOpen(true);
              }}
              onOpenSellModal={(stockId) => {
                setSellModalStockId(stockId);
                setIsSaleModalOpen(true);
              }}
            />
          )}

          {activeTab === 'spareparts' && (
            <SparePartsOverview settings={businessSettings} />
          )}

          {activeTab === 'purchases' && (
            <PurchaseList
              purchases={purchases}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenAddPurchase={() => setIsPurchaseModalOpen(true)}
              onOpenBulkPurchase={() => setIsBulkPurchaseModalOpen(true)}
              onSelectPurchase={(p) => setSelectedPurchase(p)}
            />
          )}

          {activeTab === 'sales' && (
            <SalesList
              sales={sales}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenAddSale={() => {
                setSellModalStockId(undefined);
                setIsSaleModalOpen(true);
              }}
              onSelectSale={(s) => setSelectedInvoice(s)}
              onRecordPayment={(s) => setPaymentModalSale(s)}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerList
              customers={customers}
              sales={sales}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onViewInvoice={(s) => setSelectedInvoice(s)}
              onRecordPayment={(s) => setPaymentModalSale(s)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsOverview
              sales={sales}
              purchases={purchases}
              inventory={inventory}
              expenses={expenses}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={businessSettings}
              currentUser={currentUser}
              onUpdateSettings={(newSettings) => {
                setBusinessSettings(newSettings);
                refreshData();
              }}
            />
          )}
        </main>
      </div>

      {/* Modals & Overlays */}
      <MachineFormModal
        isOpen={isAddMachineOpen}
        editingMachine={editingMachine}
        onClose={() => {
          setIsAddMachineOpen(false);
          setEditingMachine(null);
        }}
        onSuccess={refreshData}
      />

      <MachineDetailPage
        machine={selectedMachine}
        isOpen={!!selectedMachineStockId}
        currentUser={currentUser}
        onClose={() => setSelectedMachineStockId(null)}
        onEdit={(m) => {
          setEditingMachine(m);
          setIsAddMachineOpen(true);
        }}
        onDelete={handleDeleteMachine}
        onOpenQRModal={(m) => setQrMachine(m)}
        onOpenExpenseModal={(stockId) => {
          setExpenseStockId(stockId);
          setIsExpenseModalOpen(true);
        }}
        onOpenSellModal={(stockId) => {
          setSellModalStockId(stockId);
          setIsSaleModalOpen(true);
        }}
      />

      <MachineQRModal
        machine={qrMachine}
        isOpen={!!qrMachine}
        onClose={() => setQrMachine(null)}
      />

      <PurchaseFormModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={(stockId) => {
          refreshData();
          setSelectedMachineStockId(stockId);
        }}
      />

      <BulkPurchaseModal
        isOpen={isBulkPurchaseModalOpen}
        onClose={() => setIsBulkPurchaseModalOpen(false)}
        onSuccess={() => {
          refreshData();
          setActiveTab('inventory');
        }}
      />

      <PurchaseReceiptModal
        purchase={selectedPurchase}
        isOpen={!!selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
      />

      <SellMachineModal
        isOpen={isSaleModalOpen}
        preselectedStockId={sellModalStockId}
        availableMachines={inventory.filter(m => m.status === 'Available' || m.stockId === sellModalStockId)}
        onClose={() => {
          setIsSaleModalOpen(false);
          setSellModalStockId(undefined);
        }}
        onSuccess={(invoiceNumber: string) => {
          refreshData();
          const newlyCreatedSale = getSales().find(s => s.invoiceNumber === invoiceNumber) || null;
          setSelectedInvoice(newlyCreatedSale);
        }}
      />

      <PaymentModal
        sale={paymentModalSale}
        isOpen={!!paymentModalSale}
        onClose={() => setPaymentModalSale(null)}
        onSuccess={() => {
          refreshData();
          setPaymentModalSale(null);
          // Update selectedInvoice if it's the one being paid
          if (selectedInvoice) {
            const updated = getSales().find(s => s.invoiceNumber === selectedInvoice.invoiceNumber) || null;
            setSelectedInvoice(updated);
          }
        }}
      />

      <InvoiceView
        sale={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onRecordPayment={(s) => setPaymentModalSale(s)}
        onPaymentStatusUpdate={refreshData}
      />

      <RepairExpenseModal
        isOpen={isExpenseModalOpen}
        stockId={expenseStockId}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseStockId(undefined);
        }}
        onSuccess={refreshData}
      />

      <MachineDetailPage
        machine={selectedMachine}
        isOpen={!!selectedMachine}
        currentUser={currentUser}
        onClose={() => setSelectedMachineStockId(null)}
        onEdit={(m) => {
          setSelectedMachineStockId(null);
          setEditingMachine(m);
          setIsAddMachineOpen(true);
        }}
        onDelete={handleDeleteMachine}
        onOpenQRModal={(m) => setQrMachine(m)}
        onOpenExpenseModal={(stockId) => {
          setExpenseStockId(stockId);
          setIsExpenseModalOpen(true);
        }}
        onOpenSellModal={(stockId) => {
          setSelectedMachineStockId(null);
          setSellModalStockId(stockId);
          setIsSaleModalOpen(true);
        }}
      />

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onSelectMachine={(stockId) => {
          setSelectedMachineStockId(stockId);
          setActiveTab('inventory');
        }}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSearchTerm('');
        }}
        onOpenQuickBuy={() => setIsPurchaseModalOpen(true)}
        onOpenQuickSell={() => {
          setSellModalStockId(undefined);
          setIsSaleModalOpen(true);
        }}
        onLogout={handleLogout}
      />
    </div>
  );
}
