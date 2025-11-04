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
  const [scanStatus, setScanStatus] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
      
      // Stop any existing scanner
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Create new reader
      codeReaderRef.current = new BrowserMultiFormatReader();
      
      // Get available video devices
      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera found');
      }

      setScanStatus('Camera ready - Position barcode in view');
      
      // Select back camera (environment facing)
      let selectedDeviceId = videoInputDevices[0].deviceId;
      
      // Try to find back camera
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      
      if (backCamera) {
        selectedDeviceId = backCamera.deviceId;
      } else if (videoInputDevices.length > 1) {
        selectedDeviceId = videoInputDevices[videoInputDevices.length - 1].deviceId;
      }

      setIsScanning(true);

      // Start decoding from video device
      await codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            const barcodeText = result.getText();
            console.log('Barcode detected:', barcodeText);
            setScanStatus(`Scanned: ${barcodeText}`);
            playSuccessSound();
            onScan(barcodeText);
            stopScanning();
          }
          if (error && !(error instanceof NotFoundException)) {
            console.log('Scan error:', error);
          }
        }
      );
      
    } catch (error) {
      console.error('Scanner error:', error);
      setScanStatus('Camera error: ' + (error as Error).message);
      setIsScanning(false);
      setHasPermission(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
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
            <div className="relative">
              <video 
                ref={videoRef}
                className="w-full max-w-sm mx-auto rounded-lg bg-black"
                autoPlay
                playsInline
                muted
              />
              <div className="absolute inset-0 border-4 border-primary/30 rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-32 border-2 border-primary"></div>
              </div>
            </div>
            {scanStatus && (
              <p className="text-sm font-medium text-primary">{scanStatus}</p>
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