import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Phone, Mail, MapPin, Search, Plus, Edit, Trash2, Receipt, ArrowLeft, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BillPrint } from '@/components/BillPrint';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  created_at: string;
}

interface CustomerBill {
  id: string;
  bill_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_email?: string;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  final_amount: number;
  discount_percentage: number;
  discount_amount: number;
  tax_percentage: number;
  tax_amount: number;
  payment_method: string;
  notes: string;
  total_weight: number;
  created_at: string;
  bill_items: any[];
}

const Customers = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerBills, setCustomerBills] = useState<CustomerBill[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [showPrintBill, setShowPrintBill] = useState<CustomerBill | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerBills = async (customerName: string) => {
    try {
      setLoadingBills(true);
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          bill_items(*)
        `)
        .eq('customer_name', customerName)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomerBills(data || []);
    } catch (error) {
      console.error('Error fetching customer bills:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customer bills",
        variant: "destructive",
      });
    } finally {
      setLoadingBills(false);
    }
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    fetchCustomerBills(customer.name);
  };

  const handleBackToCustomers = () => {
    setSelectedCustomer(null);
    setCustomerBills([]);
    setShowPrintBill(null);
  };

  const handleViewBill = (bill: CustomerBill) => {
    setShowPrintBill(bill);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading customers...</p>
      </div>
    );
  }

  // Show bill print view
  if (showPrintBill) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Button variant="outline" onClick={() => setShowPrintBill(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bills
          </Button>
        </div>
        <BillPrint 
          billData={showPrintBill}
          billItems={showPrintBill.bill_items || []}
          isExistingBill={true}
        />
      </div>
    );
  }

  // Show customer bills view
  if (selectedCustomer) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBackToCustomers}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{selectedCustomer.name}</h1>
              <p className="text-muted-foreground">{selectedCustomer.phone}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Total Bills: {customerBills.length}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Bills for {selectedCustomer.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBills ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading bills...</p>
              </div>
            ) : customerBills.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No bills found for this customer</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Paid Amount</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.bill_number}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(bill.created_at).toLocaleDateString('en-IN')}
                          </div>
                        </TableCell>
                        <TableCell>₹{bill.final_amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>₹{bill.paid_amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell className={bill.balance_amount > 0 ? 'font-bold text-red-600' : 'text-green-600'}>
                          ₹{bill.balance_amount.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewBill(bill)}
                          >
                            View Bill
                          </Button>
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
  }

  // Show customers list
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('customers')}</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Total: {customers.length}
        </Badge>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer List ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No customers found matching your search' : 'No customers found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Added Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow 
                      key={customer.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleCustomerClick(customer)}
                    >
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {customer.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {customer.email}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.address ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="max-w-xs truncate">{customer.address}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(customer.created_at).toLocaleDateString('en-IN')}
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

export default Customers;