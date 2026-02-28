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
    customer_email?: string;
    customer_gstin?: string;
    created_at: string;
    total_weight: number;
    total_amount: number;
    discount_percentage: number;
    discount_amount: number;
    tax_percentage: number;
    tax_amount: number;
    cgst_amount?: number;
    sgst_amount?: number;
    igst_amount?: number;
    is_igst?: boolean;
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
  isExistingBill?: boolean;
}

export const BillPrint: React.FC<BillPrintProps> = ({ billData, billItems, isExistingBill = false }) => {
  const { t } = useLanguage();

  const SHOP_GSTIN = '27XXXXX0000X1Z5'; // Replace with actual GSTIN

  // Convert number to words (Indian system)
  const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    const integer = Math.floor(num);
    const paise = Math.round((num - integer) * 100);
    
    let result = '';
    if (integer >= 10000000) {
      result += convertLessThanThousand(Math.floor(integer / 10000000)) + ' Crore ';
      num = integer % 10000000;
    } else { num = integer; }
    if (num >= 100000) {
      result += convertLessThanThousand(Math.floor(num / 100000)) + ' Lakh ';
      num = num % 100000;
    }
    if (num >= 1000) {
      result += convertLessThanThousand(Math.floor(num / 1000)) + ' Thousand ';
      num = num % 1000;
    }
    result += convertLessThanThousand(num);
    
    result = 'Rupees ' + result.trim();
    if (paise > 0) {
      result += ' and ' + convertLessThanThousand(paise) + ' Paise';
    }
    return result + ' Only';
  };

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
            {isExistingBill ? 'Reprint Bill' : 'Print Bill'}
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

      {/* Print styles to ensure only bill prints */}
      <style>{`
        @media print {
          @page {
            margin: 0.5cm;
            size: A4;
          }
          
          /* Hide everything by default */
          body * {
            visibility: hidden !important;
          }
          
          /* Show only the print container and its children */
          .print-container,
          .print-container * {
            visibility: visible !important;
          }
          
          /* Position print container at top left */
          .print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            page-break-inside: avoid;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Ensure proper layout */
          html, body {
            height: auto !important;
            overflow: visible !important;
          }
        }
      `}</style>

      <div className="print-container max-w-4xl mx-auto p-6 bg-white text-black print:p-0 print:m-0 print:max-w-none print:mx-0 print:text-sm" 
           style={{ fontFamily: "'Shree Devanagari 714', 'Kruti Dev 040', 'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif" }}>
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-6 print:p-4 print:mb-4 print:bg-white print:border-gray-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/a353b3db-e82b-4bbf-9ce4-2324f1d83ca1.png" 
                alt="Shree Alankar Logo" 
                className="w-16 h-16 print:w-12 print:h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent print:text-black print:text-xl" 
                    style={{ fontFamily: "'Shree Devanagari 714', 'Kruti Dev 040', 'Mangal', 'Arial Unicode MS', sans-serif" }}>
                  {t('shop.name')}
                </h1>
                <p className="text-sm text-gray-600 print:text-xs font-medium">Gold & Silver Ornaments</p>
                <p className="text-xs text-gray-500 print:text-xs">{t('shop.address')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700 print:text-xs">Contact: {t('shop.phone')}</p>
              <p className="text-xs text-gray-600">Owner: Kiran Raghunath Jadhav</p>
            </div>
          </div>
        </div>

        {/* Tax Invoice Header */}
        <div className="bg-gray-50 border-l-4 border-yellow-500 p-4 mb-6 print:bg-white print:border-gray-400 print:p-2 print:mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-800 print:text-base">TAX INVOICE</h2>
              <p className="text-sm text-gray-600 print:text-xs">{t('bill.number')}: <span className="font-mono font-semibold">{billData.bill_number}</span></p>
              <p className="text-xs text-gray-500 print:text-xs">GSTIN: <span className="font-mono font-semibold">{SHOP_GSTIN}</span></p>
              <p className="text-xs text-gray-500 print:text-xs">State: Maharashtra | Code: 27</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 print:text-xs">{t('date')}: {format(new Date(billData.created_at), 'dd/MM/yyyy')}</p>
              <p className="text-xs text-gray-500">Time: {format(new Date(billData.created_at), 'hh:mm a')}</p>
            </div>
          </div>
        </div>

        {/* Customer Details Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6 print:shadow-none print:p-2 print:mb-4">
          <h3 className="text-lg font-semibold text-yellow-600 mb-3 print:text-base print:mb-2">Customer Details</h3>
          <div className="grid grid-cols-2 gap-4 print:gap-2">
            <div className="space-y-2 print:space-y-1">
              <div className="flex">
                <span className="text-sm font-medium text-gray-700 w-16 print:text-xs">Name:</span>
                <span className="text-sm text-gray-900 print:text-xs">{billData.customer_name}</span>
              </div>
              <div className="flex">
                <span className="text-sm font-medium text-gray-700 w-16 print:text-xs">Address:</span>
                <span className="text-sm text-gray-900 print:text-xs">{billData.customer_address || 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-2 print:space-y-1">
              <div className="flex">
                <span className="text-sm font-medium text-gray-700 w-16 print:text-xs">Mobile:</span>
                <span className="text-sm text-gray-900 print:text-xs">{billData.customer_phone}</span>
              </div>
              <div className="flex">
                <span className="text-sm font-medium text-gray-700 w-16 print:text-xs">Email:</span>
                <span className="text-sm text-gray-900 print:text-xs">{billData.customer_email || 'N/A'}</span>
              </div>
              {billData.customer_gstin && (
                <div className="flex">
                  <span className="text-sm font-medium text-gray-700 w-16 print:text-xs">GSTIN:</span>
                  <span className="text-sm text-gray-900 font-mono print:text-xs">{billData.customer_gstin}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modern Items Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6 print:shadow-none print:mb-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white print:bg-gray-100 print:text-black">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold print:px-2 print:py-1 print:text-xs">#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold print:px-2 print:py-1 print:text-xs">Item Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold print:px-2 print:py-1 print:text-xs">HSN</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold print:px-2 print:py-1 print:text-xs">Type/Purity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold print:px-2 print:py-1 print:text-xs">Weight (g)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold print:px-2 print:py-1 print:text-xs">Rate/g</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold print:px-2 print:py-1 print:text-xs">Making</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold print:px-2 print:py-1 print:text-xs">Other</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold print:px-2 print:py-1 print:text-xs">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {billItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 print:hover:bg-white">
                    <td className="px-4 py-3 text-sm print:px-2 print:py-1 print:text-xs">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium print:px-2 print:py-1 print:text-xs">{item.item_name}</td>
                    <td className="px-4 py-3 text-sm font-mono print:px-2 print:py-1 print:text-xs">{(item as any).hsn_code || '7113'}</td>
                    <td className="px-4 py-3 text-sm print:px-2 print:py-1 print:text-xs">{t(item.metal_type.toLowerCase())}/{item.purity}</td>
                    <td className="px-4 py-3 text-sm print:px-2 print:py-1 print:text-xs">{item.weight_grams}g</td>
                    <td className="px-4 py-3 text-sm print:px-2 print:py-1 print:text-xs">₹{item.rate_per_gram.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm print:px-2 print:py-1 print:text-xs">₹{(item.making_charges || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm print:px-2 print:py-1 print:text-xs">₹{(item.other_charges || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-right print:px-2 print:py-1 print:text-xs">₹{item.total_amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                {billItems.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500 print:py-4">No items added</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modern Totals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 print:gap-4 print:mb-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 print:p-2">
            <h4 className="font-semibold text-gray-800 mb-3 print:text-sm print:mb-2">Payment Details</h4>
            <div className="space-y-2 print:space-y-1">
              <div className="flex justify-between text-sm print:text-xs">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">{billData.payment_method || 'Cash'}</span>
              </div>
              <div className="flex justify-between text-sm print:text-xs">
                <span className="text-gray-600">Total Weight:</span>
                <span className="font-medium">{billData.total_weight}g</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 print:bg-white print:border-gray-300 print:p-2">
            <div className="space-y-3 print:space-y-1">
              <div className="flex justify-between text-sm print:text-xs">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-medium">₹{billData.total_amount.toLocaleString('en-IN')}</span>
              </div>
              
              {billData.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600 print:text-xs">
                  <span>Discount ({billData.discount_percentage}%):</span>
                  <span className="font-medium">-₹{billData.discount_amount.toLocaleString('en-IN')}</span>
                </div>
              )}
              
              {billData.tax_amount > 0 && (
                <div className="flex justify-between text-sm print:text-xs">
                  <span className="text-gray-700">Tax ({billData.tax_percentage}%):</span>
                  <span className="font-medium">₹{billData.tax_amount.toLocaleString('en-IN')}</span>
                </div>
              )}
              
              <div className="border-t border-yellow-300 pt-2 print:border-gray-300 print:pt-1">
                <div className="flex justify-between text-lg font-bold text-gray-900 print:text-sm">
                  <span>Total Amount:</span>
                  <span>₹{billData.final_amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div className="flex justify-between text-sm print:text-xs">
                <span className="text-gray-700">Paid Amount:</span>
                <span className="font-medium text-green-600">₹{billData.paid_amount.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between text-sm print:text-xs">
                <span className="text-gray-700">Balance:</span>
                <span className={`font-medium ${billData.balance_amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {billData.balance_amount > 0 
                    ? `₹${billData.balance_amount.toLocaleString('en-IN')}` 
                    : `-₹${Math.abs(billData.balance_amount).toLocaleString('en-IN')}`
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with QR and Terms */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 print:bg-white print:border-gray-300 print:p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:gap-4">
            {/* Terms */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold text-yellow-600 mb-3 print:text-base print:mb-2">Terms & Conditions</h4>
              <ul className="space-y-1 text-sm text-gray-700 print:text-xs print:space-y-0.5">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Gold Purity is 97.5% or 99.5%</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>99.5% gold price per gram will be Rs.100 higher</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>For more terms and conditions, scan QR code</span>
                </li>
              </ul>
            </div>
            
            {/* QR Code */}
            <div className="flex flex-col items-center justify-center">
              <img 
                src="/lovable-uploads/ba105f2d-1670-4942-9701-23ded4e80a28.png" 
                alt="QR Code for Shree Alankar" 
                className="w-24 h-24 print:w-20 print:h-20 border border-gray-300 rounded-lg shadow-sm"
              />
              <p className="text-xs text-gray-600 mt-2 text-center print:mt-1">Scan for more info</p>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-8 print:mt-4">
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 rounded-full print:bg-gray-800 print:px-4 print:py-2">
            <p className="text-lg font-semibold print:text-sm">{t('thanks.visit')}</p>
          </div>
          <p className="text-sm text-gray-600 mt-2 print:text-xs print:mt-1">Visit Again for Premium Jewelry Experience</p>
        </div>
      </div>
    </>
  );
};