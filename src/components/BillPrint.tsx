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

  const handleWhatsAppShare = () => {
    const message = `${t('shop.name')} - ${t('bill.number')}: ${billData.bill_number}\n${t('total')}: ₹${billData.final_amount.toLocaleString('en-IN')}\n${t('thanks.visit')}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
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
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            {t('print.bill')}
          </Button>
          <Button onClick={handleWhatsAppShare} variant="outline" className="flex items-center gap-2">
            <Share className="h-4 w-4" />
            {t('share.whatsapp')}
          </Button>
          <Button onClick={handleSavePDF} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {t('save.pdf')}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 bg-white text-black print:p-4 print:max-w-none print:mx-0 print:text-sm">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-6 print:pb-2 print:mb-4">
          <div className="flex items-center justify-center gap-4 mb-2 print:gap-2 print:mb-1">
            <img 
              src="/lovable-uploads/a353b3db-e82b-4bbf-9ce4-2324f1d83ca1.png" 
              alt="Shree Alankar Logo" 
              className="h-16 w-16 print:h-12 print:w-12"
            />
            <div>
              <h1 className="text-3xl font-bold text-orange-600 print:text-xl">{t('shop.name').toUpperCase()}</h1>
              <p className="text-sm text-gray-600 print:text-xs">{t('gold')} & {t('silver')} Ornaments</p>
            </div>
          </div>
          <div className="text-sm text-gray-600 print:text-xs">
            <p>{t('shop.address')}</p>
            <p>{t('phone')}: {t('shop.phone')} | {t('email')}: {t('shop.email')}</p>
          </div>
        </div>

        {/* Bill Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 print:gap-4 print:mb-4">
          <div>
            <h2 className="text-lg font-semibold mb-2 print:text-base print:mb-1">{t('bill.to')}:</h2>
            <div className="text-sm print:text-xs">
              <p className="font-medium">{billData.customer_name}</p>
              <p>{billData.customer_phone}</p>
              {billData.customer_address && <p>{billData.customer_address}</p>}
            </div>
          </div>
          <div className="text-right print:text-left">
            <div className="text-sm print:text-xs">
              <p><span className="font-medium">{t('bill.number')}:</span> {billData.bill_number}</p>
              <p><span className="font-medium">{t('date')}:</span> {format(new Date(billData.created_at), 'dd/MM/yyyy')}</p>
              <p><span className="font-medium">Time:</span> {format(new Date(billData.created_at), 'hh:mm a')}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6 print:mb-4 overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 print:text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left text-sm font-medium print:p-1 print:text-xs">{t('sr.no')}</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium print:p-1 print:text-xs">{t('description')}</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium print:p-1 print:text-xs">{t('metal.type')}/{t('purity')}</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium print:p-1 print:text-xs">{t('weight')} (g)</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium print:p-1 print:text-xs">{t('rate')}/g</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium print:p-1 print:text-xs">{t('making.charges')}</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium print:p-1 print:text-xs">{t('stone.charges')}</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium print:p-1 print:text-xs">{t('other.charges')}</th>
                <th className="border border-gray-300 p-2 text-right text-sm font-medium print:p-1 print:text-xs">{t('amount')}</th>
              </tr>
            </thead>
            <tbody>
              {billItems.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2 text-sm print:p-1 print:text-xs">{index + 1}</td>
                  <td className="border border-gray-300 p-2 text-sm print:p-1 print:text-xs">{item.item_name}</td>
                  <td className="border border-gray-300 p-2 text-sm print:p-1 print:text-xs">{t(item.metal_type.toLowerCase())}/{item.purity}</td>
                  <td className="border border-gray-300 p-2 text-sm print:p-1 print:text-xs">{item.weight_grams}g</td>
                  <td className="border border-gray-300 p-2 text-sm print:p-1 print:text-xs">₹{item.rate_per_gram.toLocaleString('en-IN')}</td>
                  <td className="border border-gray-300 p-2 text-sm print:p-1 print:text-xs">₹{(item.making_charges || 0).toLocaleString('en-IN')}</td>
                  <td className="border border-gray-300 p-2 text-sm print:p-1 print:text-xs">₹{(item.stone_charges || 0).toLocaleString('en-IN')}</td>
                  <td className="border border-gray-300 p-2 text-sm print:p-1 print:text-xs">₹{(item.other_charges || 0).toLocaleString('en-IN')}</td>
                  <td className="border border-gray-300 p-2 text-sm text-right print:p-1 print:text-xs">₹{item.total_amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 print:gap-4 print:mb-4">
          <div>
            <h3 className="font-semibold mb-2 print:text-sm print:mb-1">Payment Details:</h3>
            <div className="text-sm space-y-1 print:text-xs print:space-y-0.5">
              <p><span className="font-medium">{t('payment.method')}:</span> {billData.payment_method ? t(billData.payment_method.toLowerCase()) : t('cash')}</p>
              <p><span className="font-medium">{t('total')} {t('weight')}:</span> {billData.total_weight}g</p>
            </div>
          </div>
          <div>
            <div className="bg-gray-50 p-4 rounded print:p-2 print:bg-gray-100">
              <div className="space-y-2 text-sm print:text-xs print:space-y-1">
                <div className="flex justify-between">
                  <span>{t('subtotal')}:</span>
                  <span>₹{billData.total_amount.toLocaleString('en-IN')}</span>
                </div>
                {billData.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('discount')} ({billData.discount_percentage}%):</span>
                    <span>-₹{billData.discount_amount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {billData.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span>{t('tax')} ({billData.tax_percentage}%):</span>
                    <span>₹{billData.tax_amount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <hr className="border-gray-300" />
                <div className="flex justify-between font-bold text-lg print:text-sm">
                  <span>{t('total')}:</span>
                  <span>₹{billData.final_amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('received')}:</span>
                  <span>₹{billData.paid_amount.toLocaleString('en-IN')}</span>
                </div>
                {billData.balance_amount > 0 && (
                  <div className="flex justify-between font-medium text-red-600">
                    <span>{t('balance')}:</span>
                    <span>₹{billData.balance_amount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 print:pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
            <div>
              <h4 className="font-semibold mb-2 print:text-sm print:mb-1">{t('terms.conditions')}:</h4>
              <ul className="text-xs space-y-1 text-gray-600 print:space-y-0.5">
                <li>• Goods once sold will not be taken back</li>
                <li>• All disputes subject to local jurisdiction</li>
                <li>• Payment to be made at the time of delivery</li>
              </ul>
            </div>
            
            <div className="text-right print:text-left">
              <div className="mb-6 print:mb-3">
                <p className="text-sm font-medium print:text-xs">Customer {t('signature')}</p>
                <div className="border-b border-gray-300 w-32 ml-auto mt-2 print:ml-0 print:w-24 print:mt-1"></div>
              </div>
              
              <div>
                <p className="text-sm font-medium print:text-xs">Authorized {t('signature')}</p>
                <div className="border-b border-gray-300 w-32 ml-auto mt-2 print:ml-0 print:w-24 print:mt-1"></div>
                <p className="text-xs text-gray-600 mt-1 print:text-xs">For {t('shop.name')}</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6 pt-4 border-t border-gray-200 print:mt-4 print:pt-2">
            <p className="text-lg font-medium text-orange-600 print:text-sm">{t('thanks.visit')}</p>
            <p className="text-xs text-gray-600 mt-1">Visit us again for all your jewelry needs</p>
          </div>
        </div>
      </div>
    </>
  );
};