import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { QrCode, Hash, Camera, StopCircle } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface ProductScannerProps {
  onScan: (result: string) => void;
}

export const ProductScanner: React.FC<ProductScannerProps> = ({ onScan }) => {
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanStatus, setScanStatus] = useState('');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerIdRef = useRef('barcode-scanner-' + Date.now());

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
    checkCameraPermission();
    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
    } catch (error) {
      console.error('Camera permission error:', error);
      setHasPermission(false);
    }
  };

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const startScanning = async () => {
    try {
      setScanStatus('Initializing camera...');
      setIsScanning(true);
      
      // Stop any existing scanner first
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {
          console.log('No active scanner to stop');
        }
      }

      // Wait a bit for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create new scanner instance
      const html5QrCode = new Html5Qrcode(scannerIdRef.current);
      html5QrCodeRef.current = html5QrCode;

      // Configure supported barcode formats
      const config = {
        fps: 10,
        qrbox: { width: 300, height: 200 },
        aspectRatio: 1.7777778,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
      };

      setScanStatus('Position barcode in the scanning area');

      // Start scanning with back camera
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          console.log('✓ Barcode detected:', decodedText);
          setScanStatus(`✓ Scanned: ${decodedText}`);
          playSuccessSound();
          onScan(decodedText);
          // Small delay before stopping to show success message
          setTimeout(() => stopScanning(), 500);
        },
        (errorMessage) => {
          // Ignore common scanning errors
        }
      );
      
    } catch (error) {
      console.error('Scanner initialization error:', error);
      setScanStatus('Error: ' + (error as Error).message);
      setIsScanning(false);
      setHasPermission(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (e) {
        console.log('Scanner cleanup error:', e);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
    setScanStatus('');
  };

  return (
    <div className="space-y-6">
      {/* Camera Scanner */}
      <div className="text-center p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
        {isScanning ? (
          <div className="space-y-4">
            <div 
              id={scannerIdRef.current}
              className="w-full max-w-md mx-auto rounded-lg overflow-hidden"
            />
            {scanStatus && (
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="text-sm font-medium text-primary text-center">{scanStatus}</p>
              </div>
            )}
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
              Point camera at barcode to scan automatically
            </p>
            {hasPermission === false ? (
              <div className="space-y-2">
                <p className="text-sm text-destructive">Camera permission denied or not available</p>
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