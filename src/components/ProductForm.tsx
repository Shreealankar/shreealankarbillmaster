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
import { Upload, X } from "lucide-react";

interface ProductFormData {
  title: string;
  name_english?: string;
  name_marathi?: string;
  weight_grams: number;
  purity: string;
  metal_type?: 'gold' | 'silver';
  making_charges_type?: 'percentage' | 'manual';
  making_charges_percentage?: number;
  making_charges_manual?: number;
  other_charges?: number;
  stone_charges?: number;
  pieces?: number;
  stock_quantity?: number;
  minimum_stock?: number;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: product ? {
      title: product.title || product.name_english || '',
      name_english: product.name_english || '',
      name_marathi: product.name_marathi || '',
      weight_grams: product.weight_grams || 0,
      purity: product.purity || '',
      metal_type: product.metal_type || 'gold',
      making_charges_type: product.making_charges_type || 'percentage',
      making_charges_percentage: product.making_charges_percentage || 0,
      making_charges_manual: product.making_charges_manual || 0,
      other_charges: product.other_charges || 0,
      stone_charges: product.stone_charges || 0,
      pieces: product.pieces || 1,
      stock_quantity: product.stock_quantity || 0,
      minimum_stock: product?.minimum_stock || 5,
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
      making_charges_percentage: 0,
      making_charges_manual: 0,
      other_charges: 0,
      stone_charges: 0,
      pieces: 1,
      stock_quantity: 0,
      minimum_stock: 5,
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
      // Generate simple codes locally
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    setUploadingImage(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    
    try {
      let imageUrl = imagePreview;
      
      // Upload new image if selected
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const productData = {
        title: data.title || data.name_english || '',
        name_english: data.title || data.name_english || '',
        weight_grams: data.weight_grams,
        purity: data.purity,
        category: data.category,
        type: data.metal_type || 'gold',
        description: data.description,
        name_marathi: data.name_marathi,
        making_charges_type: data.making_charges_type,
        making_charges_percentage: data.making_charges_percentage,
        making_charges_manual: data.making_charges_manual,
        other_charges: data.other_charges,
        stone_charges: data.stone_charges,
        pieces: data.pieces,
        stock_quantity: data.stock_quantity,
        minimum_stock: data.minimum_stock,
        barcode: product ? product.barcode : generatedCodes?.barcode,
        unique_number: product ? product.unique_number : generatedCodes?.uniqueNumber,
        image_url: imageUrl,
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
      {/* Product Image Upload */}
      <div className="space-y-2">
        <Label>Product Image</Label>
        {imagePreview ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
            <img 
              src={imagePreview} 
              alt="Product preview" 
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload product image
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Max file size: 5MB
              </p>
            </label>
          </div>
        )}
      </div>

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
                  <SelectItem value="24K Gold Jewellery">24K Gold Jewellery</SelectItem>
                  <SelectItem value="24 Gold">24 Gold</SelectItem>
                  <SelectItem value="24 Gold 995">24 Gold 995</SelectItem>
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
          {...register(makingChargesType === 'percentage' ? 'making_charges_percentage' : 'making_charges_manual', { required: 'Making charges is required' })}
          placeholder={makingChargesType === 'percentage' ? 'Enter percentage' : 'Enter amount in ₹'}
        />
        {(errors.making_charges_percentage || errors.making_charges_manual) && (
          <p className="text-sm text-red-500">Making charges is required</p>
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
          <Label htmlFor="minimum_stock">Minimum Stock Alert Threshold</Label>
          <Input
            id="minimum_stock"
            type="number"
            {...register('minimum_stock')}
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
        <Button type="submit" disabled={loading || uploadingImage}>
          {loading || uploadingImage ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
        </Button>
      </div>
    </form>
  );
};
