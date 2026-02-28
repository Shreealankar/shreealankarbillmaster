import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Trash2, 
  Search,
  Calculator,
  Receipt,
  Printer,
  FileText,
  Eye,
  Trash,
  AlertTriangle,
  CalendarIcon,
  Edit,
  ShoppingBag
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BillPrint } from "@/components/BillPrint";
import { ProductScanner } from "@/components/ProductScanner";
import { PurchaseVoucherPrint } from "@/components/PurchaseVoucherPrint";

interface BillItem {
  id: string; // Frontend temporary ID or database UUID
  item_name: string;
  metal_type: string;
  purity: string;
  weight_grams: number;
  rate_per_gram: number;
  making_charges: number;
  making_charges_type?: string;
  making_charges_percentage?: number;
  stone_charges: number;
  other_charges: number;
  total_amount: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
}

export default function Billing() {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    gstin: ''
  });
  
  const [searchBillNo, setSearchBillNo] = useState('');
  const [currentBill, setCurrentBill] = useState<any>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteFromTurnover, setDeleteFromTurnover] = useState(false);
  const [isEditingBill, setIsEditingBill] = useState(false);
  
  const [newItem, setNewItem] = useState({
    item_name: '',
    metal_type: 'gold',
    purity: '22k',
    weight_grams: 0,
    rate_per_gram: 0,
    making_charges: 0,
    making_charges_type: 'manual', // 'manual' or 'percentage'
    making_charges_percentage: 0,
    stone_charges: 0,
    other_charges: 0
  });

  const [billing, setBilling] = useState({
    total_amount: 0,
    discount_percentage: 0,
    discount_amount: 0,
    tax_percentage: 3,
    tax_amount: 0,
    cgst_amount: 0,
    sgst_amount: 0,
    igst_amount: 0,
    is_igst: false,
    final_amount: 0,
    paid_amount: 0,
    balance_amount: 0,
    payment_method: 'cash',
    notes: ''
  });

  // Shop GSTIN - Maharashtra state code 27
  const SHOP_GSTIN = '27XXXXX0000X1Z5'; // Replace with actual GSTIN
  const SHOP_STATE_CODE = '27';

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [billDate, setBillDate] = useState<Date>(new Date());
  const [showScanner, setShowScanner] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomers();
    fetchRates();
    fetchProducts();
    loadBookingData();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [billItems, billing.discount_percentage, billing.tax_percentage, billing.paid_amount, billing.is_igst]);

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .order('name');
    
    if (data) setCustomers(data);
  };

  const fetchRates = async () => {
    const { data } = await supabase
      .from('rates')
      .select('*')
      .order('metal_type');
    
    if (data) setRates(data);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('name_english');
    
    if (data) setProducts(data);
  };

  const loadBookingData = () => {
    const bookingData = sessionStorage.getItem('bookingData');
    if (bookingData) {
      try {
        const data = JSON.parse(bookingData);
        setCustomer({
          name: data.customerName || '',
          phone: data.customerPhone || '',
          address: data.customerAddress || '',
          email: data.email || '',
          gstin: ''
        });
        
        // Optionally prefill an item with the gold weight
        if (data.goldWeight) {
          const goldRate = getCurrentRate('gold');
          setNewItem(prev => ({
            ...prev,
            weight_grams: data.goldWeight,
            rate_per_gram: goldRate
          }));
        }
        
        // Clear the session storage after loading
        sessionStorage.removeItem('bookingData');
        
        toast({
          title: "Booking Data Loaded",
          description: "Customer information has been filled from booking",
        });
      } catch (error) {
        console.error('Error loading booking data:', error);
      }
    }
  };

  const handleScanResult = (result: string) => {
    const product = products.find(p => 
      p.barcode === result || p.unique_number === result
    );
    if (product) {
      // Auto-populate item data from scanned product
      const currentRate = getCurrentRate(product.type || 'gold');
      
      setNewItem({
        item_name: product.name_english || product.title,
        metal_type: product.type || 'gold',
        purity: product.purity || '22k',
        weight_grams: product.weight_grams || 0,
        rate_per_gram: currentRate,
        making_charges: product.making_charges_type === 'percentage' 
          ? ((product.weight_grams || 0) * currentRate * (product.making_charges_percentage || 0)) / 100
          : product.making_charges_manual || 0,
        making_charges_type: product.making_charges_type || 'manual',
        making_charges_percentage: product.making_charges_percentage || 0,
        stone_charges: product.stone_charges || 0,
        other_charges: product.other_charges || 0
      });
      setShowScanner(false);
      toast({
        title: "Product Found",
        description: `${product.name_english} data loaded successfully`,
      });
    } else {
      toast({
        title: "Product not found",
        description: "No product found with this barcode or unique number",
        variant: "destructive",
      });
    }
  };

  const calculateItemTotal = (item: typeof newItem) => {
    const baseAmount = item.weight_grams * item.rate_per_gram;
    return baseAmount + item.making_charges + item.stone_charges + item.other_charges;
  };

  const addItem = () => {
    if (!newItem.item_name || !newItem.weight_grams || !newItem.rate_per_gram) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const total_amount = calculateItemTotal(newItem);
    const item: BillItem = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Frontend temp ID
      ...newItem,
      total_amount
    };

    setBillItems([...billItems, item]);
    setNewItem({
      item_name: '',
      metal_type: 'gold',
      purity: '22k',
      weight_grams: 0,
      rate_per_gram: 0,
      making_charges: 0,
      making_charges_type: 'manual',
      making_charges_percentage: 0,
      stone_charges: 0,
      other_charges: 0
    });
  };

  const removeItem = (id: string) => {
    setBillItems(billItems.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    const total_amount = billItems.reduce((sum, item) => sum + item.total_amount, 0);
    const discount_amount = (total_amount * billing.discount_percentage) / 100;
    const taxable_amount = total_amount - discount_amount;
    const tax_amount = (taxable_amount * billing.tax_percentage) / 100;
    
    // GST breakup
    let cgst_amount = 0;
    let sgst_amount = 0;
    let igst_amount = 0;
    
    if (billing.is_igst) {
      igst_amount = tax_amount;
    } else {
      cgst_amount = tax_amount / 2;
      sgst_amount = tax_amount / 2;
    }
    
    const final_amount = taxable_amount + tax_amount;
    const balance_amount = final_amount - billing.paid_amount;

    setBilling(prev => ({
      ...prev,
      total_amount,
      discount_amount,
      tax_amount,
      cgst_amount,
      sgst_amount,
      igst_amount,
      final_amount,
      balance_amount
    }));
  };

  // Auto-detect IGST based on customer GSTIN state code
  useEffect(() => {
    if (customer.gstin && customer.gstin.length >= 2) {
      const customerStateCode = customer.gstin.substring(0, 2);
      const isInterState = customerStateCode !== SHOP_STATE_CODE;
      setBilling(prev => ({ ...prev, is_igst: isInterState }));
    }
  }, [customer.gstin]);

  // Validate GSTIN format
  const validateGSTIN = (gstin: string): boolean => {
    if (!gstin) return true; // Optional field
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin.toUpperCase());
  };

  const generateSABillNumber = async () => {
    const { data, error } = await supabase.rpc('generate_bill_number');
    if (error) throw error;
    return data;
  };

  const printBill = async () => {
    if (!customer.name || !customer.phone || !customer.email || billItems.length === 0) {
      toast({
        title: "Error", 
        description: "Please fill customer name, phone, Gmail ID and add at least one item",
        variant: "destructive"
      });
      return;
    }

      console.log("=== Starting bill creation ===");
      console.log("Customer:", customer);
      console.log("Bill items:", billItems);
      console.log("Billing data:", billing);

    setLoading(true);
    try {
      // Save or get customer
      let customerId = null;
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', customer.phone)
        .maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;
        // Update existing customer with current details including email
        await supabase
          .from('customers')
          .update(customer)
          .eq('id', customerId);
      } else {
        const { data: newCustomer } = await supabase
          .from('customers')
          .insert([customer])
          .select('id')
          .single();
        customerId = newCustomer?.id;
      }

      // Save bill (let database auto-generate bill number via trigger)
      const billData = {
        bill_number: '', // Will be auto-generated by trigger
        customer_id: customerId,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        customer_gstin: customer.gstin || null,
        total_weight: billItems.reduce((sum, item) => sum + item.weight_grams, 0),
        created_at: billDate.toISOString(),
        ...billing
      };

      console.log("=== Inserting bill ===");
      console.log("Bill data:", billData);

      const { data: savedBill, error: billError } = await supabase
        .from('bills')
        .insert(billData)
        .select()
        .single();

      console.log("Bill insert result:", { savedBill, billError });
      if (billError) throw billError;

      // Save bill items (exclude frontend temp ID)
      const itemsData = billItems.map(item => {
        const { id, ...itemWithoutId } = item;
        return {
          bill_id: savedBill.id,
          ...itemWithoutId
        };
      });

      const { error: itemsError } = await supabase
        .from('bill_items')
        .insert(itemsData);

      if (itemsError) throw itemsError;

      setCurrentBill({ ...savedBill, items: billItems, customer_email: customer.email });
      setShowPrint(true);

      toast({
        title: "बिल तयार झाले",
        description: `Bill ${savedBill.bill_number} ready for print`,
      });
    } catch (error: any) {
      console.error("=== Bill creation error ===");
      console.error("Error details:", error);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const searchBill = async () => {
    if (!searchBillNo.trim()) return;
    
    try {
      const { data: bill } = await supabase
        .from('bills')
        .select(`
          id,
          bill_number,
          customer_id,
          customer_name,
          customer_phone,
          customer_address,
          total_weight,
          total_amount,
          paid_amount,
          balance_amount,
          discount_percentage,
          discount_amount,
          tax_percentage,
          tax_amount,
          final_amount,
          payment_method,
          notes,
          created_at,
          updated_at,
          bill_items (*),
          customers!bills_customer_id_fkey (email)
        `)
        .eq('bill_number', searchBillNo.trim())
        .single();

      if (bill) {
        setCurrentBill({ 
          ...bill, 
          customer_email: bill.customers?.email,
          items: bill.bill_items || [] // Normalize items property for BillPrint
        });
        setCustomer({
          name: bill.customer_name,
          phone: bill.customer_phone,
          address: bill.customer_address || '',
          email: bill.customers?.email || '',
          gstin: (bill as any).customer_gstin || ''
        });
        setBillItems(bill.bill_items || []);
        setBilling({
          total_amount: bill.total_amount,
          discount_percentage: bill.discount_percentage || 0,
          discount_amount: bill.discount_amount || 0,
          tax_percentage: bill.tax_percentage || 3,
          tax_amount: bill.tax_amount || 0,
          cgst_amount: (bill as any).cgst_amount || 0,
          sgst_amount: (bill as any).sgst_amount || 0,
          igst_amount: (bill as any).igst_amount || 0,
          is_igst: (bill as any).is_igst || false,
          final_amount: bill.final_amount,
          paid_amount: bill.paid_amount,
          balance_amount: bill.balance_amount,
          payment_method: bill.payment_method || 'cash',
          notes: bill.notes || ''
        });
        setIsEditingBill(false);
        toast({
          title: "बिल मिळाले",
          description: `Bill ${searchBillNo} loaded successfully`,
        });
      } else {
        toast({
          title: "बिल नाही मिळाले",
          description: "Bill not found",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search bill",
        variant: "destructive"
      });
    }
  };

  const updateBill = async () => {
    if (!currentBill?.id) return;
    
    setLoading(true);
    try {
      // Update customer info
      if (currentBill.customer_id) {
        await supabase
          .from('customers')
          .update(customer)
          .eq('id', currentBill.customer_id);
      }

      // Update bill
      const billData = {
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        total_weight: billItems.reduce((sum, item) => sum + item.weight_grams, 0),
        ...billing
      };

      await supabase
        .from('bills')
        .update(billData)
        .eq('id', currentBill.id);

      toast({
        title: "बिल अपडेट केले",
        description: `Bill ${currentBill.bill_number} updated successfully`,
      });

      // Reload the bill to get updated data
      await searchBill();
      setIsEditingBill(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bill",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteBill = async () => {
    if (!currentBill?.id) return;
    
    setLoading(true);
    try {
      // Delete bill items first
      await supabase
        .from('bill_items')
        .delete()
        .eq('bill_id', currentBill.id);

      // Delete bill
      await supabase
        .from('bills')
        .delete()
        .eq('id', currentBill.id);

      toast({
        title: "बिल हटवले",
        description: `Bill ${currentBill.bill_number} deleted${deleteFromTurnover ? ' from turnover' : ''}`,
      });

      resetForm();
      setCurrentBill(null);
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bill",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCustomer({ name: '', phone: '', address: '', email: '', gstin: '' });
    setBillItems([]);
    setBilling({
      total_amount: 0,
      discount_percentage: 0,
      discount_amount: 0,
      tax_percentage: 3,
      tax_amount: 0,
      cgst_amount: 0,
      sgst_amount: 0,
      igst_amount: 0,
      is_igst: false,
      final_amount: 0,
      paid_amount: 0,
      balance_amount: 0,
      payment_method: 'cash',
      notes: ''
    });
    setCurrentBill(null);
    setSearchBillNo('');
  };

  const selectCustomer = (selectedCustomer: any) => {
    setCustomer({
      name: selectedCustomer.name,
      phone: selectedCustomer.phone,
      address: selectedCustomer.address || '',
      email: selectedCustomer.email || '',
      gstin: selectedCustomer.gstin || ''
    });
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const getCurrentRate = (metalType: string) => {
    const rate = rates.find(r => r.metal_type.toLowerCase() === metalType.toLowerCase());
    return rate ? rate.rate_per_gram : 0;
  };

  const autoFillRate = () => {
    const currentRate = getCurrentRate(newItem.metal_type);
    if (currentRate > 0) {
      // Rate is already per gram, no need to divide
      setNewItem(prev => ({
        ...prev,
        rate_per_gram: currentRate
      }));
      toast({
        title: "Rate Auto-Filled",
        description: `Rate set to ₹${currentRate}/gram for ${newItem.metal_type}`,
      });
    } else {
      toast({
        title: "No Rate Found",
        description: `No rate available for ${newItem.metal_type}`,
        variant: "destructive"
      });
    }
  };

  // ========== Purchase Voucher State ==========
  const [activeTab, setActiveTab] = useState<string>('sales');
  const [pvCustomer, setPvCustomer] = useState({
    name: '', phone: '', address: '', pan_aadhaar: ''
  });
  const [pvItems, setPvItems] = useState<Array<{
    id: string; item_description: string; net_weight: number;
    purity: string; rate_per_gram: number; total_amount: number; metal_type: string;
  }>>([]);
  const [pvNewItem, setPvNewItem] = useState({
    item_description: '', net_weight: 0, purity: '22K', rate_per_gram: 0, metal_type: 'gold'
  });
  const [pvPayment, setPvPayment] = useState({ method: 'cash', utr_number: '', notes: '' });
  const [pvDate, setPvDate] = useState<Date>(new Date());
  const [pvLoading, setPvLoading] = useState(false);
  const [showPvPrint, setShowPvPrint] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState<any>(null);
  const [currentVoucherItems, setCurrentVoucherItems] = useState<any[]>([]);

  const pvTotalWeight = pvItems.reduce((s, i) => s + i.net_weight, 0);
  const pvTotalAmount = pvItems.reduce((s, i) => s + i.total_amount, 0);

  const addPvItem = () => {
    if (!pvNewItem.item_description || !pvNewItem.net_weight || !pvNewItem.rate_per_gram) {
      toast({ title: "Error", description: "कृपया सर्व आवश्यक फील्ड भरा", variant: "destructive" });
      return;
    }
    const total = pvNewItem.net_weight * pvNewItem.rate_per_gram;
    setPvItems([...pvItems, { ...pvNewItem, total_amount: total, id: `pv_${Date.now()}` }]);
    setPvNewItem({ item_description: '', net_weight: 0, purity: '22K', rate_per_gram: 0, metal_type: 'gold' });
  };

  const removePvItem = (id: string) => setPvItems(pvItems.filter(i => i.id !== id));

  const savePurchaseVoucher = async () => {
    if (!pvCustomer.name || !pvCustomer.phone || pvItems.length === 0) {
      toast({ title: "Error", description: "कृपया ग्राहकाचे नाव, फोन आणि किमान एक वस्तू जोडा", variant: "destructive" });
      return;
    }
    setPvLoading(true);
    try {
      const voucherData = {
        voucher_number: '',
        customer_name: pvCustomer.name,
        customer_phone: pvCustomer.phone,
        customer_address: pvCustomer.address || null,
        pan_aadhaar: pvCustomer.pan_aadhaar || null,
        total_weight: pvTotalWeight,
        total_amount: pvTotalAmount,
        payment_method: pvPayment.method,
        utr_number: pvPayment.method === 'bank' ? pvPayment.utr_number : null,
        notes: pvPayment.notes || null,
        voucher_date: pvDate.toISOString(),
      };

      const { data: savedVoucher, error: vErr } = await supabase
        .from('purchase_vouchers')
        .insert(voucherData)
        .select()
        .single();
      if (vErr) throw vErr;

      const itemsData = pvItems.map(({ id, ...rest }) => ({
        voucher_id: savedVoucher.id,
        item_description: rest.item_description,
        net_weight: rest.net_weight,
        purity: rest.purity,
        rate_per_gram: rest.rate_per_gram,
        total_amount: rest.total_amount,
        metal_type: rest.metal_type,
      }));
      const { error: iErr } = await supabase.from('purchase_voucher_items').insert(itemsData);
      if (iErr) throw iErr;

      setCurrentVoucher(savedVoucher);
      setCurrentVoucherItems(pvItems);
      setShowPvPrint(true);
      toast({ title: "पावती तयार!", description: `Voucher ${savedVoucher.voucher_number} saved` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setPvLoading(false);
    }
  };

  const resetPvForm = () => {
    setPvCustomer({ name: '', phone: '', address: '', pan_aadhaar: '' });
    setPvItems([]);
    setPvNewItem({ item_description: '', net_weight: 0, purity: '22K', rate_per_gram: 0, metal_type: 'gold' });
    setPvPayment({ method: 'cash', utr_number: '', notes: '' });
    setCurrentVoucher(null);
  };

  const autoFillPvRate = () => {
    const currentRate = getCurrentRate(pvNewItem.metal_type);
    if (currentRate > 0) {
      setPvNewItem(prev => ({ ...prev, rate_per_gram: currentRate }));
      toast({ title: "दर भरला", description: `₹${currentRate}/gram for ${pvNewItem.metal_type}` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            श्री अलंकार ज्वेलर्स
          </h1>
          <p className="text-muted-foreground mt-1">
            गावकऱ्यांसाठी सुलभ बिलिंग
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Sales Bill (Tax Invoice)
          </TabsTrigger>
          <TabsTrigger value="purchase" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            खरेदी पावती (Purchase Voucher)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
      {/* Sales Bill - existing content */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-end">
          <div className="flex gap-2">
            <Button onClick={resetForm} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Bill
            </Button>
            <Button onClick={printBill} disabled={loading} className="bg-gradient-gold text-white">
              <Printer className="h-4 w-4 mr-2" />
              Print Bill
            </Button>
          </div>
        </div>

        {/* Previous Bill Search */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium">Previous Bills (SA Number)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="SA-2024-0001"
                    value={searchBillNo}
                    onChange={(e) => setSearchBillNo(e.target.value)}
                    className="font-mono"
                  />
                  <Button onClick={searchBill} size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
              {currentBill && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowPrint(true)} 
                    size="sm" 
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                   {!isEditingBill ? (
                    <Button 
                      onClick={() => setIsEditingBill(true)} 
                      size="sm" 
                      variant="secondary"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Bill
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        onClick={updateBill} 
                        size="sm" 
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Save Changes
                      </Button>
                      <Button 
                        onClick={() => {
                          setIsEditingBill(false);
                          searchBill(); // Reload original data
                        }} 
                        size="sm" 
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  <Button 
                    onClick={() => setShowDeleteDialog(true)} 
                    size="sm" 
                    variant="destructive"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {currentBill && (
          <div className={`p-3 rounded-lg border ${isEditingBill ? 'bg-orange-50 border-orange-200' : 'bg-primary/10 border-primary/20'}`}>
            <div className={`text-sm font-medium ${isEditingBill ? 'text-orange-700' : 'text-primary'}`}>
              {isEditingBill ? 'संपादन करत आहे' : 'लोड केलेले'} बिल: {currentBill.bill_number}
            </div>
            <div className="text-xs text-muted-foreground">
              ग्राहक: {currentBill.customer_name} | फोन: {currentBill.customer_phone}
              {isEditingBill && <span className="ml-2 text-orange-600">(Changes can be saved)</span>}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Details */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Search Existing Customer</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              {searchTerm && filteredCustomers.length > 0 && (
                <div className="max-h-32 overflow-y-auto border rounded-md">
                  {filteredCustomers.slice(0, 5).map((c) => (
                    <div
                      key={c.id}
                      className="p-2 hover:bg-muted cursor-pointer text-sm"
                      onClick={() => {
                        selectCustomer(c);
                        setSearchTerm('');
                      }}
                    >
                      <div className="font-medium">{c.name}</div>
                      <div className="text-muted-foreground">{c.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Bill Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !billDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {billDate ? format(billDate, "dd/MM/yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={billDate}
                    onSelect={(date) => date && setBillDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>{t('customer.name')} *</Label>
              <Input
                value={customer.name}
                onChange={(e) => setCustomer({...customer, name: e.target.value})}
                placeholder="Enter customer name"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('customer.phone')} *</Label>
              <Input
                value={customer.phone}
                onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label>Gmail ID *</Label>
              <Input
                type="email"
                value={customer.email}
                onChange={(e) => setCustomer({...customer, email: e.target.value})}
                placeholder="Enter gmail address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>GSTIN (Optional - B2B)</Label>
              <Input
                value={customer.gstin}
                onChange={(e) => setCustomer({...customer, gstin: e.target.value.toUpperCase()})}
                placeholder="e.g. 27AABCU9603R1ZM"
                maxLength={15}
              />
              {customer.gstin && !validateGSTIN(customer.gstin) && (
                <p className="text-xs text-destructive">Invalid GSTIN format</p>
              )}
              {customer.gstin && validateGSTIN(customer.gstin) && (
                <p className="text-xs text-green-600">✓ Valid GSTIN - State: {customer.gstin.substring(0, 2)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('customer.address')}</Label>
              <Textarea
                value={customer.address}
                onChange={(e) => setCustomer({...customer, address: e.target.value})}
                placeholder="Enter address"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Add Items */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>{t('item.name')} *</Label>
                <Button 
                  type="button" 
                  onClick={() => setShowScanner(true)}
                  variant="outline" 
                  size="sm"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Scan Product
                </Button>
              </div>
              <Input
                value={newItem.item_name}
                onChange={(e) => setNewItem({...newItem, item_name: e.target.value})}
                placeholder="Enter item name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('metal.type')}</Label>
                <Select value={newItem.metal_type} onValueChange={(value) => {
                  setNewItem({
                    ...newItem, 
                    metal_type: value,
                    rate_per_gram: getCurrentRate(value)
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('purity')}</Label>
                <Select value={newItem.purity} onValueChange={(value) => setNewItem({...newItem, purity: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24k">24K</SelectItem>
                    <SelectItem value="22k">22K</SelectItem>
                    <SelectItem value="20k">20K</SelectItem>
                    <SelectItem value="18k">18K</SelectItem>
                    <SelectItem value="pure">Pure Silver</SelectItem>
                    <SelectItem value="925">925 Silver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('weight.grams')} *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newItem.weight_grams || ''}
                    onChange={(e) => {
                      const weight = Number(e.target.value);
                      const updatedItem = { ...newItem, weight_grams: weight };
                      
                      // Auto-recalculate making charges if in percentage mode
                      if (newItem.making_charges_type === 'percentage' && newItem.making_charges_percentage > 0) {
                        const baseAmount = weight * newItem.rate_per_gram;
                        const calculatedCharges = (baseAmount * newItem.making_charges_percentage) / 100;
                        updatedItem.making_charges = calculatedCharges;
                      }
                      
                      setNewItem(updatedItem);
                    }}
                    placeholder="0.00"
                  />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  {t('rate.per.gram')} *
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={autoFillRate}
                    className="h-6 text-xs"
                  >
                    Auto Fill
                  </Button>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newItem.rate_per_gram || ''}
                  onChange={(e) => {
                    const rate = Number(e.target.value);
                    const updatedItem = { ...newItem, rate_per_gram: rate };
                    
                    // Auto-recalculate making charges if in percentage mode
                    if (newItem.making_charges_type === 'percentage' && newItem.making_charges_percentage > 0) {
                      const baseAmount = newItem.weight_grams * rate;
                      const calculatedCharges = (baseAmount * newItem.making_charges_percentage) / 100;
                      updatedItem.making_charges = calculatedCharges;
                    }
                    
                    setNewItem(updatedItem);
                  }}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('making.charges')}</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newItem.making_charges_type === 'manual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewItem({...newItem, making_charges_type: 'manual', making_charges: 0})}
                    className="flex-1"
                  >
                    Manual
                  </Button>
                  <Button
                    type="button"
                    variant={newItem.making_charges_type === 'percentage' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewItem({...newItem, making_charges_type: 'percentage', making_charges_percentage: 0})}
                    className="flex-1"
                  >
                    Percentage
                  </Button>
                </div>
                
                {newItem.making_charges_type === 'manual' ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={newItem.making_charges || ''}
                    onChange={(e) => setNewItem({...newItem, making_charges: Number(e.target.value)})}
                    placeholder="0.00"
                  />
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={newItem.making_charges_percentage || ''}
                      onChange={(e) => {
                        const percentage = Number(e.target.value);
                        const baseAmount = newItem.weight_grams * newItem.rate_per_gram;
                        const calculatedCharges = (baseAmount * percentage) / 100;
                        setNewItem({
                          ...newItem, 
                          making_charges_percentage: percentage,
                          making_charges: calculatedCharges
                        });
                      }}
                      placeholder="Enter percentage"
                    />
                    {newItem.making_charges_percentage > 0 && newItem.weight_grams > 0 && newItem.rate_per_gram > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Calculated: ₹{newItem.making_charges.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('stone.charges')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newItem.stone_charges || ''}
                  onChange={(e) => setNewItem({...newItem, stone_charges: Number(e.target.value)})}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('other.charges')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newItem.other_charges || ''}
                  onChange={(e) => setNewItem({...newItem, other_charges: Number(e.target.value)})}
                  placeholder="0.00"
                />
              </div>
            </div>

            {newItem.weight_grams > 0 && newItem.rate_per_gram > 0 && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground">Calculated Total:</div>
                <div className="text-lg font-semibold text-primary">
                  ₹{calculateItemTotal(newItem).toLocaleString('en-IN')}
                </div>
              </div>
            )}

            <Button onClick={addItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        {/* Bill Summary */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Bill Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">₹{billing.total_amount.toLocaleString('en-IN')}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Discount %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={billing.discount_percentage || ''}
                    onChange={(e) => setBilling({...billing, discount_percentage: Number(e.target.value)})}
                    placeholder="0"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Amount</Label>
                  <div className="h-8 px-3 py-1 text-sm bg-muted rounded-md flex items-center">
                    ₹{billing.discount_amount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">GST % (Jewelry: 3%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={billing.tax_percentage || ''}
                    onChange={(e) => setBilling({...billing, tax_percentage: Number(e.target.value)})}
                    placeholder="3"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Total GST</Label>
                  <div className="h-8 px-3 py-1 text-sm bg-muted rounded-md flex items-center">
                    ₹{billing.tax_amount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* GST Breakup */}
              <div className="p-2 bg-muted/50 rounded-md space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">GST Type:</span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!billing.is_igst ? 'default' : 'outline'}
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => setBilling({...billing, is_igst: false})}
                    >
                      CGST+SGST
                    </Button>
                    <Button
                      type="button"
                      variant={billing.is_igst ? 'default' : 'outline'}
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => setBilling({...billing, is_igst: true})}
                    >
                      IGST
                    </Button>
                  </div>
                </div>
                {!billing.is_igst ? (
                  <>
                    <div className="flex justify-between text-xs">
                      <span>CGST ({(billing.tax_percentage / 2).toFixed(1)}%):</span>
                      <span>₹{billing.cgst_amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>SGST ({(billing.tax_percentage / 2).toFixed(1)}%):</span>
                      <span>₹{billing.sgst_amount.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-xs">
                    <span>IGST ({billing.tax_percentage}%):</span>
                    <span>₹{billing.igst_amount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Final Amount:</span>
                <span className="text-primary">₹{billing.final_amount.toLocaleString('en-IN')}</span>
              </div>

              <div className="space-y-2">
                <Label>Paid Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={billing.paid_amount || ''}
                  onChange={(e) => setBilling({...billing, paid_amount: Number(e.target.value)})}
                  placeholder="0.00"
                />
              </div>

              <div className="flex justify-between">
                <span>Balance:</span>
                <span className={`font-medium ${billing.balance_amount > 0 ? 'text-destructive' : 'text-green-500'}`}>
                  ₹{billing.balance_amount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={billing.payment_method} onValueChange={(value) => setBilling({...billing, payment_method: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={billing.notes}
                  onChange={(e) => setBilling({...billing, notes: e.target.value})}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      {billItems.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle>Bill Items ({billItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Metal/Purity</TableHead>
                    <TableHead className="text-right">Weight (g)</TableHead>
                    <TableHead className="text-right">Rate/g</TableHead>
                    <TableHead className="text-right">Making</TableHead>
                    <TableHead className="text-right">Stone</TableHead>
                    <TableHead className="text-right">Other</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.item_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {item.metal_type} {item.purity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.weight_grams}</TableCell>
                      <TableCell className="text-right">₹{item.rate_per_gram}</TableCell>
                      <TableCell className="text-right">₹{item.making_charges}</TableCell>
                      <TableCell className="text-right">₹{item.stone_charges}</TableCell>
                      <TableCell className="text-right">₹{item.other_charges}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{item.total_amount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-w-[90vw]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                बिल हटवा
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>तुम्हाला खात्री आहे की तुम्ही हे बिल हटवू इच्छिता?</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deleteType"
                    checked={!deleteFromTurnover}
                    onChange={() => setDeleteFromTurnover(false)}
                  />
                  फक्त रेकॉर्ड हटवा
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deleteType"
                    checked={deleteFromTurnover}
                    onChange={() => setDeleteFromTurnover(true)}
                  />
                  टर्नओव्हर मधूनही हटवा
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteDialog(false)}
                >
                  रद्द करा
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={deleteBill}
                  disabled={loading}
                >
                  हटवा
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}


        </TabsContent>

        {/* ========== Purchase Voucher Tab ========== */}
        <TabsContent value="purchase" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">जुने सोने/चांदी खरेदी पावती</h2>
            <div className="flex gap-2">
              <Button onClick={resetPvForm} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                नवीन पावती
              </Button>
              <Button onClick={savePurchaseVoucher} disabled={pvLoading} className="bg-gradient-gold text-white">
                <Printer className="h-4 w-4 mr-2" />
                पावती तयार करा
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Details */}
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  ग्राहक माहिती
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>पावतीची तारीख</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(pvDate, "dd/MM/yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={pvDate} onSelect={(d) => d && setPvDate(d)} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>ग्राहकाचे नाव *</Label>
                  <Input value={pvCustomer.name} onChange={(e) => setPvCustomer({...pvCustomer, name: e.target.value})} placeholder="नाव प्रविष्ट करा" />
                </div>
                <div className="space-y-2">
                  <Label>मोबाईल क्र. *</Label>
                  <Input value={pvCustomer.phone} onChange={(e) => setPvCustomer({...pvCustomer, phone: e.target.value})} placeholder="फोन नंबर" />
                </div>
                <div className="space-y-2">
                  <Label>पत्ता</Label>
                  <Textarea value={pvCustomer.address} onChange={(e) => setPvCustomer({...pvCustomer, address: e.target.value})} placeholder="पत्ता" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>पॅन / आधार क्र.</Label>
                  <Input value={pvCustomer.pan_aadhaar} onChange={(e) => setPvCustomer({...pvCustomer, pan_aadhaar: e.target.value})} placeholder="PAN / Aadhaar number" />
                  <p className="text-xs text-muted-foreground">मोठ्या रकमेसाठी आवश्यक</p>
                </div>
              </CardContent>
            </Card>

            {/* Add Item */}
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  दागिना जोडा
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>दागिन्यांचा तपशील *</Label>
                  <Input value={pvNewItem.item_description} onChange={(e) => setPvNewItem({...pvNewItem, item_description: e.target.value})} placeholder="उदा. अंगठी, चैन" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>धातू</Label>
                    <Select value={pvNewItem.metal_type} onValueChange={(v) => setPvNewItem({...pvNewItem, metal_type: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gold">सोने (Gold)</SelectItem>
                        <SelectItem value="silver">चांदी (Silver)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>शुद्धता</Label>
                    <Select value={pvNewItem.purity} onValueChange={(v) => setPvNewItem({...pvNewItem, purity: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24K">24K</SelectItem>
                        <SelectItem value="22K">22K</SelectItem>
                        <SelectItem value="20K">20K</SelectItem>
                        <SelectItem value="18K">18K</SelectItem>
                        <SelectItem value="pure">Pure Silver</SelectItem>
                        <SelectItem value="925">925 Silver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>निव्वळ वजन (ग्रॅम) *</Label>
                    <Input type="number" step="0.001" value={pvNewItem.net_weight || ''} onChange={(e) => setPvNewItem({...pvNewItem, net_weight: Number(e.target.value)})} placeholder="0.000" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                      दर प्रति ग्रॅम *
                      <Button type="button" variant="outline" size="sm" onClick={autoFillPvRate} className="h-6 text-xs">Auto</Button>
                    </Label>
                    <Input type="number" step="0.01" value={pvNewItem.rate_per_gram || ''} onChange={(e) => setPvNewItem({...pvNewItem, rate_per_gram: Number(e.target.value)})} placeholder="0.00" />
                  </div>
                </div>
                {pvNewItem.net_weight > 0 && pvNewItem.rate_per_gram > 0 && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="text-sm text-muted-foreground">एकूण रक्कम:</div>
                    <div className="text-lg font-semibold text-primary">₹{(pvNewItem.net_weight * pvNewItem.rate_per_gram).toLocaleString('en-IN')}</div>
                  </div>
                )}
                <Button onClick={addPvItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  वस्तू जोडा
                </Button>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  सारांश
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>एकूण वजन:</span>
                  <span>{pvTotalWeight.toFixed(3)} ग्रॅम</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>एकूण रक्कम:</span>
                  <span className="text-primary">₹{pvTotalAmount.toLocaleString('en-IN')}</span>
                </div>
                <Separator />
                <div className="p-2 bg-muted/50 rounded-md text-xs text-muted-foreground">
                  <strong>GST:</strong> या व्यवहारावर GST लागू नाही (No GST applicable)
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>रक्कम देण्याची पद्धत</Label>
                  <Select value={pvPayment.method} onValueChange={(v) => setPvPayment({...pvPayment, method: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">रोख (Cash)</SelectItem>
                      <SelectItem value="bank">बँक ट्रान्सफर (UPI/NEFT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {pvPayment.method === 'bank' && (
                  <div className="space-y-2">
                    <Label>UTR क्र.</Label>
                    <Input value={pvPayment.utr_number} onChange={(e) => setPvPayment({...pvPayment, utr_number: e.target.value})} placeholder="UTR Number" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>टिप्पण्या</Label>
                  <Textarea value={pvPayment.notes} onChange={(e) => setPvPayment({...pvPayment, notes: e.target.value})} placeholder="अतिरिक्त नोट्स..." rows={2} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PV Items Table */}
          {pvItems.length > 0 && (
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle>खरेदी वस्तू ({pvItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>अ.क्र.</TableHead>
                        <TableHead>तपशील</TableHead>
                        <TableHead>धातू/शुद्धता</TableHead>
                        <TableHead className="text-right">वजन (ग्रॅम)</TableHead>
                        <TableHead className="text-right">दर/ग्रॅम</TableHead>
                        <TableHead className="text-right">एकूण</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pvItems.map((item, idx) => (
                        <TableRow key={item.id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell className="font-medium">{item.item_description}</TableCell>
                          <TableCell><Badge variant="secondary">{item.metal_type} {item.purity}</Badge></TableCell>
                          <TableCell className="text-right">{item.net_weight.toFixed(3)}</TableCell>
                          <TableCell className="text-right">₹{item.rate_per_gram.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right font-semibold">₹{item.total_amount.toLocaleString('en-IN')}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => removePvItem(item.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Print Bill Modal - Sales */}
      {showPrint && currentBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">बिल छापा</h3>
              <Button variant="outline" onClick={() => setShowPrint(false)}>बंद करा</Button>
            </div>
            <BillPrint billData={currentBill} billItems={currentBill.items || currentBill.bill_items || billItems} isExistingBill={!!currentBill.id} />
          </div>
        </div>
      )}

      {/* Print Purchase Voucher Modal */}
      {showPvPrint && currentVoucher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">खरेदी पावती छापा</h3>
              <Button variant="outline" onClick={() => setShowPvPrint(false)}>बंद करा</Button>
            </div>
            <PurchaseVoucherPrint voucherData={currentVoucher} items={currentVoucherItems} />
          </div>
        </div>
      )}

      {/* Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Product</DialogTitle>
            <DialogDescription>Scan a barcode or enter a unique number to find and add a product</DialogDescription>
          </DialogHeader>
          <ProductScanner onScan={handleScanResult} />
        </DialogContent>
      </Dialog>
    </div>
  );
}