import React, { useRef } from 'react';
import Barcode from 'react-barcode';
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

    // Get the SVG barcode element and convert to string
    const barcodeElement = printContent.querySelector('svg');
    const barcodeHTML = barcodeElement ? barcodeElement.outerHTML : '';

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
            .barcode-svg {
              margin: 4px auto;
            }
            .code {
              font-size: 9px;
              color: #666;
              margin-top: 2px;
            }
          </style>
        </head>
        <body>
          <div class="tag-container">
            <div>
              <div class="product-name">
                ${product.name_english || product.title}
              </div>
              ${product.name_marathi ? `<div class="product-name-mr">${product.name_marathi}</div>` : ''}
              <div class="product-info">
                <div class="info-row">
                  <span class="label">Weight:</span>
                  <span>${product.weight_grams}g</span>
                </div>
                <div class="info-row">
                  <span class="label">Purity:</span>
                  <span>${product.purity}</span>
                </div>
              </div>
            </div>
            
            <div class="barcode-section">
              ${barcodeHTML}
              ${product.unique_number ? `<div class="code">${product.unique_number}</div>` : ''}
            </div>
          </div>
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
      <Button onClick={handlePrint} className="w-full mb-4">
        <Printer className="h-4 w-4 mr-2" />
        Print Tag
      </Button>
      
      {/* Visual preview */}
      <div className="border-2 border-border rounded-lg p-4 bg-background text-center">
        <h3 className="font-bold text-sm mb-1">{product.name_english || product.title}</h3>
        {product.name_marathi && (
          <p className="text-sm text-muted-foreground mb-2">{product.name_marathi}</p>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-xs my-3">
          <div>
            <span className="font-medium">Weight:</span> {product.weight_grams}g
          </div>
          <div>
            <span className="font-medium">Purity:</span> {product.purity}
          </div>
        </div>

        <div className="border-t pt-3 mt-3">
          {product.barcode && (
            <div className="flex justify-center">
              <Barcode 
                value={product.barcode} 
                height={50}
                width={1.5}
                fontSize={12}
                margin={5}
              />
            </div>
          )}
          {product.unique_number && (
            <p className="text-xs text-muted-foreground mt-2">{product.unique_number}</p>
          )}
        </div>
      </div>
      
      {/* Hidden print content with barcode */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          {product.barcode && (
            <Barcode 
              value={product.barcode} 
              height={40}
              width={1.5}
              fontSize={10}
              margin={0}
            />
          )}
        </div>
      </div>
    </div>
  );
};