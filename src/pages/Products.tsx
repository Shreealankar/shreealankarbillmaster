import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, Coins, TrendingUp, AlertTriangle, Edit2, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductForm } from "@/components/ProductForm";
import { ProductScanner } from "@/components/ProductScanner";

interface Product {
  id: string;
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
  barcode?: string;
  unique_number?: string;
  category: 'necklace' | 'ring' | 'earring' | 'bracelet' | 'pendant' | 'other';
  type?: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

const Products = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Dashboard stats
  const totalProducts = products.length;
  const goldProducts = products.filter(p => p.metal_type === 'gold');
  const silverProducts = products.filter(p => p.metal_type === 'silver');
  const totalGoldWeight = goldProducts.reduce((sum, p) => sum + ((p.weight_grams || 0) * (p.pieces || 1)), 0);
  const totalSilverWeight = silverProducts.reduce((sum, p) => sum + ((p.weight_grams || 0) * (p.pieces || 1)), 0);
  const lowStockProducts = products.filter(p => (p.stock_quantity || 0) <= (p.low_stock_threshold || 5));
  const outOfStockProducts = products.filter(p => (p.stock_quantity || 0) === 0);

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    (product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.name_english && product.name_english.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.name_marathi && product.name_marathi.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.unique_number && product.unique_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductSaved = () => {
    setShowForm(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleScanResult = (result: string) => {
    const product = products.find(p => 
      p.barcode === result || p.unique_number === result
    );
    if (product) {
      setSelectedProduct(product);
      setShowScanner(false);
    } else {
      toast({
        title: "Product not found",
        description: "No product found with this barcode or unique number",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('products')}</h1>
          <p className="text-muted-foreground">Manage your jewelry inventory</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowScanner(true)} variant="outline">
            <Search className="h-4 w-4 mr-2" />
            {t('scan')}
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('add.product')}
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gold Products</CardTitle>
            <Coins className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goldProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              {(totalGoldWeight / 1000).toFixed(2)} kg total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Silver Products</CardTitle>
            <Coins className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{silverProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              {(totalSilverWeight / 1000).toFixed(2)} kg total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {lowStockProducts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {outOfStockProducts.length} out of stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Notifications */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Stock Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outOfStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                  <span className="font-medium text-red-800">{product.name_english}</span>
                  <Badge variant="destructive">Out of Stock</Badge>
                </div>
              ))}
              {lowStockProducts.filter(p => p.stock_quantity > 0).map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                  <span className="font-medium text-orange-800">{product.name_english}</span>
                  <Badge variant="secondary">Low Stock: {product.stock_quantity}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, barcode, or unique number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your jewelry products and inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold">{product.title || product.name_english}</h3>
                      {product.name_marathi && (
                        <p className="text-sm text-muted-foreground">{product.name_marathi}</p>
                      )}
                    </div>
                    <Badge variant={product.metal_type === 'gold' ? 'default' : 'secondary'}>
                      {product.metal_type?.toUpperCase() || 'N/A'}
                    </Badge>
                    <Badge variant="outline">
                      {product.purity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Weight: {product.weight_grams}g × {product.pieces || 1} pcs</span>
                    <span>Stock: {product.stock_quantity || 0}</span>
                    {product.unique_number && <span>#{product.unique_number}</span>}
                    {product.barcode && <span>Barcode: {product.barcode}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct 
                ? 'Update the product information below.' 
                : 'Fill in the product details below. Fields marked with * are mandatory.'
              }
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={selectedProduct}
            onSave={handleProductSaved}
            onCancel={() => {
              setShowForm(false);
              setSelectedProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      {selectedProduct && !showForm && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedProduct.title || selectedProduct.name_english}</DialogTitle>
              {selectedProduct.name_marathi && (
                <DialogDescription>{selectedProduct.name_marathi}</DialogDescription>
              )}
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Weight:</span> {selectedProduct.weight_grams}g
                </div>
                <div>
                  <span className="font-medium">Pieces:</span> {selectedProduct.pieces}
                </div>
                <div>
                  <span className="font-medium">Purity:</span> {selectedProduct.purity}
                </div>
                <div>
                  <span className="font-medium">Metal:</span> {selectedProduct.metal_type}
                </div>
                <div>
                  <span className="font-medium">Stock:</span> {selectedProduct.stock_quantity || 0}
                </div>
                <div>
                  <span className="font-medium">Making Charges:</span> {selectedProduct.making_charges_value || 0}
                  {selectedProduct.making_charges_type === 'percentage' ? '%' : ' ₹'}
                </div>
              </div>
              {selectedProduct.barcode && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="font-mono text-lg mb-2">{selectedProduct.barcode}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedProduct.unique_number} • {selectedProduct.title || selectedProduct.name_english}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Product</DialogTitle>
            <DialogDescription>
              Scan a barcode or enter a unique number to find a product
            </DialogDescription>
          </DialogHeader>
          <ProductScanner onScan={handleScanResult} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;