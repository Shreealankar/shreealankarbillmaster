import React from 'react';
import { format } from 'date-fns';

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
  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header with Logo */}
      <div className="text-center mb-8 border-b-2 border-amber-500 pb-6">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/lovable-uploads/a353b3db-e82b-4bbf-9ce4-2324f1d83ca1.png" 
            alt="Shree Alankar Logo" 
            className="w-20 h-20 object-contain mr-6"
          />
          <div>
            <h1 className="text-3xl font-bold text-amber-600 mb-2">SHREE ALANKAR</h1>
            <p className="text-lg text-gray-700">JEWELLERS SINCE 1980</p>
            <p className="text-sm text-gray-600">Gold • Silver • Platinum • Diamond Jewelry</p>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mt-4">
          <p>📍 Address: [Your Shop Address Here]</p>
          <p>📞 Phone: [Your Phone Number] | 📧 Email: [Your Email]</p>
          <p>🌐 Website: www.shreealankar.com</p>
        </div>
      </div>

      {/* Bill Header */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h2 className="text-xl font-bold text-amber-600 mb-3">BILL / INVOICE</h2>
          <p><strong>Bill No:</strong> {billData.bill_number}</p>
          <p><strong>Date:</strong> {format(new Date(billData.created_at), 'dd/MM/yyyy')}</p>
          <p><strong>Time:</strong> {format(new Date(billData.created_at), 'HH:mm:ss')}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">CUSTOMER DETAILS</h3>
          <p><strong>Name:</strong> {billData.customer_name}</p>
          <p><strong>Phone:</strong> {billData.customer_phone}</p>
          {billData.customer_address && (
            <p><strong>Address:</strong> {billData.customer_address}</p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-amber-100">
              <th className="border border-gray-300 p-2 text-left">Sr.</th>
              <th className="border border-gray-300 p-2 text-left">Item Description</th>
              <th className="border border-gray-300 p-2 text-center">Metal/Purity</th>
              <th className="border border-gray-300 p-2 text-right">Weight (g)</th>
              <th className="border border-gray-300 p-2 text-right">Rate/g (₹)</th>
              <th className="border border-gray-300 p-2 text-right">Making (₹)</th>
              <th className="border border-gray-300 p-2 text-right">Stone (₹)</th>
              <th className="border border-gray-300 p-2 text-right">Other (₹)</th>
              <th className="border border-gray-300 p-2 text-right">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {billItems.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 p-2">{item.item_name}</td>
                <td className="border border-gray-300 p-2 text-center">
                  {item.metal_type} {item.purity}
                </td>
                <td className="border border-gray-300 p-2 text-right">{item.weight_grams}</td>
                <td className="border border-gray-300 p-2 text-right">{item.rate_per_gram.toLocaleString('en-IN')}</td>
                <td className="border border-gray-300 p-2 text-right">{item.making_charges.toLocaleString('en-IN')}</td>
                <td className="border border-gray-300 p-2 text-right">{item.stone_charges.toLocaleString('en-IN')}</td>
                <td className="border border-gray-300 p-2 text-right">{item.other_charges.toLocaleString('en-IN')}</td>
                <td className="border border-gray-300 p-2 text-right font-semibold">
                  {item.total_amount.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <p><strong>Total Weight:</strong> {billData.total_weight} grams</p>
          <p><strong>Payment Method:</strong> {billData.payment_method.toUpperCase()}</p>
          {billData.notes && (
            <div className="mt-3">
              <p><strong>Notes:</strong></p>
              <p className="text-sm text-gray-600">{billData.notes}</p>
            </div>
          )}
        </div>
        
        <div className="border border-gray-300 p-4 bg-gray-50">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{billData.total_amount.toLocaleString('en-IN')}</span>
            </div>
            {billData.discount_percentage > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({billData.discount_percentage}%):</span>
                <span>-₹{billData.discount_amount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax ({billData.tax_percentage}%):</span>
              <span>₹{billData.tax_amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t border-gray-400 pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>FINAL AMOUNT:</span>
                <span>₹{billData.final_amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Paid Amount:</span>
              <span>₹{billData.paid_amount.toLocaleString('en-IN')}</span>
            </div>
            {billData.balance_amount > 0 && (
              <div className="flex justify-between text-red-600 font-semibold">
                <span>Balance Due:</span>
                <span>₹{billData.balance_amount.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-amber-500 pt-4 text-center text-sm text-gray-600">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="font-semibold">Terms & Conditions:</p>
            <p>• All sales are final</p>
            <p>• Gold rates as per market</p>
          </div>
          <div>
            <p className="font-semibold">Exchange Policy:</p>
            <p>• 7 days exchange policy</p>
            <p>• Original bill required</p>
          </div>
          <div>
            <p className="font-semibold">Thank You!</p>
            <p>Visit us again for quality jewelry</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <div>
            <p className="font-semibold">Customer Signature</p>
            <div className="border-b border-gray-400 w-32 mt-4"></div>
          </div>
          <div className="text-center">
            <p className="text-amber-600 font-bold">SHREE ALANKAR JEWELLERS</p>
            <p>Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};