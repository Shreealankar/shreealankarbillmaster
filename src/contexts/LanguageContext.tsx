import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    'jewelry.billing.system': 'Jewelry Billing System',
    'dashboard': 'Dashboard',
    'billing': 'Billing',
    'customers': 'Customers',
    'borrowings': 'Borrowings',
    'messages': 'Messages',
    'rates': 'Rates',
    'language': 'Language',
    
    // Dashboard
    'daily.turnover': 'Daily Turnover',
    'monthly.turnover': 'Monthly Turnover',
    'yearly.turnover': 'Yearly Turnover',
    'total.customers': 'Total Customers',
    'recent.bills': 'Recent Bills',
    'pending.borrowings': 'Pending Borrowings',
    
    // Billing
    'create.new.bill': 'Create New Bill',
    'bill.number': 'Bill Number',
    'customer.name': 'Customer Name',
    'customer.phone': 'Customer Phone',
    'customer.address': 'Customer Address',
    'item.name': 'Item Name',
    'metal.type': 'Metal Type',
    'purity': 'Purity',
    'weight.grams': 'Weight (Grams)',
    'rate.per.gram': 'Rate per Gram',
    'making.charges': 'Making Charges',
    'stone.charges': 'Stone Charges',
    'other.charges': 'Other Charges',
    'total.amount': 'Total Amount',
    'discount': 'Discount',
    'tax': 'Tax',
    'final.amount': 'Final Amount',
    'paid.amount': 'Paid Amount',
    'balance.amount': 'Balance Amount',
    'payment.method': 'Payment Method',
    'cash': 'Cash',
    'card': 'Card',
    'upi': 'UPI',
    'notes': 'Notes',
    'save.bill': 'Save Bill',
    'print.bill': 'Print Bill',
    
    // Borrowings
    'borrowed.amount': 'Borrowed Amount',
    'interest.rate': 'Interest Rate',
    'borrowed.date': 'Borrowed Date',
    'due.date': 'Due Date',
    'balance': 'Balance',
    'status': 'Status',
    'active': 'Active',
    'paid': 'Paid',
    'overdue': 'Overdue',
    'send.reminder': 'Send Reminder',
    
    // Common
    'add': 'Add',
    'edit': 'Edit',
    'delete': 'Delete',
    'save': 'Save',
    'cancel': 'Cancel',
    'search': 'Search',
    'filter': 'Filter',
    'export': 'Export',
    'print': 'Print',
    'view': 'View',
    'actions': 'Actions',
    'date': 'Date',
    'amount': 'Amount',
    'phone': 'Phone',
    'email': 'Email',
    'address': 'Address',
  },
  mr: {
    // Header
    'jewelry.billing.system': 'दागिन्यांचे बिलिंग सिस्टम',
    'dashboard': 'डॅशबोर्ड',
    'billing': 'बिलिंग',
    'customers': 'ग्राहक',
    'borrowings': 'कर्ज',
    'messages': 'संदेश',
    'rates': 'दर',
    'language': 'भाषा',
    
    // Dashboard
    'daily.turnover': 'दैनिक व्यापार',
    'monthly.turnover': 'मासिक व्यापार',
    'yearly.turnover': 'वार्षिक व्यापार',
    'total.customers': 'एकूण ग्राहक',
    'recent.bills': 'अलीकडील बिले',
    'pending.borrowings': 'प्रलंबित कर्जे',
    
    // Billing
    'create.new.bill': 'नवीन बिल तयार करा',
    'bill.number': 'बिल क्रमांक',
    'customer.name': 'ग्राहकाचे नाव',
    'customer.phone': 'ग्राहकाचा फोन',
    'customer.address': 'ग्राहकाचा पत्ता',
    'item.name': 'वस्तूचे नाव',
    'metal.type': 'धातूचा प्रकार',
    'purity': 'शुद्धता',
    'weight.grams': 'वजन (ग्राम)',
    'rate.per.gram': 'प्रति ग्राम दर',
    'making.charges': 'मेकिंग चार्जेस',
    'stone.charges': 'दगडांचे चार्जेस',
    'other.charges': 'इतर चार्जेस',
    'total.amount': 'एकूण रक्कम',
    'discount': 'सूट',
    'tax': 'कर',
    'final.amount': 'अंतिम रक्कम',
    'paid.amount': 'भरलेली रक्कम',
    'balance.amount': 'बाकी रक्कम',
    'payment.method': 'पेमेंट पद्धत',
    'cash': 'रोख',
    'card': 'कार्ड',
    'upi': 'यूपीआय',
    'notes': 'टिप्पण्या',
    'save.bill': 'बिल जतन करा',
    'print.bill': 'बिल प्रिंट करा',
    
    // Borrowings
    'borrowed.amount': 'कर्जाची रक्कम',
    'interest.rate': 'व्याजदर',
    'borrowed.date': 'कर्जाची तारीख',
    'due.date': 'भरणे योग्य तारीख',
    'balance': 'बाकी',
    'status': 'स्थिती',
    'active': 'सक्रिय',
    'paid': 'भरलेले',
    'overdue': 'मुदत संपलेली',
    'send.reminder': 'स्मरणपत्र पाठवा',
    
    // Common
    'add': 'जोडा',
    'edit': 'संपादन',
    'delete': 'हटवा',
    'save': 'जतन करा',
    'cancel': 'रद्द करा',
    'search': 'शोधा',
    'filter': 'फिल्टर',
    'export': 'निर्यात',
    'print': 'प्रिंट',
    'view': 'पहा',
    'actions': 'क्रिया',
    'date': 'तारीख',
    'amount': 'रक्कम',
    'phone': 'फोन',
    'email': 'ईमेल',
    'address': 'पत्ता',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  
  const t = (key: string): string => {
    return translations[language][key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};