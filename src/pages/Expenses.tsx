import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Wallet, TrendingDown, Search, Calendar } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

const EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'Rent (भाडे)' },
  { value: 'electricity', label: 'Electricity (वीज)' },
  { value: 'wages', label: 'Wages (मजुरी)' },
  { value: 'polishing', label: 'Polishing (पॉलिशिंग)' },
  { value: 'transport', label: 'Transport (वाहतूक)' },
  { value: 'packaging', label: 'Packaging (पॅकेजिंग)' },
  { value: 'repair', label: 'Repair & Maintenance' },
  { value: 'telephone', label: 'Telephone / Internet' },
  { value: 'misc', label: 'Miscellaneous (इतर)' },
];

interface Expense {
  id: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  receipt_number: string | null;
  notes: string | null;
  created_at: string;
}

export default function Expenses() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));
  
  const [form, setForm] = useState({
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    category: 'misc',
    description: '',
    amount: 0,
    payment_method: 'cash',
    receipt_number: '',
    notes: '',
  });

  useEffect(() => {
    fetchExpenses();
  }, [filterMonth]);

  const fetchExpenses = async () => {
    setLoading(true);
    const startDate = `${filterMonth}-01`;
    const endDate = new Date(parseInt(filterMonth.split('-')[0]), parseInt(filterMonth.split('-')[1]), 0);
    
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('expense_date', startDate)
      .lte('expense_date', format(endDate, 'yyyy-MM-dd'))
      .order('expense_date', { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setExpenses(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.description || !form.amount) {
      toast({ title: "Error", description: "Please fill description and amount", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('expenses').insert([{
      ...form,
      receipt_number: form.receipt_number || null,
      notes: form.notes || null,
    }]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "खर्च जोडला", description: "Expense added successfully" });
      setShowForm(false);
      setForm({ expense_date: format(new Date(), 'yyyy-MM-dd'), category: 'misc', description: '', amount: 0, payment_method: 'cash', receipt_number: '', notes: '' });
      fetchExpenses();
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {} as Record<string, number>);

  const filteredExpenses = expenses.filter(e =>
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expense Tracker (खर्च व्यवस्थापन)</h1>
          <p className="text-muted-foreground">Track all shop expenses</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Expense
        </Button>
      </div>

      {/* Month Filter + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Month</CardTitle>
          </CardHeader>
          <CardContent>
            <Input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(categoryTotals).length > 0 ? (
              <div>
                <div className="text-lg font-bold capitalize">
                  {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0]}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[1] || 0)}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Category Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                <div key={cat} className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm capitalize font-medium">{EXPENSE_CATEGORIES.find(c => c.value === cat)?.label || cat}</div>
                  <div className="text-lg font-bold">{formatCurrency(amount)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search expenses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader><CardTitle>Expenses List</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No expenses found for this month</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(new Date(expense.expense_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className="capitalize">{expense.payment_method}</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">{formatCurrency(Number(expense.amount))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New Expense</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g., Monthly rent payment" />
            </div>
            <div className="space-y-2">
              <Label>Amount (₹) *</Label>
              <Input type="number" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Receipt Number (Optional)</Label>
              <Input value={form.receipt_number} onChange={(e) => setForm({ ...form, receipt_number: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <Button onClick={handleSubmit} className="w-full">Add Expense</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
