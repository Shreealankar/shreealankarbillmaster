import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, BookOpen, TrendingUp, TrendingDown, Printer } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

interface CashEntry {
  id: string;
  entry_date: string;
  entry_type: string;
  category: string;
  description: string;
  reference_id: string | null;
  reference_type: string | null;
  cash_in: number;
  cash_out: number;
  payment_mode: string;
  notes: string | null;
  created_at: string;
}

export default function CashBook() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showForm, setShowForm] = useState(false);
  
  const [form, setForm] = useState({
    entry_type: 'cash_in',
    category: 'sale',
    description: '',
    cash_in: 0,
    cash_out: 0,
    payment_mode: 'cash',
    notes: '',
  });

  useEffect(() => {
    fetchEntries();
  }, [selectedDate]);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cash_book_entries')
      .select('*')
      .eq('entry_date', selectedDate)
      .order('created_at', { ascending: true });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.description) {
      toast({ title: "Error", description: "Please fill description", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('cash_book_entries').insert([{
      entry_date: selectedDate,
      entry_type: form.entry_type,
      category: form.category,
      description: form.description,
      cash_in: form.entry_type === 'cash_in' ? form.cash_in : 0,
      cash_out: form.entry_type === 'cash_out' ? form.cash_out : 0,
      payment_mode: form.payment_mode,
      notes: form.notes || null,
    }]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Entry Added", description: "Cash book entry added" });
      setShowForm(false);
      setForm({ entry_type: 'cash_in', category: 'sale', description: '', cash_in: 0, cash_out: 0, payment_mode: 'cash', notes: '' });
      fetchEntries();
    }
  };

  const totalCashIn = entries.reduce((sum, e) => sum + Number(e.cash_in), 0);
  const totalCashOut = entries.reduce((sum, e) => sum + Number(e.cash_out), 0);
  const netBalance = totalCashIn - totalCashOut;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  // Running balance calculation
  let runningBalance = 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cash Book (रोजचे खातेवही)</h1>
          <p className="text-muted-foreground">Daily cash inflow and outflow ledger</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Date & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Date</CardTitle></CardHeader>
          <CardContent>
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cash In (जमा)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totalCashIn)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cash Out (खर्च)</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-destructive">{formatCurrency(totalCashOut)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Net Balance (शिल्लक)</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {formatCurrency(netBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Cash Book - {format(new Date(selectedDate), 'dd MMMM yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No entries for this date</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right text-green-600">Cash In</TableHead>
                  <TableHead className="text-right text-destructive">Cash Out</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, index) => {
                  runningBalance += Number(entry.cash_in) - Number(entry.cash_out);
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{entry.category}</Badge></TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="capitalize">{entry.payment_mode}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {Number(entry.cash_in) > 0 ? formatCurrency(Number(entry.cash_in)) : '-'}
                      </TableCell>
                      <TableCell className="text-right text-destructive font-medium">
                        {Number(entry.cash_out) > 0 ? formatCurrency(Number(entry.cash_out)) : '-'}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${runningBalance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {formatCurrency(runningBalance)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={4} className="text-right">Total:</TableCell>
                  <TableCell className="text-right text-green-600">{formatCurrency(totalCashIn)}</TableCell>
                  <TableCell className="text-right text-destructive">{formatCurrency(totalCashOut)}</TableCell>
                  <TableCell className={`text-right ${netBalance >= 0 ? 'text-green-600' : 'text-destructive'}`}>{formatCurrency(netBalance)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Entry Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Cash Book Entry</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.entry_type} onValueChange={(v) => setForm({ ...form, entry_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash_in">Cash In (जमा)</SelectItem>
                  <SelectItem value="cash_out">Cash Out (खर्च)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Sale (विक्री)</SelectItem>
                  <SelectItem value="purchase">Purchase (खरेदी)</SelectItem>
                  <SelectItem value="expense">Expense (खर्च)</SelectItem>
                  <SelectItem value="scheme">Scheme Payment</SelectItem>
                  <SelectItem value="booking">Booking Advance</SelectItem>
                  <SelectItem value="borrowing">Borrowing</SelectItem>
                  <SelectItem value="repair">Repair Job</SelectItem>
                  <SelectItem value="other">Other (इतर)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g., Sale bill AL-2026-0012" />
            </div>
            <div className="space-y-2">
              <Label>{form.entry_type === 'cash_in' ? 'Amount In (₹)' : 'Amount Out (₹)'}</Label>
              <Input
                type="number"
                value={form.entry_type === 'cash_in' ? form.cash_in || '' : form.cash_out || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  if (form.entry_type === 'cash_in') setForm({ ...form, cash_in: val });
                  else setForm({ ...form, cash_out: val });
                }}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select value={form.payment_mode} onValueChange={(v) => setForm({ ...form, payment_mode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSubmit} className="w-full">Add Entry</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
