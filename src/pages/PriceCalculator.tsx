import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Camera, Keyboard } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
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
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerIdRef = useRef(`scanner-${Date.now()}`);

  useEffect(() => {
    fetchRates();
    const subscription = supabase
      .channel('rates_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rates' }, 
        fetchRates
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      if (html5QrCodeRef.current) {
        stopScanning();
      }
    };
  }, []);

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

  const startScanning = async () => {
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerIdRef.current);
      }

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          await fetchProductDetails(decodedText);
          stopScanning();
        },
        undefined
      );
      
      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      toast({
        title: "Scanner Error",
        description: "Could not start camera scanner",
        variant: "destructive"
      });
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
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
                  <div id={scannerIdRef.current} className="border-2 border-primary rounded-lg overflow-hidden" />
                  <Button onClick={stopScanning} variant="destructive" className="w-full">
                    {t('stop.scanning')}
                  </Button>
                </div>
              ) : (
                <Button onClick={startScanning} className="w-full">
                  {t('start.scanning')}
                </Button>
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