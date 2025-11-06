import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { CalendarIcon, Download, TrendingUp, TrendingDown, Package, Users } from "lucide-react";
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
        acc[date].profit += Number(bill.final_amount) * 0.15; // Estimate
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

  const exportReport = (type: string) => {
    toast.success(`Exporting ${type} report...`);
    // Implement CSV/PDF export
  };

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
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="stock">Stock Valuation</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="rates">Rate Trends</TabsTrigger>
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
      </Tabs>
    </div>
  );
}