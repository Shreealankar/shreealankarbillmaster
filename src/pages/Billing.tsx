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
import { 
  Plus, 
  Trash2, 
  Save, 
  Search,
  Calculator,
  Receipt,
  Printer
} from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BillPrint } from "@/components/BillPrint";

interface BillItem {
  id: string; // Frontend temporary ID
  item_name: string;
  metal_type: string;
  purity: string;
  weight_grams: number;
  rate_per_gram: number;
  making_charges: number;
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
    email: ''
  });
  
  const [newItem, setNewItem] = useState({
    item_name: '',
    metal_type: 'gold',
    purity: '22k',
    weight_grams: 0,
    rate_per_gram: 0,
    making_charges: 0,
    stone_charges: 0,
    other_charges: 0
  });

  const [billing, setBilling] = useState({
    total_amount: 0,
    discount_percentage: 0,
    discount_amount: 0,
    tax_percentage: 3,
    tax_amount: 0,
    final_amount: 0,
    paid_amount: 0,
    balance_amount: 0,
    payment_method: 'cash',
    notes: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchRates();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [billItems, billing.discount_percentage, billing.tax_percentage, billing.paid_amount]);

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
    const final_amount = taxable_amount + tax_amount;
    const balance_amount = final_amount - billing.paid_amount;

    setBilling(prev => ({
      ...prev,
      total_amount,
      discount_amount,
      tax_amount,
      final_amount,
      balance_amount
    }));
  };

  const saveBill = async () => {
    if (!customer.name || !customer.phone || billItems.length === 0) {
      toast({
        title: "Error",
        description: "Please fill customer details and add at least one item",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Save or get customer
      let customerId = null;
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', customer.phone)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer } = await supabase
          .from('customers')
          .insert([customer])
          .select('id')
          .single();
        customerId = newCustomer?.id;
      }

      // Save bill
      const billData = {
        bill_number: '', // Will be auto-generated by trigger
        customer_id: customerId,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        total_weight: billItems.reduce((sum, item) => sum + item.weight_grams, 0),
        ...billing
      };

      const { data: savedBill, error: billError } = await supabase
        .from('bills')
        .insert(billData)
        .select()
        .single();

      if (billError) throw billError;

      // Save bill items (exclude frontend temp ID)
      const itemsData = billItems.map(item => {
        const { id, ...itemWithoutId } = item; // Remove frontend temp ID
        return {
          bill_id: savedBill.id,
          ...itemWithoutId
        };
      });

      const { error: itemsError } = await supabase
        .from('bill_items')
        .insert(itemsData);

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: `Bill ${savedBill.bill_number} saved successfully`,
      });

      // Reset form
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCustomer({ name: '', phone: '', address: '', email: '' });
    setBillItems([]);
    setBilling({
      total_amount: 0,
      discount_percentage: 0,
      discount_amount: 0,
      tax_percentage: 3,
      tax_amount: 0,
      final_amount: 0,
      paid_amount: 0,
      balance_amount: 0,
      payment_method: 'cash',
      notes: ''
    });
  };

  const selectCustomer = (selectedCustomer: Customer) => {
    setCustomer({
      name: selectedCustomer.name,
      phone: selectedCustomer.phone,
      address: selectedCustomer.address || '',
      email: selectedCustomer.email || ''
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            {t('billing')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('create.new.bill')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={resetForm} variant="outline">
            Reset
          </Button>
          <Button onClick={saveBill} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {t('save.bill')}
          </Button>
        </div>
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
              <Label>{t('item.name')} *</Label>
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
                  onChange={(e) => setNewItem({...newItem, weight_grams: Number(e.target.value)})}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('rate.per.gram')} *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newItem.rate_per_gram || ''}
                  onChange={(e) => setNewItem({...newItem, rate_per_gram: Number(e.target.value)})}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('making.charges')}</Label>
              <Input
                type="number"
                step="0.01"
                value={newItem.making_charges || ''}
                onChange={(e) => setNewItem({...newItem, making_charges: Number(e.target.value)})}
                placeholder="0.00"
              />
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
                  <Label className="text-xs">Tax %</Label>
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
                  <Label className="text-xs">Amount</Label>
                  <div className="h-8 px-3 py-1 text-sm bg-muted rounded-md flex items-center">
                    ₹{billing.tax_amount.toLocaleString('en-IN')}
                  </div>
                </div>
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
    </div>
  );
}