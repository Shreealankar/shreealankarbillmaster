import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { QrCode, Hash, Camera, StopCircle } from 'lucide-react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface ProductScannerProps {
  onScan: (result: string) => void;
}

export const ProductScanner: React.FC<ProductScannerProps> = ({ onScan }) => {
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

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

  useEffect(() => {
    // Check camera permission on mount
    checkCameraPermission();
    return () => {
      // Cleanup on unmount
      stopScanning();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
    } catch (error) {
      setHasPermission(false);
    }
  };

  const startScanning = async () => {
    try {
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      setIsScanning(true);
      
      // Get video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Use the first available camera (usually back camera on mobile)
      const selectedDeviceId = videoDevices[0].deviceId;

      codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            onScan(result.getText());
            stopScanning();
          }
          if (error && !(error instanceof NotFoundException)) {
            console.warn('Barcode scan error:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error starting camera:', error);
      setIsScanning(false);
      setHasPermission(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
  };

  return (
    <div className="space-y-6">
      {/* Camera Scanner */}
      <div className="text-center p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
        {isScanning ? (
          <div className="space-y-4">
            <video 
              ref={videoRef}
              className="w-full max-w-sm mx-auto rounded-lg"
              autoPlay
              playsInline
              muted
            />
            <Button onClick={stopScanning} variant="destructive" className="w-full">
              <StopCircle className="h-4 w-4 mr-2" />
              Stop Scanner
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Camera Barcode Scanner</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use your camera to scan product barcodes
            </p>
            {hasPermission === false ? (
              <div className="space-y-2">
                <p className="text-sm text-red-600">Camera permission denied or not available</p>
                <Button onClick={checkCameraPermission} variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Request Camera Permission
                </Button>
              </div>
            ) : (
              <Button onClick={startScanning} className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Start Camera Scanner
              </Button>
            )}
          </div>
        )}
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