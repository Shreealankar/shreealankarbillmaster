import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Receipt, 
  AlertCircle,
  Calendar,
  IndianRupee,
  Eye,
  ShoppingBag
} from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

interface DashboardStats {
  dailyTurnover: number;
  monthlyTurnover: number;
  yearlyTurnover: number;
  totalCustomers: number;
  pendingBorrowings: number;
  recentBills: any[];
  dailyPurchases: number;
  monthlyPurchases: number;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    dailyTurnover: 0,
    monthlyTurnover: 0,
    yearlyTurnover: 0,
    totalCustomers: 0,
    pendingBorrowings: 0,
    recentBills: [],
    dailyPurchases: 0,
    monthlyPurchases: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      // Daily turnover
      const { data: dailyBills } = await supabase
        .from('bills')
        .select('final_amount')
        .gte('created_at', startOfDay.toISOString());

      // Monthly turnover
      const { data: monthlyBills } = await supabase
        .from('bills')
        .select('final_amount')
        .gte('created_at', startOfMonth.toISOString());

      // Yearly turnover
      const { data: yearlyBills } = await supabase
        .from('bills')
        .select('final_amount')
        .gte('created_at', startOfYear.toISOString());

      // Total customers
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Pending borrowings
      const { count: borrowingCount } = await supabase
        .from('borrowings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Recent bills
      const { data: recentBills } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Purchase vouchers - daily
      const { data: dailyPurchases } = await supabase
        .from('purchase_vouchers')
        .select('total_amount')
        .gte('created_at', startOfDay.toISOString());

      // Purchase vouchers - monthly
      const { data: monthlyPurchases } = await supabase
        .from('purchase_vouchers')
        .select('total_amount')
        .gte('created_at', startOfMonth.toISOString());

      setStats({
        dailyTurnover: dailyBills?.reduce((sum, bill) => sum + Number(bill.final_amount), 0) || 0,
        monthlyTurnover: monthlyBills?.reduce((sum, bill) => sum + Number(bill.final_amount), 0) || 0,
        yearlyTurnover: yearlyBills?.reduce((sum, bill) => sum + Number(bill.final_amount), 0) || 0,
        totalCustomers: customerCount || 0,
        pendingBorrowings: borrowingCount || 0,
        recentBills: recentBills || [],
        dailyPurchases: dailyPurchases?.reduce((sum, v) => sum + Number(v.total_amount), 0) || 0,
        monthlyPurchases: monthlyPurchases?.reduce((sum, v) => sum + Number(v.total_amount), 0) || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: t('daily.turnover'),
      value: formatCurrency(stats.dailyTurnover),
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: t('monthly.turnover'),
      value: formatCurrency(stats.monthlyTurnover),
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: t('yearly.turnover'),
      value: formatCurrency(stats.yearlyTurnover),
      icon: IndianRupee,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: t('total.customers'),
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'दैनिक खरेदी (Purchases)',
      value: formatCurrency(stats.dailyPurchases),
      icon: ShoppingBag,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'मासिक खरेदी (Purchases)',
      value: formatCurrency(stats.monthlyPurchases),
      icon: ShoppingBag,
      color: 'text-amber-600',
      bgColor: 'bg-amber-600/10'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            {t('dashboard')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome to your jewelry billing system
          </p>
        </div>
        <Button onClick={fetchDashboardStats} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-border hover:shadow-gold transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bills and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bills */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              {t('recent.bills')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentBills.length > 0 ? (
              <div className="space-y-3">
                {stats.recentBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{bill.bill_number}</div>
                      <div className="text-sm text-muted-foreground">{bill.customer_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(bill.created_at), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">
                        {formatCurrency(Number(bill.final_amount))}
                      </div>
                      {Number(bill.balance_amount) > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          Pending: {formatCurrency(Number(bill.balance_amount))}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent bills found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Borrowings Alert */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {t('pending.borrowings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-destructive mb-2">
                {stats.pendingBorrowings}
              </div>
              <p className="text-muted-foreground mb-4">
                Active borrowings require attention
              </p>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}