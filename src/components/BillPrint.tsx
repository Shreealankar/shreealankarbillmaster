import React from 'react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Printer, Share, Download } from 'lucide-react';

interface BillPrintProps {
  billData: {
    bill_number: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    created_at: string;
    total_weight: number;
    total_amount: number;
    discount_percentage: number;
    discount_amount: number;
    tax_percentage: number;
    tax_amount: number;
    final_amount: number;
    paid_amount: number;
    balance_amount: number;
    payment_method: string;
    notes: string;
  };
  billItems: Array<{
    item_name: string;
    metal_type: string;
    purity: string;
    weight_grams: number;
    rate_per_gram: number;
    making_charges: number;
    stone_charges: number;
    other_charges: number;
    total_amount: number;
  }>;
}

export const BillPrint: React.FC<BillPrintProps> = ({ billData, billItems }) => {
  const { t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = async () => {
    // Create a better formatted message for WhatsApp
    const billContent = `
🏪 ${t('shop.name')}
📄 ${t('bill.number')}: ${billData.bill_number}
👤 ${t('customer.name')}: ${billData.customer_name}
📞 ${t('phone')}: ${billData.customer_phone}
📅 ${t('date')}: ${format(new Date(billData.created_at), 'dd/MM/yyyy')}

💰 ${t('total')}: ₹${billData.final_amount.toLocaleString('en-IN')}
💵 ${t('paid')}: ₹${billData.paid_amount.toLocaleString('en-IN')}
⚖️ ${t('balance')}: ₹${billData.balance_amount.toLocaleString('en-IN')}

🙏 ${t('thanks.visit')}
    `.trim();
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(billContent)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSavePDF = () => {
    window.print();
  };

  return (
    <>
      {/* Print Controls - Hidden in print */}
      <div className="max-w-4xl mx-auto mb-4 print:hidden">
        <div className="flex gap-2 justify-center">
          <Button onClick={handlePrint} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
            <Printer className="h-4 w-4" />
            Print Bill
          </Button>
          <Button onClick={handleWhatsAppShare} variant="outline" className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50">
            <Share className="h-4 w-4" />
            Share WhatsApp
          </Button>
          <Button onClick={handleSavePDF} variant="outline" className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50">
            <Download className="h-4 w-4" />
            Save PDF
          </Button>
        </div>
      </div>

      {/* Print styles to ensure bill starts from top */}
      <style>{`
        @media print {
          * {
            margin: 0 !important;
            padding: 0 !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
          }
          .print-container {
            margin: 0 !important;
            padding: 0 !important;
            page-break-inside: avoid;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="print-container max-w-4xl mx-auto p-6 bg-white text-black print:p-0 print:m-0 print:max-w-none print:mx-0 print:text-sm" 
           style={{ fontFamily: "'Shree Devanagari 714', 'Kruti Dev 040', 'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif" }}>
        {/* Header with Logo */}
        <div className="text-center pb-4 mb-4 print:pb-2 print:mb-2">
          <div className="flex justify-center mb-3 print:mb-2">
            <div className="w-20 h-20 print:w-16 print:h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center border-4 border-yellow-300">
              <div className="text-center">
                <div className="text-yellow-900 font-bold text-xs print:text-xs leading-tight">
                  SHREE<br/>ALANKAR
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-yellow-600 mb-1 print:text-lg print:mb-0.5" 
              style={{ fontFamily: "'Shree Devanagari 714', 'Kruti Dev 040', 'Mangal', 'Arial Unicode MS', sans-serif" }}>
            {t('shop.name')}
          </h1>
          
          <div className="text-sm text-gray-700 print:text-xs space-y-1 print:space-y-0.5">
            <p className="font-medium">{t('shop.address')}</p>
            <p>Contact: {t('shop.phone')}</p>
            <p>Owner: Kiran Raghunath Jadhav</p>
          </div>
        </div>

        {/* Bill Number and Date */}
        <div className="flex justify-between items-center mb-4 print:mb-2 border-b border-gray-300 pb-2 print:pb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm print:text-xs">{t('bill.number')}:</span>
            <span className="text-sm print:text-xs">{billData.bill_number}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm print:text-xs">{t('date')}:</span>
            <span className="text-sm print:text-xs">{format(new Date(billData.created_at), 'yyyy-MM-dd')}</span>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-4 print:mb-2">
          <h3 className="text-yellow-600 font-semibold mb-2 print:text-sm print:mb-1">Customer Details</h3>
          <div className="grid grid-cols-2 gap-4 print:gap-2 text-sm print:text-xs">
            <div>
              <span className="font-medium">Name:</span> {billData.customer_name}
            </div>
            <div>
              <span className="font-medium">Mobile:</span> {billData.customer_phone}
            </div>
            <div>
              <span className="font-medium">Address:</span> {billData.customer_address || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Email:</span> N/A
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-4 print:mb-2">
          <table className="w-full border-collapse border border-gray-400 text-sm print:text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-2 print:p-1 text-left font-medium">#</th>
                <th className="border border-gray-400 p-2 print:p-1 text-left font-medium">Item Name</th>
                <th className="border border-gray-400 p-2 print:p-1 text-left font-medium">Type</th>
                <th className="border border-gray-400 p-2 print:p-1 text-left font-medium">Weight (gm)</th>
                <th className="border border-gray-400 p-2 print:p-1 text-left font-medium">Rate</th>
                <th className="border border-gray-400 p-2 print:p-1 text-left font-medium">Making Charges</th>
                <th className="border border-gray-400 p-2 print:p-1 text-left font-medium">Other Charges</th>
                <th className="border border-gray-400 p-2 print:p-1 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {billItems.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-2 print:p-1">{index + 1}</td>
                  <td className="border border-gray-400 p-2 print:p-1">{item.item_name}</td>
                  <td className="border border-gray-400 p-2 print:p-1">{t(item.metal_type.toLowerCase())}/{item.purity}</td>
                  <td className="border border-gray-400 p-2 print:p-1">{item.weight_grams}</td>
                  <td className="border border-gray-400 p-2 print:p-1">₹{item.rate_per_gram.toLocaleString('en-IN')}</td>
                  <td className="border border-gray-400 p-2 print:p-1">₹{(item.making_charges || 0).toLocaleString('en-IN')}</td>
                  <td className="border border-gray-400 p-2 print:p-1">₹{(item.other_charges || 0).toLocaleString('en-IN')}</td>
                  <td className="border border-gray-400 p-2 print:p-1 text-right">₹{item.total_amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {/* Empty rows to maintain table structure */}
              {billItems.length === 0 && (
                <tr>
                  <td className="border border-gray-400 p-2 print:p-1" colSpan={8}>&nbsp;</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="text-right mb-4 print:mb-2">
          <div className="inline-block text-sm print:text-xs space-y-1 print:space-y-0.5">
            <div className="flex justify-between w-64 print:w-48">
              <span className="font-medium">Total Amount:</span>
              <span>₹{billData.total_amount.toLocaleString('en-IN')}</span>
            </div>
            {billData.discount_amount > 0 && (
              <div className="flex justify-between w-64 print:w-48 text-green-600">
                <span className="font-medium">Discount ({billData.discount_percentage}%):</span>
                <span>-₹{billData.discount_amount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {billData.tax_amount > 0 && (
              <div className="flex justify-between w-64 print:w-48">
                <span className="font-medium">Tax ({billData.tax_percentage}%):</span>
                <span>₹{billData.tax_amount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between w-64 print:w-48 font-bold text-base print:text-sm border-t border-gray-400 pt-1">
              <span>Final Amount:</span>
              <span>₹{billData.final_amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between w-64 print:w-48">
              <span className="font-medium">Paid Amount:</span>
              <span>₹{billData.paid_amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between w-64 print:w-48">
              <span className="font-medium">Remaining Amount:</span>
              <span className={billData.balance_amount > 0 ? 'text-red-600' : 'text-green-600'}>
                {billData.balance_amount > 0 ? '₹' + billData.balance_amount.toLocaleString('en-IN') : '-₹' + Math.abs(billData.balance_amount).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between w-64 print:w-48">
              <span className="font-medium">Payment Method:</span>
              <span>{billData.payment_method || 'cash'}</span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions with QR Code */}
        <div className="border-t border-gray-400 pt-4 print:pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:gap-2">
            <div className="md:col-span-2">
              <h4 className="text-yellow-600 font-semibold mb-2 print:text-sm print:mb-1">Terms and Conditions</h4>
              <ol className="text-xs space-y-1 print:space-y-0.5 text-gray-700">
                <li>1. Gold Purity is 97.5% or 99.5%</li>
                <li>2. 99.5% gold price per gram will be Rs.100 higher</li>
                <li>3. For more terms and conditions, scan QR</li>
              </ol>
            </div>
            
            <div className="flex justify-center md:justify-end">
              <div className="w-20 h-20 print:w-16 print:h-16 border border-gray-400 bg-white flex items-center justify-center">
                <div className="text-xs text-gray-500 text-center">QR<br/>Code</div>
              </div>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-6 print:mt-4">
          <p className="text-lg font-medium text-yellow-600 print:text-sm">{t('thanks.visit')}</p>
          <p className="text-xs text-gray-600 mt-1 print:mt-0.5">Visit Again</p>
        </div>
      </div>
    </>
  );
};