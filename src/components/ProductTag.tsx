import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ProductTagProps {
  product: {
    title?: string;
    name_english?: string;
    name_marathi?: string;
    weight_grams: number;
    purity: string;
    barcode?: string;
    unique_number?: string;
  };
}

export const ProductTag: React.FC<ProductTagProps> = ({ product }) => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Please allow pop-ups to print",
        variant: "destructive",
      });
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Product Tag - ${product.name_english || product.title}</title>
          <style>
            @page {
              size: 2.5in 1.5in;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 8px;
              font-family: Arial, sans-serif;
              font-size: 10px;
            }
            .tag-container {
              width: 100%;
              height: 100%;
              border: 2px solid #000;
              padding: 8px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .product-name {
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 4px;
              text-align: center;
            }
            .product-name-mr {
              font-size: 11px;
              text-align: center;
              margin-bottom: 6px;
            }
            .product-info {
              display: flex;
              flex-direction: column;
              gap: 3px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
            }
            .label {
              font-weight: bold;
            }
            .barcode-section {
              text-align: center;
              margin-top: 4px;
              padding-top: 4px;
              border-top: 1px solid #ccc;
            }
            .barcode {
              font-family: 'Courier New', monospace;
              font-size: 14px;
              font-weight: bold;
              letter-spacing: 1px;
            }
            .code {
              font-size: 9px;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div>
      <Button onClick={handlePrint} className="w-full">
        <Printer className="h-4 w-4 mr-2" />
        Print Tag
      </Button>
      
      {/* Hidden print content */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <div className="tag-container">
            <div>
              <div className="product-name">
                {product.name_english || product.title}
              </div>
              {product.name_marathi && (
                <div className="product-name-mr">{product.name_marathi}</div>
              )}
              <div className="product-info">
                <div className="info-row">
                  <span className="label">Weight:</span>
                  <span>{product.weight_grams}g</span>
                </div>
                <div className="info-row">
                  <span className="label">Purity:</span>
                  <span>{product.purity}</span>
                </div>
              </div>
            </div>
            
            <div className="barcode-section">
              {product.barcode && (
                <div className="barcode">{product.barcode}</div>
              )}
              {product.unique_number && (
                <div className="code">{product.unique_number}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};