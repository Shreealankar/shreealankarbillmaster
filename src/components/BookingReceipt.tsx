import React from 'react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Printer, Share, Download } from 'lucide-react';

interface BookingReceiptProps {
  bookingData: {
    booking_code: string;
    full_name: string;
    primary_mobile: string;
    secondary_mobile: string | null;
    email: string;
    full_address: string;
    booking_type: string;
    gold_weight: number;
    status: string;
    created_at: string;
  };
}

export const BookingReceipt: React.FC<BookingReceiptProps> = ({ bookingData }) => {
  const { t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const receiptContent = `
🏪 ${t('shop.name')}
📄 Booking Receipt: ${bookingData.booking_code}
👤 Name: ${bookingData.full_name}
📞 Phone: ${bookingData.primary_mobile}
📧 Email: ${bookingData.email}
📍 Address: ${bookingData.full_address}
⚖️ Gold Weight: ${bookingData.gold_weight}g
📦 Type: ${bookingData.booking_type}
✅ Status: ${bookingData.status.toUpperCase()}
📅 Date: ${format(new Date(bookingData.created_at), 'dd/MM/yyyy')}

🙏 ${t('thanks.visit')}
    `.trim();
    
    const whatsappUrl = `https://wa.me/${bookingData.primary_mobile}?text=${encodeURIComponent(receiptContent)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSavePDF = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'delivered':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  return (
    <>
      {/* Print Controls - Hidden in print */}
      <div className="max-w-4xl mx-auto mb-4 print:hidden">
        <div className="flex gap-2 justify-center">
          <Button onClick={handlePrint} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
            <Printer className="h-4 w-4" />
            Print Receipt
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

      {/* Print styles */}
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
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-6 print:p-4 print:mb-4 print:bg-white print:border-gray-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/a353b3db-e82b-4bbf-9ce4-2324f1d83ca1.png" 
                alt="Shree Alankar Logo" 
                className="w-16 h-16 print:w-12 print:h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent print:text-black print:text-xl" 
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

        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 mb-6 rounded-lg print:bg-gray-800 print:p-2 print:mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold print:text-base">BOOKING RECEIPT</h2>
              <p className="text-sm print:text-xs">Receipt No: <span className="font-mono font-semibold">{bookingData.booking_code}</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm print:text-xs">Date: {format(new Date(bookingData.created_at), 'dd/MM/yyyy')}</p>
              <p className="text-xs">Time: {format(new Date(bookingData.created_at), 'hh:mm a')}</p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6 print:mb-4 flex justify-center">
          <div className={`inline-flex items-center px-6 py-3 rounded-full border-2 ${getStatusColor(bookingData.status)} print:px-4 print:py-2`}>
            <span className="text-lg font-bold uppercase print:text-sm">Status: {bookingData.status}</span>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6 print:shadow-none print:p-4 print:mb-4">
          <h3 className="text-lg font-semibold text-purple-600 mb-4 print:text-base print:mb-2 border-b-2 border-purple-200 pb-2 print:pb-1">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
            <div className="space-y-3 print:space-y-1">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600 print:text-xs">Full Name</span>
                <span className="text-base text-gray-900 font-medium print:text-sm">{bookingData.full_name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600 print:text-xs">Primary Mobile</span>
                <span className="text-base text-gray-900 font-medium print:text-sm">{bookingData.primary_mobile}</span>
              </div>
              {bookingData.secondary_mobile && (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-600 print:text-xs">Secondary Mobile</span>
                  <span className="text-base text-gray-900 font-medium print:text-sm">{bookingData.secondary_mobile}</span>
                </div>
              )}
            </div>
            <div className="space-y-3 print:space-y-1">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600 print:text-xs">Email Address</span>
                <span className="text-base text-gray-900 font-medium print:text-sm">{bookingData.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600 print:text-xs">Full Address</span>
                <span className="text-base text-gray-900 font-medium print:text-sm">{bookingData.full_address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-6 print:bg-white print:border-gray-300 print:p-4 print:mb-4">
          <h3 className="text-lg font-semibold text-purple-600 mb-4 print:text-base print:mb-2 border-b-2 border-purple-200 pb-2 print:pb-1">Booking Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-3">
            <div className="bg-white rounded-lg p-4 shadow-sm print:shadow-none print:p-2">
              <p className="text-sm text-gray-600 mb-1 print:text-xs">Booking Type</p>
              <p className="text-xl font-bold text-purple-600 print:text-base">{bookingData.booking_type}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm print:shadow-none print:p-2">
              <p className="text-sm text-gray-600 mb-1 print:text-xs">Gold Weight</p>
              <p className="text-xl font-bold text-purple-600 print:text-base">{bookingData.gold_weight} grams</p>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 print:bg-white print:border-gray-400 print:p-2 print:mb-4">
          <h4 className="text-base font-semibold text-yellow-800 mb-2 print:text-sm print:mb-1">Important Information</h4>
          <ul className="space-y-1 text-sm text-yellow-700 print:text-xs print:space-y-0.5">
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">•</span>
              <span>This is a booking confirmation receipt, not a final bill</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">•</span>
              <span>Please keep this receipt for your records</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">•</span>
              <span>Contact us for any queries regarding your booking</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">•</span>
              <span>Final pricing will be determined at the time of delivery</span>
            </li>
          </ul>
        </div>

        {/* Footer with QR */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 print:bg-white print:border-gray-300 print:p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:gap-4">
            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold text-purple-600 mb-3 print:text-base print:mb-2">Terms & Conditions</h4>
              <ul className="space-y-1 text-sm text-gray-700 print:text-xs print:space-y-0.5">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Booking is subject to availability and confirmation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Gold rates may vary at the time of delivery</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>For complete terms, scan QR code or visit our website</span>
                </li>
              </ul>
            </div>
            
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
          <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full print:bg-gray-800 print:px-4 print:py-2">
            <p className="text-lg font-semibold print:text-sm">{t('thanks.visit')}</p>
          </div>
          <p className="text-sm text-gray-600 mt-2 print:text-xs print:mt-1">We Look Forward to Serving You!</p>
        </div>
      </div>
    </>
  );
};
