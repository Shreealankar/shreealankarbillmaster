import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Printer, Share2, Download } from 'lucide-react';

interface PurchaseVoucherItem {
  item_description: string;
  net_weight: number;
  purity: string;
  rate_per_gram: number;
  total_amount: number;
  metal_type: string;
}

interface PurchaseVoucherData {
  voucher_number: string;
  voucher_date: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  pan_aadhaar?: string;
  total_weight: number;
  total_amount: number;
  payment_method: string;
  utr_number?: string;
  notes?: string;
}

interface Props {
  voucherData: PurchaseVoucherData;
  items: PurchaseVoucherItem[];
}

const numberToMarathiWords = (num: number): string => {
  if (num === 0) return 'शून्य';
  const ones = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा',
    'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस'];
  const tens = ['', '', 'वीस', 'तीस', 'चाळीस', 'पन्नास', 'साठ', 'सत्तर', 'ऐंशी', 'नव्वद'];

  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) {
      const t = Math.floor(n / 10);
      const o = n % 10;
      return o ? ones[o] + 'शे ' + tens[t] : tens[t]; // simplified
    }
    if (n < 1000) {
      const h = Math.floor(n / 100);
      const rest = n % 100;
      return ones[h] + 'शे ' + (rest ? convert(rest) : '');
    }
    if (n < 100000) {
      const th = Math.floor(n / 1000);
      const rest = n % 1000;
      return convert(th) + ' हजार ' + (rest ? convert(rest) : '');
    }
    if (n < 10000000) {
      const lakh = Math.floor(n / 100000);
      const rest = n % 100000;
      return convert(lakh) + ' लाख ' + (rest ? convert(rest) : '');
    }
    const crore = Math.floor(n / 10000000);
    const rest = n % 10000000;
    return convert(crore) + ' कोटी ' + (rest ? convert(rest) : '');
  };

  return 'रुपये ' + convert(Math.floor(num)) + ' मात्र';
};

