import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreditCard, Phone, Calendar, AlertCircle, IndianRupee, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Borrowing {
  id: string;
  customer_name: string;
  customer_phone: string;
  borrowed_amount: number;
  paid_amount: number;
  balance_amount: number;
  borrowed_date: string;
  due_date: string;
  interest_rate: number;
  status: string;
  notes: string;
}

const Borrowings = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('borrowings')
        .select('*')
        .gt('balance_amount', 0) // Only show customers with pending amounts
        .order('borrowed_date', { ascending: false });

      if (error) throw error;
      setBorrowings(data || []);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch borrowings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date();
    
    if (isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'paid':
        return <Badge variant="secondary">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalPending = borrowings.reduce((sum, b) => sum + b.balance_amount, 0);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading borrowings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('borrowings')}</h1>
          <p className="text-muted-foreground">Customers with pending payments</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-red-600">
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
          <p className="text-sm text-muted-foreground">Total Pending</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{borrowings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Borrowed</p>
                <p className="text-2xl font-bold">
                  ₹{borrowings.reduce((sum, b) => sum + b.borrowed_amount, 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue Count</p>
                <p className="text-2xl font-bold text-red-600">
                  {borrowings.filter(b => new Date(b.due_date) < new Date()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Borrowings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pending Borrowings ({borrowings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {borrowings.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No pending borrowings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Borrowed Amount</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Borrowed Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {borrowings.map((borrowing) => (
                    <TableRow key={borrowing.id} className={new Date(borrowing.due_date) < new Date() ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">{borrowing.customer_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {borrowing.customer_phone}
                        </div>
                      </TableCell>
                      <TableCell>₹{borrowing.borrowed_amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>₹{borrowing.paid_amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="font-bold text-red-600">
                        ₹{borrowing.balance_amount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(borrowing.borrowed_date).toLocaleDateString('en-IN')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(borrowing.due_date).toLocaleDateString('en-IN')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(borrowing.status, borrowing.due_date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Borrowings;