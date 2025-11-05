import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Camera, Keyboard, StopCircle } from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useToast } from "@/hooks/use-toast";

interface Rate {
  id: string;
  metal_type: string;
  rate_per_gram: number;
  updated_at: string;
}

interface Product {
  id: string;
  name_english: string;
  name_marathi: string;
  purity: string;
  weight_grams: number;
  type: string;
  making_charges_type: string;
  making_charges_percentage: number;
  making_charges_manual: number;
  stone_charges: number;
  other_charges: number;
  barcode: string;
  unique_number: string;
}

const PriceCalculator = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [rates, setRates] = useState<Rate[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanStatus, setScanStatus] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerIdRef = useRef(`scanner-${Date.now()}`);

  useEffect(() => {
    fetchRates();
    checkCameraPermission();
    
    const subscription = supabase
      .channel('rates_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rates' }, 
        fetchRates
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
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

  const fetchRates = async () => {
    const { data } = await supabase.from('rates').select('*');
    setRates(data || []);
  };

  const goldRate = rates.find(r => r.metal_type === 'gold');
  const silverRate = rates.find(r => r.metal_type === 'silver');

  const handleManualSubmit = async () => {
    if (!manualInput.trim()) return;
    await fetchProductDetails(manualInput.trim());
    setManualInput('');
  };

  const fetchProductDetails = async (identifier: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`barcode.eq.${identifier},unique_number.eq.${identifier}`)
      .single();

    if (error || !data) {
      toast({
        title: t('product.not.found'),
        description: identifier,
        variant: "destructive"
      });
      setScannedProduct(null);
      return;
    }

    setScannedProduct(data);
    toast({
      title: language === 'en' ? data.name_english : (data.name_marathi || data.name_english),
      description: t('product.quotation'),
    });
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
      setScanStatus(language === 'en' ? 'Initializing camera...' : 'कॅमेरा सुरू करत आहे...');
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

      setScanStatus(language === 'en' ? 'Position barcode in the scanning area' : 'बारकोड स्कॅनिंग एरियामध्ये ठेवा');

      // Start scanning with back camera
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          console.log('✓ Barcode detected:', decodedText);
          setScanStatus(`✓ ${language === 'en' ? 'Scanned' : 'स्कॅन केले'}: ${decodedText}`);
          playSuccessSound();
          await fetchProductDetails(decodedText);
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
      toast({
        title: language === 'en' ? "Scanner Error" : "स्कॅनर त्रुटी",
        description: (error as Error).message,
        variant: "destructive"
      });
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

  const calculateAmount = () => {
    if (!scannedProduct) return 0;

    const currentRate = scannedProduct.type === 'gold' 
      ? (goldRate?.rate_per_gram || 0) 
      : (silverRate?.rate_per_gram || 0);

    const baseAmount = scannedProduct.weight_grams * currentRate;
    
    let makingCharges = 0;
    if (scannedProduct.making_charges_type === 'percentage') {
      makingCharges = (baseAmount * scannedProduct.making_charges_percentage) / 100;
    } else {
      makingCharges = scannedProduct.making_charges_manual || 0;
    }

    const total = baseAmount + makingCharges + 
                  (scannedProduct.stone_charges || 0) + 
                  (scannedProduct.other_charges || 0);

    return total;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-center mb-8">{t('priceCalculator')}</h1>

        {/* Rates Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-4 border-yellow-400 shadow-lg bg-gradient-to-br from-yellow-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span className="text-4xl">💰</span>
                <span className="text-yellow-700">{t('gold.rate')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goldRate ? (
                <div className="bg-yellow-100 rounded-lg p-4 border-2 border-yellow-300">
                  <div className="text-4xl font-bold text-yellow-700">
                    ₹{(goldRate.rate_per_gram * 10).toFixed(2)}
                  </div>
                  <p className="text-sm font-semibold text-yellow-600">{t('per.10.grams')}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Rate not available</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-4 border-gray-400 shadow-lg bg-gradient-to-br from-gray-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span className="text-4xl">⚪</span>
                <span className="text-gray-700">{t('silver.rate')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {silverRate ? (
                <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-300">
                  <div className="text-4xl font-bold text-gray-700">
                    ₹{(silverRate.rate_per_gram * 10).toFixed(2)}
                  </div>
                  <p className="text-sm font-semibold text-gray-600">{t('per.10.grams')}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Rate not available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Scanner Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{t('scan.product')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Camera Scanner */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Camera className="h-5 w-5" />
                {t('scan')}
              </h3>
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
                    {t('stop.scanning')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    {language === 'en' ? 'Point camera at barcode to scan automatically' : 'बारकोड स्कॅन करण्यासाठी कॅमेरा लावा'}
                  </p>
                  {hasPermission === false ? (
                    <div className="space-y-2">
                      <p className="text-sm text-destructive text-center">
                        {language === 'en' ? 'Camera permission denied or not available' : 'कॅमेरा परवानगी नाकारली किंवा उपलब्ध नाही'}
                      </p>
                      <Button onClick={checkCameraPermission} variant="outline" className="w-full">
                        <Camera className="h-4 w-4 mr-2" />
                        {language === 'en' ? 'Request Camera Permission' : 'कॅमेरा परवानगी विचारा'}
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={startScanning} className="w-full">
                      <Camera className="h-4 w-4 mr-2" />
                      {t('start.scanning')}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Manual Entry */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                {t('manual.entry')}
              </h3>
              <p className="text-sm text-muted-foreground">{t('enter.manually')}</p>
              <div className="flex gap-2">
                <Input
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder={t('barcode.or.unique')}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                />
                <Button onClick={handleManualSubmit}>{t('scan')}</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Quotation */}
        {scannedProduct ? (
          <Card className="shadow-lg border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">{t('product.quotation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('name')}</p>
                  <p className="font-semibold text-lg">
                    {language === 'en' ? scannedProduct.name_english : (scannedProduct.name_marathi || scannedProduct.name_english)}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('metal.type')}</p>
                  <p className="font-semibold capitalize">{scannedProduct.type}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('purity')}</p>
                  <p className="font-semibold">{scannedProduct.purity}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('weight.grams')}</p>
                  <p className="font-semibold">{scannedProduct.weight_grams}g</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('rate.per.gram')}</p>
                  <p className="font-semibold">
                    ₹{scannedProduct.type === 'gold' 
                      ? goldRate?.rate_per_gram.toFixed(2) 
                      : silverRate?.rate_per_gram.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('making.charges')}</p>
                  <p className="font-semibold">
                    {scannedProduct.making_charges_type === 'percentage' 
                      ? `${scannedProduct.making_charges_percentage}%`
                      : `₹${scannedProduct.making_charges_manual}`}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('stone.charges')}</p>
                  <p className="font-semibold">₹{scannedProduct.stone_charges || 0}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('other.charges')}</p>
                  <p className="font-semibold">₹{scannedProduct.other_charges || 0}</p>
                </div>
              </div>

              <Separator />

              <div className="bg-primary/10 rounded-lg p-6 border-2 border-primary">
                <p className="text-sm text-muted-foreground mb-2">{t('final.amount')}</p>
                <p className="text-4xl font-bold text-primary">
                  ₹{calculateAmount().toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>{t('scan.to.view')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PriceCalculator;