export const PurchaseVoucherPrint: React.FC<Props> = ({ voucherData, items }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>खरेदी पावती - ${voucherData.voucher_number}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 13px; color: #000; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: bold; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .header { text-align: center; margin-bottom: 15px; }
        .header h1 { font-size: 22px; margin: 0; color: #8B4513; }
        .header p { margin: 2px 0; font-size: 12px; }
        .title-box { border: 2px solid #333; padding: 8px; text-align: center; font-size: 16px; font-weight: bold; margin: 10px 0; }
        .info-row { display: flex; justify-content: space-between; margin: 4px 0; }
        .declaration { border: 1px solid #999; padding: 10px; margin: 15px 0; font-size: 11px; line-height: 1.6; }
        .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
        .sig-box { text-align: center; width: 45%; }
        .sig-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; }
      </style></head><body>
      ${content.innerHTML}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const marathiNumerals = (n: number) => n.toString();

  return (
    <div>
      <div className="flex gap-2 p-4 justify-end print:hidden">
        <Button onClick={handlePrint} className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
          <Printer className="h-4 w-4 mr-2" />
          प्रिंट करा
        </Button>
      </div>

      <div ref={printRef} className="p-8 bg-white text-black max-w-[210mm] mx-auto" style={{ fontFamily: "'Noto Sans Devanagari', Arial, sans-serif" }}>
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold" style={{ color: '#8B4513' }}>श्री अलंकार</h1>
          <p className="text-sm">पत्ता: बँक ऑफ महाराष्ट्र जवळ, लोहोणेर</p>
          <p className="text-sm">मोबाईल क्र.: +91 9921612155</p>
        </div>

        {/* Title */}
        <div className="border-2 border-black p-2 text-center font-bold text-lg mb-4">
          || जुने सोने/चांदी खरेदी पावती (Purchase Voucher) ||
        </div>

        {/* Voucher Info */}
        <div className="flex justify-between mb-3 text-sm">
          <span><strong>पावती क्र.:</strong> {voucherData.voucher_number}</span>
          <span><strong>दिनांक:</strong> {formatDate(voucherData.voucher_date)}</span>
        </div>

        {/* Customer Info */}
        <div className="space-y-1 text-sm mb-4">
          <p><strong>ग्राहकाचे नाव:</strong> {voucherData.customer_name}</p>
          <p><strong>ग्राहकाचा पत्ता:</strong> {voucherData.customer_address || '—'}</p>
          <div className="flex justify-between">
            <span><strong>मोबाईल क्र.:</strong> {voucherData.customer_phone}</span>
            <span><strong>पॅन / आधार क्र.:</strong> {voucherData.pan_aadhaar || '—'} <span className="text-xs">(मोठ्या रकमेसाठी आवश्यक)</span></span>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-center w-12">अ. क्र.</th>
              <th className="border border-black p-2">दागिन्यांचा तपशील</th>
              <th className="border border-black p-2 text-right">निव्वळ वजन (ग्रॅम)</th>
              <th className="border border-black p-2 text-center">शुद्धता</th>
              <th className="border border-black p-2 text-right">दर प्रति ग्रॅम (₹)</th>
              <th className="border border-black p-2 text-right">एकूण रक्कम (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="border border-black p-2 text-center">{marathiNumerals(idx + 1)}</td>
                <td className="border border-black p-2">{item.item_description}</td>
                <td className="border border-black p-2 text-right">{item.net_weight.toFixed(3)}</td>
                <td className="border border-black p-2 text-center">{item.purity}</td>
                <td className="border border-black p-2 text-right">₹{item.rate_per_gram.toLocaleString('en-IN')}</td>
                <td className="border border-black p-2 text-right">₹{item.total_amount.toLocaleString('en-IN')}</td>
              </tr>
            ))}
            {/* Empty rows if less than 3 */}
            {Array.from({ length: Math.max(0, 3 - items.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-black p-2 text-center">{marathiNumerals(items.length + i + 1)}</td>
                <td className="border border-black p-2">&nbsp;</td>
                <td className="border border-black p-2">&nbsp;</td>
                <td className="border border-black p-2">&nbsp;</td>
                <td className="border border-black p-2">&nbsp;</td>
                <td className="border border-black p-2">&nbsp;</td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-50">
              <td colSpan={2} className="border border-black p-2 text-right">एकूण</td>
              <td className="border border-black p-2 text-right">{voucherData.total_weight.toFixed(3)}</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2 text-right">₹{voucherData.total_amount.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        {/* Amount in words */}
        <p className="text-sm mt-3">
          <strong>एकूण रक्कम (अक्षरी):</strong> {numberToMarathiWords(voucherData.total_amount)}
        </p>

        {/* Payment Method */}
        <div className="text-sm mt-3 space-y-1">
          <p>
            <strong>रक्कम देण्याची पद्धत:</strong>{' '}
            {voucherData.payment_method === 'cash' ? 'रोख (Cash)' : 'बँक ट्रान्सफर (UPI/NEFT)'}
          </p>
          {voucherData.payment_method === 'bank' && voucherData.utr_number && (
            <p><strong>UTR क्र.:</strong> {voucherData.utr_number}</p>
          )}
        </div>

        {/* Declaration */}
        <div className="border border-gray-400 p-3 mt-4 text-xs leading-relaxed">
          <p className="font-bold mb-1">ग्राहकाचे प्रतिज्ञापत्र (Declaration):</p>
          <p className="italic">
            "मी याद्वारे घोषित करतो/करते की, वर नमूद केलेले दागिने माझ्या स्वतःच्या मालकीचे असून, 
            ते कोणत्याही बेकायदेशीर मार्गाने मिळवलेले नाहीत. हे दागिने मी माझ्या स्वेच्छेने आणि 
            सध्याच्या बाजारभावाने 'श्री अलंकार' यांना विकत आहे. या व्यवहाराबाबत भविष्यात कोणताही 
            वाद निर्माण झाल्यास त्याची संपूर्ण जबाबदारी माझी राहील."
          </p>
        </div>

        {/* Signatures */}
        <div className="flex justify-between mt-12">
          <div className="text-center w-2/5">
            <div className="border-t border-black mt-12 pt-2 text-sm">
              ग्राहकाची सही
            </div>
            <p className="text-xs text-gray-500 mt-1">({voucherData.customer_name})</p>
          </div>
          <div className="text-center w-2/5">
            <div className="border-t border-black mt-12 pt-2 text-sm">
              अधिकृत सही (श्री अलंकार)
            </div>
            <p className="text-xs text-gray-500 mt-1">&nbsp;</p>
          </div>
        </div>
      </div>
    </div>
  );
};
