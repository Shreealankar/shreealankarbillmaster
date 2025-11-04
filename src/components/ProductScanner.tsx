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
      setScanStatus('Starting camera...');
      setIsScanning(true);
      
      // Stop any existing scanner first
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
      
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Wait a bit for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create new reader instance
      codeReaderRef.current = new BrowserMultiFormatReader();
      
      // Get available video input devices
      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera found on this device');
      }

      console.log('Available cameras:', videoInputDevices);
      
      // Select back camera (environment facing)
      let selectedDeviceId = videoInputDevices[0].deviceId;
      
      // Try to find back/rear camera
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      
      if (backCamera) {
        selectedDeviceId = backCamera.deviceId;
        console.log('Using back camera:', backCamera.label);
      } else if (videoInputDevices.length > 1) {
        selectedDeviceId = videoInputDevices[videoInputDevices.length - 1].deviceId;
        console.log('Using camera:', videoInputDevices[videoInputDevices.length - 1].label);
      }

      setScanStatus('Position barcode in frame');

      // Start decoding with proper error handling
      codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            const barcodeText = result.getText();
            console.log('✓ Barcode detected:', barcodeText);
            setScanStatus(`✓ Scanned: ${barcodeText}`);
            playSuccessSound();
            onScan(barcodeText);
            // Small delay before stopping to show success message
            setTimeout(() => stopScanning(), 500);
          }
          // Don't log NotFoundException as it's normal when no barcode is in view
          if (error && !(error instanceof NotFoundException)) {
            console.warn('Scan error:', error.message);
          }
        }
      ).catch((error) => {
        console.error('Failed to start scanner:', error);
        setScanStatus('Failed to start camera');
        setIsScanning(false);
      });
      
    } catch (error) {
      console.error('Scanner initialization error:', error);
      setScanStatus('Error: ' + (error as Error).message);
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
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video 
                ref={videoRef}
                className="w-full max-w-md mx-auto aspect-video object-cover"
                autoPlay
                playsInline
                muted
                style={{ minHeight: '300px' }}
              />
              {/* Scanning frame overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-64 h-40 border-2 border-primary rounded-lg">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                  {/* Scanning line animation */}
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary animate-pulse"></div>
                </div>
              </div>
            </div>
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