import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    products: 'Products',
    billing: 'Billing',
    customers: 'Customers',
    bookings: 'Bookings',
    borrowings: 'Borrowings',
    messages: 'Messages',
    language: 'Language',
    
    // Products
    'add.product': 'Add Product',
    'scan': 'Scan',
    
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
    'print.bill': 'Print Bill',
    'previous.bill': 'Previous Bill',
    'bill.date': 'Bill Date',
    'shop.name': 'Shree Alankar',
    'shop.address': 'Near Bank Of Maharashtra, Lohoner',
    'shop.phone': '+91 9921612155',
    'shop.email': 'kiranjadhav3230@gmail.com',
    'gst.number': 'GST Number',
    'bill.to': 'Bill To',
    'sr.no': 'Sr. No.',
    'description': 'Description',
    'weight': 'Weight',
    'rate': 'Rate',
    'amount': 'Amount',
    'subtotal': 'Subtotal',
    'total': 'Total',
    'received': 'Received',
    'balance': 'Balance',
    'signature': 'Signature',
    'terms.conditions': 'Terms & Conditions',
    'thanks.visit': 'Thank you for your visit!',
    'gold': 'Gold',
    'silver': 'Silver',
    'share.whatsapp': 'Share via WhatsApp',
    'save.pdf': 'Save as PDF',
    'delete.only': 'Delete Only',
    'delete.from.turnover': 'Delete from Turnover',
    
    // Borrowings
    'borrowed.amount': 'Borrowed Amount',
    'interest.rate': 'Interest Rate',
    'borrowed.date': 'Borrowed Date',
    'due.date': 'Due Date',
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
    'phone': 'Phone',
    'email': 'Email',
    'address': 'Address',
  },
  mr: {
    // Navigation  
    dashboard: 'डॅशबोर्ड',
    products: 'उत्पादने',
    billing: 'बिलिंग',
    customers: 'ग्राहक',
    bookings: 'बुकिंग',
    borrowings: 'कर्ज',
    messages: 'संदेश',
    language: 'भाषा',
    
    // Products  
    'add.product': 'उत्पादन जोडा',
    'scan': 'स्कॅन',
    
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
    'print.bill': 'बिल प्रिंट करा',
    'previous.bill': 'मागील बिल',
    'bill.date': 'बिलाची तारीख',
    'shop.name': 'श्री अलंकार',
    'shop.address': 'बँक ऑफ महाराष्ट्र जवळ, लोहोनेर',
    'shop.phone': '+91 9921612155',
    'shop.email': 'kiranjadhav3230@gmail.com',
    'gst.number': 'जीएसटी क्रमांक',
    'bill.to': 'बिल प्राप्तकर्ता',
    'sr.no': 'अ.क्र.',
    'description': 'तपशील',
    'weight': 'वजन',
    'rate': 'दर',
    'amount': 'रक्कम',
    'subtotal': 'उपबेरीज',
    'total': 'एकूण',
    'received': 'मिळाले',
    'balance': 'बाकी',
    'signature': 'सही',
    'terms.conditions': 'अटी व शर्ती',
    'thanks.visit': 'आपल्या भेटीबद्दल धन्यवाद!',
    'gold': 'सोने',
    'silver': 'चांदी',
    'share.whatsapp': 'व्हाट्सअॅपवर शेअर करा',
    'save.pdf': 'PDF म्हणून जतन करा',
    'delete.only': 'फक्त हटवा',
    'delete.from.turnover': 'व्यापारातून हटवा',
    
    // Borrowings
    'borrowed.amount': 'कर्जाची रक्कम',
    'interest.rate': 'व्याजदर',
    'borrowed.date': 'कर्जाची तारीख',
    'due.date': 'भरणे योग्य तारीख',
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