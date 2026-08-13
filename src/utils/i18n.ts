import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav & Dashboard
    dashboard: 'Dashboard',
    inventory: 'Inventory Stock',
    spareparts: 'Spare Parts (Cart)',
    repair: 'Repairing & Service',
    purchases: 'Purchases (Buy)',
    sales: 'Sales & Billing',
    customers: 'Customers',
    reports: 'Reports & Profit',
    settings: 'Shop Settings',
    quick_access: 'Quick Access All Modules',
    quick_access_sub: 'Instant 1-click navigation to all hub management sections',
    available_stock: 'Available Stock',
    today_sales: 'Today Sales',
    today_revenue: 'Today Revenue',
    today_profit: 'Today Profit',
    pending_dues: 'Pending Dues',
    buy_machine: '+ Buy Machine',
    sell_machine: '+ Sell Machine',
    issue_repair_bill: '+ Repairing Bill',
    parts_checkout: 'Parts Checkout',

    // Invoices Common
    tax_invoice: 'TAX INVOICE',
    spare_parts_invoice: 'SPARE PARTS INVOICE',
    repair_bill: 'REPAIRING & SERVICE BILL',
    customer_details: 'Customer Details',
    appliance_specs: 'Appliance & Repair Specs',
    description: 'Description',
    amount: 'Amount (₹)',
    repair_charges: 'Washing Machine Repairing Charges',
    labour_fees: 'Labour & Service Fees',
    attached_parts: 'Attached Spare Parts',
    subtotal: 'Subtotal',
    discount: 'Discount Applied',
    total_amount: 'Total Billed Amount',
    amount_paid: 'Amount Paid',
    balance_due: 'Balance Remaining',
    payment_status: 'Payment Status',
    paid: 'Paid',
    partially_paid: 'Partially Paid',
    unpaid: 'Unpaid',
    phone_wa: 'Phone / WhatsApp',
    email: 'Email',
    date: 'Date',
    thank_you: 'Thank you for shopping at Hatimi Washing Machine Hub!',
    bill_lang: 'Bill Language:'
  },

  hi: {
    // Nav & Dashboard
    dashboard: 'डैशबोर्ड (होम)',
    inventory: 'स्टॉक इन्वेंटरी',
    spareparts: 'स्पेयर पार्ट्स (कार्ट)',
    repair: 'मरम्मत और सर्विस',
    purchases: 'मशीन खरीदारी',
    sales: 'बिक्री और बिलिंग',
    customers: 'ग्राहक सूची',
    reports: 'रिपोर्ट और लाभ',
    settings: 'दुकान सेटिंग्स',
    quick_access: 'त्वरित पहुंच (सभी अनुभाग)',
    quick_access_sub: 'हब के सभी प्रबंधकीय अनुभागों पर तुरंत जाएं',
    available_stock: 'उपलब्ध स्टॉक',
    today_sales: 'आज की बिक्री',
    today_revenue: 'आज की कुल बिक्री',
    today_profit: 'आज का शुद्ध लाभ',
    pending_dues: 'कुल बकाया राशि',
    buy_machine: '+ मशीन खरीदें',
    sell_machine: '+ मशीन बेचें',
    issue_repair_bill: '+ मरम्मत बिल बनाएं',
    parts_checkout: 'स्पेयर पार्ट बिलिंग',

    // Invoices Common
    tax_invoice: 'टैक्स बिल (TAX INVOICE)',
    spare_parts_invoice: 'स्पेयर पार्ट्स रसीद',
    repair_bill: 'मरम्मत एवं सर्विस बिल',
    customer_details: 'ग्राहक का विवरण',
    appliance_specs: 'मशीन व मरम्मत विवरण',
    description: 'विवरण',
    amount: 'राशि (₹)',
    repair_charges: 'वाशिंग मशीन मरम्मत शुल्क',
    labour_fees: 'मजदूरी एवं सर्विस शुल्क',
    attached_parts: 'जोड़े गए स्पेयर पार्ट्स',
    subtotal: 'उप-योग (Subtotal)',
    discount: 'छूट (Discount)',
    total_amount: 'कुल देय राशि (Total)',
    amount_paid: 'प्राप्त राशि (Paid)',
    balance_due: 'बकाया राशि (Balance Due)',
    payment_status: 'भुगतान स्थिति',
    paid: 'चुकता (Paid)',
    partially_paid: 'आंशिक भुगतान',
    unpaid: 'बकाया (Unpaid)',
    phone_wa: 'फोन / व्हाट्सएप',
    email: 'ईमेल',
    date: 'दिनांक',
    thank_you: 'हातिमी वाशिंग मशीन हब पर भरोसा करने के लिए धन्यवाद!',
    bill_lang: 'बिल भाषा (Language):'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('hwmh_language');
    return (saved === 'hi' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('hwmh_language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage, t } },
    children
  );
};

export const useLanguage = () => useContext(LanguageContext);
