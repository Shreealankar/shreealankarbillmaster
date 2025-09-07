import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductFormData {
  title: string;
  name_english?: string;
  name_marathi?: string;
  weight_grams: number;
  purity: string;
  metal_type?: 'gold' | 'silver';
  making_charges_type?: 'percentage' | 'manual';
  making_charges_value?: number;
  other_charges?: number;
  stone_charges?: number;
  pieces?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
  category: 'necklace' | 'ring' | 'earring' | 'bracelet' | 'pendant' | 'other';
  type?: string;
  description?: string;
}

interface ProductFormProps {
  product?: any;
  onSave: () => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<{ barcode: string; uniqueNumber: string } | null>(null);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: product ? {
      title: product.title || product.name_english || '',
      name_english: product.name_english || '',
      name_marathi: product.name_marathi || '',
      weight_grams: product.weight_grams || 0,
      purity: product.purity || '',
      metal_type: product.metal_type || 'gold',
      making_charges_type: product.making_charges_type || 'percentage',
      making_charges_value: product.making_charges_value || 0,
      other_charges: product.other_charges || 0,
      stone_charges: product.stone_charges || 0,
      pieces: product.pieces || 1,
      stock_quantity: product.stock_quantity || 0,
      low_stock_threshold: product.low_stock_threshold || 5,
      category: product.category || 'other',
      type: product.type || '',
      description: product.description || ''
    } : {
      title: '',
      name_english: '',
      name_marathi: '',
      weight_grams: 0,
      purity: '',
      metal_type: 'gold',
      making_charges_type: 'percentage',
      making_charges_value: 0,
      other_charges: 0,
      stone_charges: 0,
      pieces: 1,
      stock_quantity: 0,
      low_stock_threshold: 5,
      category: 'other',
      type: '',
      description: ''
    }
  });

  const metalType = watch('metal_type');
  const makingChargesType = watch('making_charges_type');

  // Generate barcode and unique number for new products
  useEffect(() => {
    if (!product) {
      // For now, generate simple codes locally since RPC functions might not be available yet
      const generateLocalCodes = () => {
        const randomNum = Math.floor(Math.random() * 90000000 + 10000000);
        const timestamp = Date.now().toString().slice(-4);
        setGeneratedCodes({
          barcode: `AL${randomNum}`,
          uniqueNumber: `AL-PROD-${timestamp}`
        });
      };
      generateLocalCodes();
    }
  }, [product]);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    
    try {
      const productData = {
        title: data.title || data.name_english,
        weight_grams: data.weight_grams,
        purity: data.purity,
        category: data.category,
        type: data.type || data.metal_type,
        description: data.description,
        name_english: data.name_english,
        name_marathi: data.name_marathi,
        metal_type: data.metal_type,
        making_charges_type: data.making_charges_type,
        making_charges_value: data.making_charges_value,
        other_charges: data.other_charges,
        stone_charges: data.stone_charges,
        pieces: data.pieces,
        stock_quantity: data.stock_quantity,
        low_stock_threshold: data.low_stock_threshold,
        barcode: product ? product.barcode : generatedCodes?.barcode,
        unique_number: product ? product.unique_number : generatedCodes?.uniqueNumber,
      };

      let result;
      if (product) {
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
      } else {
        result = await supabase
          .from('products')
          .insert([productData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Product ${product ? 'updated' : 'created'} successfully`,
      });

      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: `Failed to ${product ? 'update' : 'create'} product`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Product Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Product Name (English) *</Label>
          <Input
            id="title"
            {...register('title', { required: 'Product name is required' })}
            placeholder="Enter product name"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name_marathi">Product Name (Marathi)</Label>
          <Input
            id="name_marathi"
            {...register('name_marathi')}
            placeholder="उत्पादनाचे नाव मराठीत"
          />
        </div>
      </div>

      {/* Weight and Pieces */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight_grams">Weight (grams) *</Label>
          <Input
            id="weight_grams"
            type="number"
            step="0.01"
            {...register('weight_grams', { required: 'Weight is required', min: 0.01 })}
            placeholder="0.00"
          />
          {errors.weight_grams && (
            <p className="text-sm text-red-500">{errors.weight_grams.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pieces">Pieces *</Label>
          <Input
            id="pieces"
            type="number"
            {...register('pieces', { required: 'Pieces is required', min: 1 })}
            placeholder="1"
          />
          {errors.pieces && (
            <p className="text-sm text-red-500">{errors.pieces.message}</p>
          )}
        </div>
      </div>

      {/* Purity and Metal Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purity">Purity *</Label>
          <Select onValueChange={(value) => setValue('purity', value)} defaultValue={watch('purity')}>
            <SelectTrigger>
              <SelectValue placeholder="Select purity" />
            </SelectTrigger>
            <SelectContent>
              {metalType === 'gold' ? (
                <>
                  <SelectItem value="22K">22 Karat</SelectItem>
                  <SelectItem value="18K">18 Karat</SelectItem>
                  <SelectItem value="14K">14 Karat</SelectItem>
                  <SelectItem value="10K">10 Karat</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="925">925 Silver</SelectItem>
                  <SelectItem value="999">999 Silver</SelectItem>
                  <SelectItem value="950">950 Silver</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          {errors.purity && (
            <p className="text-sm text-red-500">Purity is required</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Metal Type *</Label>
          <RadioGroup
            value={metalType}
            onValueChange={(value: 'gold' | 'silver') => setValue('metal_type', value)}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gold" id="gold" />
              <Label htmlFor="gold">Gold</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="silver" id="silver" />
              <Label htmlFor="silver">Silver</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Making Charges */}
      <div className="space-y-4">
        <Label>Making Charges</Label>
        <RadioGroup
          value={makingChargesType}
          onValueChange={(value: 'percentage' | 'manual') => setValue('making_charges_type', value)}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="percentage" id="percentage" />
            <Label htmlFor="percentage">Percentage</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="manual" />
            <Label htmlFor="manual">Manual Amount</Label>
          </div>
        </RadioGroup>
        
        <Input
          type="number"
          step="0.01"
          {...register('making_charges_value', { required: 'Making charges is required' })}
          placeholder={makingChargesType === 'percentage' ? 'Enter percentage' : 'Enter amount in ₹'}
        />
        {errors.making_charges_value && (
          <p className="text-sm text-red-500">{errors.making_charges_value.message}</p>
        )}
      </div>

      {/* Other Charges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="other_charges">Other Charges (₹)</Label>
          <Input
            id="other_charges"
            type="number"
            step="0.01"
            {...register('other_charges')}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stone_charges">Stone Charges (₹)</Label>
          <Input
            id="stone_charges"
            type="number"
            step="0.01"
            {...register('stone_charges')}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Stock Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stock_quantity">Stock Quantity *</Label>
          <Input
            id="stock_quantity"
            type="number"
            {...register('stock_quantity', { required: 'Stock quantity is required', min: 0 })}
            placeholder="0"
          />
          {errors.stock_quantity && (
            <p className="text-sm text-red-500">{errors.stock_quantity.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="low_stock_threshold">Low Stock Alert Threshold</Label>
          <Input
            id="low_stock_threshold"
            type="number"
            {...register('low_stock_threshold')}
            placeholder="5"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select onValueChange={(value: 'necklace' | 'ring' | 'earring' | 'bracelet' | 'pendant' | 'other') => setValue('category', value)} defaultValue={watch('category')}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="necklace">Necklace</SelectItem>
            <SelectItem value="ring">Ring</SelectItem>
            <SelectItem value="earring">Earring</SelectItem>
            <SelectItem value="bracelet">Bracelet</SelectItem>
            <SelectItem value="pendant">Pendant</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Generated Codes Preview */}
      {!product && generatedCodes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Generated Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="font-mono text-lg bg-muted p-2 rounded">{generatedCodes.barcode}</div>
              <div className="text-sm text-muted-foreground">{generatedCodes.uniqueNumber}</div>
              <div className="text-xs text-muted-foreground">
                Barcode will be generated automatically
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
        </Button>
      </div>
    </form>
  );
};
