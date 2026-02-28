import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { CalendarIcon, Download, TrendingUp, TrendingDown, Package, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface GSTR1Bill {
  bill_number: string;
  created_at: string;
  customer_name: string;
  customer_gstin: string | null;
  total_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  is_igst: boolean;
  final_amount: number;
  tax_amount: number;
}

interface MonthlyTax {
  month: string;
  cgst: number;
  sgst: number;
  igst: number;
  taxableValue: number;
  invoices: number;
}

export default function Reports() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [stockData, setStockData] = useState<any>({});
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [rateHistory, setRateHistory] = useState<any[]>([]);
  const [gstr1B2B, setGstr1B2B] = useState<GSTR1Bill[]>([]);
  const [gstr1B2C, setGstr1B2C] = useState<GSTR1Bill[]>([]);
  const [monthlyTax, setMonthlyTax] = useState<MonthlyTax[]>([]);
  const [purchaseVouchers, setPurchaseVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllReports();
  }, [dateRange]);

  const fetchAllReports = async () => {
    setLoading(true);
    await Promise.all([
      fetchSalesReport(),
      fetchStockValuation(),
      fetchCustomerAnalytics(),
      fetchTopProducts(),
      fetchRateHistory(),
      fetchGSTR1Report(),
      fetchPurchaseVouchers(),
    ]);
    setLoading(false);
  };

  const fetchSalesReport = async () => {
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())
      .order("created_at", { ascending: true });

    if (!error && data) {
      const dailySales = data.reduce((acc: any, bill: any) => {
        const date = format(new Date(bill.created_at), "MMM dd");
        if (!acc[date]) {
          acc[date] = { date, revenue: 0, profit: 0, bills: 0 };
        }
        acc[date].revenue += Number(bill.final_amount);
        acc[date].profit += Number(bill.final_amount) * 0.15;
        acc[date].bills += 1;
        return acc;
      }, {});
      setSalesData(Object.values(dailySales));
    }
  };

  const fetchStockValuation = async () => {
    const { data: products } = await supabase.from("products").select("*");
    const { data: rates } = await supabase.from("rates").select("*");

    if (products && rates) {
      const rateMap = rates.reduce((acc: any, r: any) => {
        acc[r.metal_type] = r.rate_per_gram;
        return acc;
      }, {});

      const valuation = products.reduce(
        (acc: any, p: any) => {
          const rate = rateMap[p.type] || 0;
          const value = Number(p.weight_grams) * rate * (p.stock_quantity || 0);
          acc.totalValue += value;
          acc.totalWeight += Number(p.weight_grams) * (p.stock_quantity || 0);
          acc.totalProducts += p.stock_quantity || 0;
          acc.byMetal[p.type] = (acc.byMetal[p.type] || 0) + value;
          return acc;
        },
        { totalValue: 0, totalWeight: 0, totalProducts: 0, byMetal: {} }
      );
      setStockData(valuation);
    }
  };

  const fetchCustomerAnalytics = async () => {
    const { data: customers } = await supabase.from("customers").select("*");
    const { data: bills } = await supabase
      .from("bills")
      .select("customer_id, final_amount")
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString());

    if (customers && bills) {
      const customerMap = bills.reduce((acc: any, bill: any) => {
        if (!acc[bill.customer_id]) {
          acc[bill.customer_id] = { total: 0, count: 0 };
        }
        acc[bill.customer_id].total += Number(bill.final_amount);
        acc[bill.customer_id].count += 1;
        return acc;
      }, {});

      const topCustomers = customers
        .map((c: any) => ({
          name: c.name,
          total: customerMap[c.id]?.total || 0,
          orders: customerMap[c.id]?.count || 0,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      setCustomerData(topCustomers);
    }
  };

  const fetchTopProducts = async () => {
    const { data } = await supabase
      .from("bill_items")
      .select("item_name, total_amount")
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString());

    if (data) {
      const productMap = data.reduce((acc: any, item: any) => {
        if (!acc[item.item_name]) {
          acc[item.item_name] = { name: item.item_name, sales: 0, count: 0 };
        }
        acc[item.item_name].sales += Number(item.total_amount);
        acc[item.item_name].count += 1;
        return acc;
      }, {});

      const topProducts = Object.values(productMap)
        .sort((a: any, b: any) => b.sales - a.sales)
        .slice(0, 10);

      setProductData(topProducts as any);
    }
  };

  const fetchRateHistory = async () => {
    const { data } = await supabase
      .from("rate_history")
      .select("*")
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())
      .order("created_at", { ascending: true });

    if (data) {
      const history = data.reduce((acc: any, rate: any) => {
        const date = format(new Date(rate.created_at), "MMM dd");
        if (!acc[date]) {
          acc[date] = { date };
        }
        acc[date][rate.metal_type] = Number(rate.rate_per_gram);
        return acc;
      }, {});
      setRateHistory(Object.values(history));
    }
  };

  const fetchGSTR1Report = async () => {
    const { data, error } = await supabase
      .from("bills")
      .select("bill_number, created_at, customer_name, customer_gstin, total_amount, cgst_amount, sgst_amount, igst_amount, is_igst, final_amount, tax_amount")
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())
      .order("created_at", { ascending: true });

    if (!error && data) {
      const b2b = data.filter((b) => b.customer_gstin && b.customer_gstin.trim() !== "");
      const b2c = data.filter((b) => !b.customer_gstin || b.customer_gstin.trim() === "");
      setGstr1B2B(b2b as GSTR1Bill[]);
      setGstr1B2C(b2c as GSTR1Bill[]);

      // Monthly breakup
      const monthly = data.reduce((acc: Record<string, MonthlyTax>, bill) => {
        const month = format(new Date(bill.created_at), "MMM yyyy");
        if (!acc[month]) {
          acc[month] = { month, cgst: 0, sgst: 0, igst: 0, taxableValue: 0, invoices: 0 };
        }
        acc[month].cgst += Number(bill.cgst_amount || 0);
        acc[month].sgst += Number(bill.sgst_amount || 0);
        acc[month].igst += Number(bill.igst_amount || 0);
        acc[month].taxableValue += Number(bill.total_amount || 0);
        acc[month].invoices += 1;
        return acc;
      }, {});
      setMonthlyTax(Object.values(monthly));
    }
  };

  const fetchPurchaseVouchers = async () => {
    const { data, error } = await supabase
      .from("purchase_vouchers")
      .select("*")
      .gte("voucher_date", dateRange.from.toISOString())
      .lte("voucher_date", dateRange.to.toISOString())
      .order("voucher_date", { ascending: false });
    if (!error && data) setPurchaseVouchers(data);
  };

  const exportReport = (type: string) => {
    toast.success(`Exporting ${type} report...`);
  };

  const exportGSTR1CSV = (section: "b2b" | "b2c") => {
    const data = section === "b2b" ? gstr1B2B : gstr1B2C;
    if (!data.length) {
      toast.error("No data to export");
      return;
    }

    const headers = section === "b2b"
      ? ["Invoice No", "Date", "Customer Name", "GSTIN", "Taxable Value", "CGST", "SGST", "IGST", "Total"]
      : ["Invoice No", "Date", "Customer Name", "Taxable Value", "CGST", "SGST", "Total"];

    const rows = data.map((b) => {
      const base = [
        b.bill_number,
        format(new Date(b.created_at), "dd/MM/yyyy"),
        b.customer_name,
      ];
      if (section === "b2b") {
        base.push(b.customer_gstin || "");
      }
      base.push(
        String(Number(b.total_amount || 0).toFixed(2)),
        String(Number(b.cgst_amount || 0).toFixed(2)),
        String(Number(b.sgst_amount || 0).toFixed(2)),
      );
      if (section === "b2b") {
        base.push(String(Number(b.igst_amount || 0).toFixed(2)));
      }
      base.push(String(Number(b.final_amount || 0).toFixed(2)));
      return base.join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GSTR1_${section.toUpperCase()}_${format(dateRange.from, "yyyyMMdd")}_${format(dateRange.to, "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`GSTR-1 ${section.toUpperCase()} exported successfully`);
  };

  const totalCGST = [...gstr1B2B, ...gstr1B2C].reduce((s, b) => s + Number(b.cgst_amount || 0), 0);
  const totalSGST = [...gstr1B2B, ...gstr1B2C].reduce((s, b) => s + Number(b.sgst_amount || 0), 0);
  const totalIGST = [...gstr1B2B, ...gstr1B2C].reduce((s, b) => s + Number(b.igst_amount || 0), 0);
  const totalTaxableValue = [...gstr1B2B, ...gstr1B2C].reduce((s, b) => s + Number(b.total_amount || 0), 0);

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading reports...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range: any) => range && setDateRange(range)}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={fetchAllReports}>Refresh</Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="stock">Stock Valuation</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="rates">Rate Trends</TabsTrigger>
          <TabsTrigger value="gstr1">GSTR-1</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{salesData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimated Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{salesData.reduce((sum, d) => sum + d.profit, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {salesData.reduce((sum, d) => sum + d.bills, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Daily Sales Trend</CardTitle>
                <Button size="sm" variant="outline" onClick={() => exportReport("sales")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="Revenue" />
                  <Bar dataKey="profit" fill="hsl(var(--chart-2))" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stockData.totalValue?.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Weight</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stockData.totalWeight?.toFixed(2)}g</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stockData.totalProducts}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stock Value by Metal Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(stockData.byMetal || {}).map(([name, value]) => ({
                      name,
                      value,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ₹${entry.value.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.keys(stockData.byMetal || {}).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Top Customers by Purchase Value</CardTitle>
                <Button size="sm" variant="outline" onClick={() => exportReport("customers")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={customerData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="total" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Top Selling Products</CardTitle>
                <Button size="sm" variant="outline" onClick={() => exportReport("products")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={productData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates">
          <Card>
            <CardHeader>
              <CardTitle>Metal Rate Fluctuation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={rateHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="gold" stroke="hsl(var(--chart-1))" name="Gold" />
                  <Line type="monotone" dataKey="silver" stroke="hsl(var(--chart-2))" name="Silver" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gstr1" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxable Value</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalTaxableValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total CGST</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalCGST.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total SGST</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalSGST.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total IGST</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalIGST.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>B2B Invoices (Section 4A)</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Invoices with customer GSTIN — {gstr1B2B.length} invoice(s)
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => exportGSTR1CSV("b2b")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {gstr1B2B.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No B2B invoices in selected period</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice No</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>GSTIN</TableHead>
                        <TableHead className="text-right">Taxable Value</TableHead>
                        <TableHead className="text-right">CGST</TableHead>
                        <TableHead className="text-right">SGST</TableHead>
                        <TableHead className="text-right">IGST</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gstr1B2B.map((bill) => (
                        <TableRow key={bill.bill_number}>
                          <TableCell className="font-medium">{bill.bill_number}</TableCell>
                          <TableCell>{format(new Date(bill.created_at), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{bill.customer_name}</TableCell>
                          <TableCell className="font-mono text-xs">{bill.customer_gstin}</TableCell>
                          <TableCell className="text-right">₹{Number(bill.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">₹{Number(bill.cgst_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">₹{Number(bill.sgst_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">₹{Number(bill.igst_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right font-bold">₹{Number(bill.final_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={4}>Total</TableCell>
                        <TableCell className="text-right">₹{gstr1B2B.reduce((s, b) => s + Number(b.total_amount || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">₹{gstr1B2B.reduce((s, b) => s + Number(b.cgst_amount || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">₹{gstr1B2B.reduce((s, b) => s + Number(b.sgst_amount || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">₹{gstr1B2B.reduce((s, b) => s + Number(b.igst_amount || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">₹{gstr1B2B.reduce((s, b) => s + Number(b.final_amount || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>B2C Invoices (Section 7)</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Invoices without customer GSTIN — {gstr1B2C.length} invoice(s)
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => exportGSTR1CSV("b2c")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {gstr1B2C.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No B2C invoices in selected period</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice No</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Taxable Value</TableHead>
                        <TableHead className="text-right">CGST</TableHead>
                        <TableHead className="text-right">SGST</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gstr1B2C.map((bill) => (
                        <TableRow key={bill.bill_number}>
                          <TableCell className="font-medium">{bill.bill_number}</TableCell>
                          <TableCell>{format(new Date(bill.created_at), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{bill.customer_name}</TableCell>
                          <TableCell className="text-right">₹{Number(bill.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">₹{Number(bill.cgst_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">₹{Number(bill.sgst_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right font-bold">₹{Number(bill.final_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">₹{gstr1B2C.reduce((s, b) => s + Number(b.total_amount || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">₹{gstr1B2C.reduce((s, b) => s + Number(b.cgst_amount || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">₹{gstr1B2C.reduce((s, b) => s + Number(b.sgst_amount || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">₹{gstr1B2C.reduce((s, b) => s + Number(b.final_amount || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Tax Breakup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTax}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} />
                  <Legend />
                  <Bar dataKey="cgst" fill="hsl(var(--chart-1))" name="CGST" />
                  <Bar dataKey="sgst" fill="hsl(var(--chart-2))" name="SGST" />
                  <Bar dataKey="igst" fill="hsl(var(--chart-3))" name="IGST" />
                </BarChart>
              </ResponsiveContainer>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Invoices</TableHead>
                    <TableHead className="text-right">Taxable Value</TableHead>
                    <TableHead className="text-right">CGST</TableHead>
                    <TableHead className="text-right">SGST</TableHead>
                    <TableHead className="text-right">IGST</TableHead>
                    <TableHead className="text-right">Total Tax</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyTax.map((m) => (
                    <TableRow key={m.month}>
                      <TableCell className="font-medium">{m.month}</TableCell>
                      <TableCell className="text-right">{m.invoices}</TableCell>
                      <TableCell className="text-right">₹{m.taxableValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">₹{m.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">₹{m.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">₹{m.igst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right font-bold">₹{(m.cgst + m.sgst + m.igst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
