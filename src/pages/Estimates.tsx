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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, FileText, Printer, Share, Eye, ArrowLeft, Search } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { useLanguage } from "@/contexts/LanguageContext";

interface EstimateItem {
  id: string;
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

export default function Estimates() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [estimates, setEstimates] = useState<any[]>([]);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rates, setRates] = useState<any[]>([]);

  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', email: '', gstin: '' });
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [newItem, setNewItem] = useState({
    item_name: '', metal_type: 'gold', purity: '22k', weight_grams: 0, rate_per_gram: 0,
    making_charges: 0, stone_charges: 0, other_charges: 0
  });
  const [discount_percentage, setDiscountPercentage] = useState(0);
  const [tax_percentage, setTaxPercentage] = useState(3);
  const [notes, setNotes] = useState('');

  useEffect(() => { fetchEstimates(); fetchRates(); }, []);

  const fetchEstimates = async () => {
    setLoading(true);
    const { data } = await supabase.from('estimates').select('*').order('created_at', { ascending: false });
    setEstimates(data || []);
    setLoading(false);
  };

  const fetchRates = async () => {
    const { data } = await supabase.from('rates').select('*');
    if (data) setRates(data);
  };

  const getCurrentRate = (metalType: string) => {
    const rate = rates.find(r => r.metal_type === metalType);
    return rate ? Number(rate.rate_per_gram) : 0;
  };

  const addItem = () => {
    if (!newItem.item_name || !newItem.weight_grams || !newItem.rate_per_gram) {
      toast({ title: "Error", description: "Fill item name, weight, and rate", variant: "destructive" });
      return;
    }
    const baseAmount = newItem.weight_grams * newItem.rate_per_gram;
    const total_amount = baseAmount + newItem.making_charges + newItem.stone_charges + newItem.other_charges;
    const item: EstimateItem = { id: `temp_${Date.now()}`, ...newItem, total_amount };
    setItems([...items, item]);
    setNewItem({ item_name: '', metal_type: 'gold', purity: '22k', weight_grams: 0, rate_per_gram: 0, making_charges: 0, stone_charges: 0, other_charges: 0 });
  };

  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const total_amount = items.reduce((sum, i) => sum + i.total_amount, 0);
  const discount_amount = (total_amount * discount_percentage) / 100;
  const taxable = total_amount - discount_amount;
  const tax_amount = (taxable * tax_percentage) / 100;
  const final_amount = taxable + tax_amount;
  const total_weight = items.reduce((sum, i) => sum + i.weight_grams, 0);

  const saveEstimate = async () => {
    if (!customer.name || !customer.phone || items.length === 0) {
      toast({ title: "Error", description: "Fill customer details and add items", variant: "destructive" });
      return;
    }

    try {
      const { data: estNum } = await supabase.rpc('generate_estimate_number');
      const estimateData = {
        estimate_number: estNum || `EST-${Date.now()}`,
        customer_name: customer.name, customer_phone: customer.phone,
        customer_address: customer.address, customer_email: customer.email,
        customer_gstin: customer.gstin || null,
        total_weight, total_amount, discount_percentage, discount_amount,
        tax_percentage, tax_amount, cgst_amount: tax_amount / 2, sgst_amount: tax_amount / 2,
        final_amount, notes: notes || null, status: 'draft',
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

      const { data: saved, error } = await supabase.from('estimates').insert(estimateData).select().single();
      if (error) throw error;

      const itemsData = items.map(({ id, ...item }) => ({ estimate_id: saved.id, ...item }));
      await supabase.from('estimate_items').insert(itemsData);

      toast({ title: "अंदाजपत्रक तयार", description: `Estimate ${saved.estimate_number} created` });
      setView('list');
      resetForm();
      fetchEstimates();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setCustomer({ name: '', phone: '', address: '', email: '', gstin: '' });
    setItems([]);
    setDiscountPercentage(0);
    setTaxPercentage(3);
    setNotes('');
  };

  const viewEstimate = async (estimate: any) => {
    const { data: estItems } = await supabase.from('estimate_items').select('*').eq('estimate_id', estimate.id);
    setSelectedEstimate(estimate);
    setSelectedItems(estItems || []);
    setView('detail');
  };

  const handleConvertToBill = (estimate: any) => {
    // Store estimate data in session and redirect to billing
    sessionStorage.setItem('estimateData', JSON.stringify({
      customerName: estimate.customer_name,
      customerPhone: estimate.customer_phone,
      customerAddress: estimate.customer_address,
      customerEmail: estimate.customer_email,
      items: selectedItems,
    }));
    window.location.href = '/billing';
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const filteredEstimates = estimates.filter(e =>
    e.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.estimate_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Detail View
  if (view === 'detail' && selectedEstimate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setView('list')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <h1 className="text-2xl font-bold">Estimate: {selectedEstimate.estimate_number}</h1>
          <Badge className={selectedEstimate.status === 'converted' ? 'bg-green-500' : selectedEstimate.status === 'expired' ? 'bg-red-500' : 'bg-blue-500'}>
            {selectedEstimate.status}
          </Badge>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="font-semibold">{selectedEstimate.customer_name}</p>
                <p className="text-sm text-muted-foreground">{selectedEstimate.customer_phone}</p>
                <p className="text-sm text-muted-foreground">{selectedEstimate.customer_address}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Date: {format(new Date(selectedEstimate.created_at), 'dd/MM/yyyy')}</p>
                {selectedEstimate.valid_until && <p className="text-sm">Valid Until: {format(new Date(selectedEstimate.valid_until), 'dd/MM/yyyy')}</p>}
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Type/Purity</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Rate/g</TableHead>
                  <TableHead>Making</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedItems.map((item, i) => (
                  <TableRow key={item.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{item.item_name}</TableCell>
                    <TableCell>{item.metal_type}/{item.purity}</TableCell>
                    <TableCell>{item.weight_grams}g</TableCell>
                    <TableCell>₹{Number(item.rate_per_gram).toLocaleString()}</TableCell>
                    <TableCell>₹{Number(item.making_charges).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">₹{Number(item.total_amount).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 text-right space-y-1">
              <p>Subtotal: {formatCurrency(Number(selectedEstimate.total_amount))}</p>
              {Number(selectedEstimate.discount_amount) > 0 && <p className="text-green-600">Discount: -{formatCurrency(Number(selectedEstimate.discount_amount))}</p>}
              <p>Tax ({selectedEstimate.tax_percentage}%): {formatCurrency(Number(selectedEstimate.tax_amount))}</p>
              <p className="text-xl font-bold">Total: {formatCurrency(Number(selectedEstimate.final_amount))}</p>
            </div>

            <div className="flex gap-2 mt-6">
              {selectedEstimate.status !== 'converted' && (
                <Button onClick={() => handleConvertToBill(selectedEstimate)} className="bg-green-600 hover:bg-green-700">
                  Convert to Bill
                </Button>
              )}
              <Button variant="outline" onClick={() => {
                const msg = `📋 Estimate: ${selectedEstimate.estimate_number}\n👤 ${selectedEstimate.customer_name}\n💰 Total: ₹${Number(selectedEstimate.final_amount).toLocaleString()}\n📅 Valid Until: ${selectedEstimate.valid_until}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
              }}>
                <Share className="h-4 w-4 mr-2" /> WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create View
  if (view === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setView('list')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <h1 className="text-2xl font-bold">Create Estimate (अंदाजपत्रक)</h1>
        </div>

        {/* Customer Details */}
        <Card>
          <CardHeader><CardTitle>Customer Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Name *</Label><Input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} /></div>
              <div><Label>Phone *</Label><Input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} /></div>
              <div className="md:col-span-2"><Label>Address</Label><Input value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} /></div>
              <div><Label>GSTIN</Label><Input value={customer.gstin} onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })} /></div>
            </div>
          </CardContent>
        </Card>

        {/* Add Items */}
        <Card>
          <CardHeader><CardTitle>Add Items</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div><Label>Item Name *</Label><Input value={newItem.item_name} onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })} /></div>
              <div>
                <Label>Metal</Label>
                <Select value={newItem.metal_type} onValueChange={(v) => setNewItem({ ...newItem, metal_type: v, rate_per_gram: getCurrentRate(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="gold">Gold</SelectItem><SelectItem value="silver">Silver</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>Purity</Label>
                <Select value={newItem.purity} onValueChange={(v) => setNewItem({ ...newItem, purity: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="24K">24K</SelectItem><SelectItem value="22k">22K</SelectItem><SelectItem value="18K">18K</SelectItem><SelectItem value="925">925 Silver</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Weight (g) *</Label><Input type="number" step="0.01" value={newItem.weight_grams || ''} onChange={(e) => setNewItem({ ...newItem, weight_grams: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>Rate/g *</Label><Input type="number" value={newItem.rate_per_gram || ''} onChange={(e) => setNewItem({ ...newItem, rate_per_gram: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>Making ₹</Label><Input type="number" value={newItem.making_charges || ''} onChange={(e) => setNewItem({ ...newItem, making_charges: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>Stone ₹</Label><Input type="number" value={newItem.stone_charges || ''} onChange={(e) => setNewItem({ ...newItem, stone_charges: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>Other ₹</Label><Input type="number" value={newItem.other_charges || ''} onChange={(e) => setNewItem({ ...newItem, other_charges: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <Button onClick={addItem}><Plus className="h-4 w-4 mr-2" /> Add Item</Button>

            {items.length > 0 && (
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead><TableHead>Weight</TableHead><TableHead>Rate</TableHead><TableHead>Making</TableHead><TableHead className="text-right">Total</TableHead><TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.item_name} ({item.metal_type}/{item.purity})</TableCell>
                      <TableCell>{item.weight_grams}g</TableCell>
                      <TableCell>₹{item.rate_per_gram.toLocaleString()}</TableCell>
                      <TableCell>₹{item.making_charges.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold">₹{item.total_amount.toLocaleString()}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        {items.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div><Label>Discount %</Label><Input type="number" value={discount_percentage || ''} onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)} /></div>
                <div><Label>Tax %</Label><Input type="number" value={tax_percentage || ''} onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
              <Separator className="my-4" />
              <div className="text-right space-y-1">
                <p>Subtotal: {formatCurrency(total_amount)}</p>
                {discount_amount > 0 && <p className="text-green-600">Discount ({discount_percentage}%): -{formatCurrency(discount_amount)}</p>}
                <p>Tax ({tax_percentage}%): {formatCurrency(tax_amount)}</p>
                <p className="text-2xl font-bold">Estimate Total: {formatCurrency(final_amount)}</p>
              </div>
              <Button onClick={saveEstimate} className="w-full mt-4" size="lg">Save Estimate</Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Estimates (अंदाजपत्रक)</h1>
          <p className="text-muted-foreground">Create and manage quotations</p>
        </div>
        <Button onClick={() => setView('create')}><Plus className="h-4 w-4 mr-2" /> New Estimate</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search estimates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardHeader><CardTitle>All Estimates</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>
          ) : filteredEstimates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No estimates found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estimate #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstimates.map((est) => (
                  <TableRow key={est.id}>
                    <TableCell className="font-mono font-semibold">{est.estimate_number}</TableCell>
                    <TableCell>{est.customer_name}</TableCell>
                    <TableCell>{format(new Date(est.created_at), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(Number(est.final_amount))}</TableCell>
                    <TableCell>
                      <Badge className={est.status === 'converted' ? 'bg-green-500' : est.status === 'expired' ? 'bg-red-500' : 'bg-blue-500'}>
                        {est.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => viewEstimate(est)}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
