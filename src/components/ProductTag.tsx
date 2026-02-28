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
    huid_number?: string;
  };
  products?: Array<{
    title?: string;
    name_english?: string;
    name_marathi?: string;
    weight_grams: number;
    purity: string;
    barcode?: string;
    unique_number?: string;
    huid_number?: string;
  }>;
}

export const ProductTag: React.FC<ProductTagProps> = ({ product, products }) => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = (isBulk = false) => {
    const printContent = printRef.current;
    if (!printContent) return;
    
    const itemsToPrint = isBulk && products ? products : [product];

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Please allow pop-ups to print",
        variant: "destructive",
      });
      return;
    }

    // Generate HTML for all tags
    const tagsHTML = itemsToPrint.map((item, index) => {
      const itemRef = document.getElementById(`barcode-${index}`);
      const barcodeElement = itemRef?.querySelector('svg');
      const barcodeHTML = barcodeElement ? barcodeElement.outerHTML : '';
      
      return `
        <div class="tag-container">
          <div>
            <div class="product-name">
              ${item.name_english || item.title}
            </div>
            ${item.name_marathi ? `<div class="product-name-mr">${item.name_marathi}</div>` : ''}
            <div class="product-info">
              <div class="info-row">
                <span class="label">Weight:</span>
                <span>${item.weight_grams}g</span>
              </div>
              <div class="info-row">
                <span class="label">Purity:</span>
                <span>${item.purity}</span>
              </div>
              ${item.huid_number ? `<div class="info-row"><span class="label">HUID:</span><span>${item.huid_number}</span></div>` : ''}
            </div>
          </div>
          
          <div class="barcode-section">
            ${barcodeHTML}
            ${item.unique_number ? `<div class="code">${item.unique_number}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Product Tag - ${product.name_english || product.title}</title>
          <style>
            @page {
              size: A4;
              margin: 0.5cm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 8px;
            }
            .tags-grid {
              display: grid;
              grid-template-columns: repeat(3, 5cm);
              grid-auto-rows: 3cm;
              gap: 0.5cm;
              width: 100%;
            }
            .tag-container {
              width: 5cm;
              height: 3cm;
              border: 1px solid #000;
              padding: 4px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            .product-name {
              font-size: 9px;
              font-weight: bold;
              margin-bottom: 2px;
              text-align: center;
            }
            .product-name-mr {
              font-size: 8px;
              text-align: center;
              margin-bottom: 3px;
            }
            .product-info {
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              font-size: 7px;
            }
            .label {
              font-weight: bold;
            }
            .barcode-section {
              text-align: center;
              margin-top: 2px;
              padding-top: 2px;
              border-top: 1px solid #ccc;
            }
            .barcode-svg svg {
              max-width: 100%;
              height: auto;
            }
            .code {
              font-size: 6px;
              color: #666;
              margin-top: 1px;
            }
          </style>
        </head>
        <body>
          <div class="tags-grid">
            ${tagsHTML}
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
      <div className="flex gap-2 mb-4">
        <Button onClick={() => handlePrint(false)} className="flex-1">
          <Printer className="h-4 w-4 mr-2" />
          Print Tag
        </Button>
        {products && products.length > 1 && (
          <Button onClick={() => handlePrint(true)} variant="secondary" className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Bulk Print ({products.length})
          </Button>
        )}
      </div>
      
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
          {product.huid_number && (
            <div className="col-span-2">
              <span className="font-medium">HUID:</span> {product.huid_number}
            </div>
          )}
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
      
      {/* Hidden print content with barcodes */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          {(products || [product]).map((item, index) => (
            <div key={index} id={`barcode-${index}`}>
              {item.barcode && (
                <Barcode 
                  value={item.barcode} 
                  height={30}
                  width={1}
                  fontSize={8}
                  margin={0}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};