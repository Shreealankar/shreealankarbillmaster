import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Scheme {
  id: string;
  scheme_code: string;
  customer_id: string;
  scheme_name: string;
  total_amount: number;
  installment_amount: number;
  total_installments: number;
  paid_installments: number;
  start_date: string;
  end_date: string;
  status: string;
  bonus_percentage: number;
  notes: string;
  customers?: { name: string };
}

export default function Schemes() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [formData, setFormData] = useState<Partial<Scheme>>({
    status: "active",
  });
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    fetchSchemes();
    fetchCustomers();
  }, []);

  const fetchSchemes = async () => {
    const { data, error } = await supabase
      .from("schemes")
      .select("*, customers(name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch schemes");
      return;
    }
    setSchemes(data || []);
  };

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from("customers")
      .select("id, name, phone")
      .order("name", { ascending: true });
    setCustomers(data || []);
  };

  const generateSchemeCode = async () => {
    const { data } = await supabase.rpc("generate_scheme_code");
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_id || !formData.scheme_name || !formData.end_date || !formData.start_date) {
      toast.error("Please fill all required fields");
      return;
    }

    const schemeCode = await generateSchemeCode();
    const schemeData = {
      ...formData,
      scheme_code: schemeCode,
      end_date: formData.end_date,
      start_date: formData.start_date,
    };

    const { error } = await supabase.from("schemes").insert([schemeData as any]);

    if (error) {
      toast.error("Failed to create scheme");
      return;
    }

    toast.success("Scheme created successfully");
    setIsDialogOpen(false);
    setFormData({ status: "active" });
    fetchSchemes();
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheme) return;

    const amount = parseFloat(paymentAmount);
    const nextInstallment = selectedScheme.paid_installments + 1;

    const { error: paymentError } = await supabase.from("scheme_payments").insert([
      {
        scheme_id: selectedScheme.id,
        installment_number: nextInstallment,
        amount: amount,
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "cash",
      },
    ]);

    if (paymentError) {
      toast.error("Failed to record payment");
      return;
    }

    const newPaidInstallments = nextInstallment;
    const newStatus =
      newPaidInstallments >= selectedScheme.total_installments ? "completed" : "active";

    const { error: updateError } = await supabase
      .from("schemes")
      .update({
        paid_installments: newPaidInstallments,
        status: newStatus,
      })
      .eq("id", selectedScheme.id);

    if (updateError) {
      toast.error("Failed to update scheme");
      return;
    }

    toast.success("Payment recorded successfully");
    setIsPaymentDialogOpen(false);
    setSelectedScheme(null);
    setPaymentAmount("");
    fetchSchemes();
  };

  const filteredSchemes = schemes.filter(
    (scheme) =>
      scheme.scheme_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.customers?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Scheme Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ status: "active" })}>
              <Plus className="mr-2 h-4 w-4" />
              Create Scheme
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Scheme</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="customer_id">Customer *</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="scheme_name">Scheme Name *</Label>
                  <Input
                    id="scheme_name"
                    required
                    value={formData.scheme_name || ""}
                    onChange={(e) => setFormData({ ...formData, scheme_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_amount">Total Amount *</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    required
                    value={formData.total_amount || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, total_amount: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="installment_amount">Installment Amount *</Label>
                  <Input
                    id="installment_amount"
                    type="number"
                    required
                    value={formData.installment_amount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        installment_amount: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_installments">Total Installments *</Label>
                  <Input
                    id="total_installments"
                    type="number"
                    required
                    value={formData.total_installments || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_installments: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonus_percentage">Bonus % *</Label>
                  <Input
                    id="bonus_percentage"
                    type="number"
                    step="0.01"
                    required
                    value={formData.bonus_percentage || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bonus_percentage: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    required
                    value={formData.start_date || ""}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    required
                    value={formData.end_date || ""}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Scheme</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schemes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scheme Code</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Scheme Name</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchemes.map((scheme) => (
                <TableRow key={scheme.id}>
                  <TableCell className="font-medium">{scheme.scheme_code}</TableCell>
                  <TableCell>{scheme.customers?.name}</TableCell>
                  <TableCell>{scheme.scheme_name}</TableCell>
                  <TableCell>₹{scheme.total_amount.toLocaleString()}</TableCell>
                  <TableCell>
                    {scheme.paid_installments}/{scheme.total_installments}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        scheme.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : scheme.status === "active"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {scheme.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {scheme.status === "active" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedScheme(scheme);
                          setPaymentAmount(scheme.installment_amount.toString());
                          setIsPaymentDialogOpen(true);
                        }}
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Add Payment
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="space-y-2">
              <Label>Scheme</Label>
              <div className="text-sm text-muted-foreground">
                {selectedScheme?.scheme_code} - {selectedScheme?.customers?.name}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Installment Number</Label>
              <div className="text-sm">{(selectedScheme?.paid_installments || 0) + 1}</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_amount">Amount *</Label>
              <Input
                id="payment_amount"
                type="number"
                step="0.01"
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPaymentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Record Payment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}