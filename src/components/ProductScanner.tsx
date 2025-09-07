import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { QrCode, Hash } from 'lucide-react';

interface ProductScannerProps {
  onScan: (result: string) => void;
}

export const ProductScanner: React.FC<ProductScannerProps> = ({ onScan }) => {
  const [manualInput, setManualInput] = useState('');

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Camera Scanner (Future Implementation) */}
      <div className="text-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
        <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-semibold mb-2">Camera Scanner</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Camera scanning feature will be implemented in future updates
        </p>
        <Button variant="outline" disabled>
          Enable Camera Scanner
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      {/* Manual Input */}
      <div className="space-y-4">
        <div className="text-center">
          <Hash className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Manual Entry</h3>
          <p className="text-sm text-muted-foreground">
            Enter barcode or unique number manually
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="manual-input">Barcode or Unique Number</Label>
          <Input
            id="manual-input"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter barcode (e.g., AL12345678) or unique number (e.g., AL-PROD-0001)"
            className="font-mono"
          />
        </div>

        <Button 
          onClick={handleManualSubmit}
          disabled={!manualInput.trim()}
          className="w-full"
        >
          Search Product
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Barcode format:</strong> AL followed by 8 digits (e.g., AL12345678)</p>
        <p><strong>Unique number format:</strong> AL-PROD-XXXX (e.g., AL-PROD-0001)</p>
      </div>
    </div>
  );
};