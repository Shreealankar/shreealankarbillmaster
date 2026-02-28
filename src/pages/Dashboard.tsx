import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Users, Receipt, AlertCircle, Calendar, IndianRupee, Eye, ShoppingBag,
  Gift, Heart, MessageCircle,
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

interface CustomerReminder {
  id: string;
  name: string;
  phone: string;
  type: 'birthday' | 'anniversary';
  date: string;
  daysUntil: number;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    dailyTurnover: 0, monthlyTurnover: 0, yearlyTurnover: 0,
    totalCustomers: 0, pendingBorrowings: 0, recentBills: [],
    dailyPurchases: 0, monthlyPurchases: 0,
  });
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<CustomerReminder[]>([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchBirthdayReminders();
  }, []);

  const fetchBirthdayReminders = async () => {
    try {
      const { data: customers } = await supabase
        .from('customers')
        .select('id, name, phone, date_of_birth, anniversary_date');
      if (!customers) return;

      const today = new Date();
      const reminderList: CustomerReminder[] = [];

      customers.forEach((c: any) => {
        if (c.date_of_birth) {
          const dob = new Date(c.date_of_birth);
          const thisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
          if (thisYear < today) thisYear.setFullYear(today.getFullYear() + 1);
          const daysUntil = Math.ceil((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntil <= 7) reminderList.push({ id: c.id, name: c.name, phone: c.phone, type: 'birthday', date: c.date_of_birth, daysUntil });
        }
        if (c.anniversary_date) {
          const ann = new Date(c.anniversary_date);
          const thisYear = new Date(today.getFullYear(), ann.getMonth(), ann.getDate());
          if (thisYear < today) thisYear.setFullYear(today.getFullYear() + 1);
          const daysUntil = Math.ceil((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntil <= 7) reminderList.push({ id: c.id, name: c.name, phone: c.phone, type: 'anniversary', date: c.anniversary_date, daysUntil });
        }
      });

      reminderList.sort((a, b) => a.daysUntil - b.daysUntil);
      setReminders(reminderList);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      const { data: dailyBills } = await supabase.from('bills').select('final_amount').gte('created_at', startOfDay.toISOString());
      const { data: monthlyBills } = await supabase.from('bills').select('final_amount').gte('created_at', startOfMonth.toISOString());
      const { data: yearlyBills } = await supabase.from('bills').select('final_amount').gte('created_at', startOfYear.toISOString());
      const { count: customerCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
      const { count: borrowingCount } = await supabase.from('borrowings').select('*', { count: 'exact', head: true }).eq('status', 'active');
      const { data: recentBills } = await supabase.from('bills').select('*').order('created_at', { ascending: false }).limit(5);
      const { data: dailyPurchases } = await supabase.from('purchase_vouchers').select('total_amount').gte('created_at', startOfDay.toISOString());
      const { data: monthlyPurchases } = await supabase.from('purchase_vouchers').select('total_amount').gte('created_at', startOfMonth.toISOString());

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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const sendWhatsAppWish = (customer: CustomerReminder) => {
    const message = customer.type === 'birthday'
      ? `🎂 Happy Birthday ${customer.name}! 🎉\n\nWishing you a wonderful day!\n\nFrom Shree Alankar Jewellers 💎`
      : `💍 Happy Anniversary ${customer.name}! 🎊\n\nWishing you a beautiful celebration!\n\nFrom Shree Alankar Jewellers 💎`;
    window.open(`https://wa.me/91${customer.phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const statCards = [
    { title: t('daily.turnover'), value: formatCurrency(stats.dailyTurnover), icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { title: t('monthly.turnover'), value: formatCurrency(stats.monthlyTurnover), icon: Calendar, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { title: t('yearly.turnover'), value: formatCurrency(stats.yearlyTurnover), icon: IndianRupee, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: t('total.customers'), value: stats.totalCustomers.toString(), icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { title: 'दैनिक खरेदी (Purchases)', value: formatCurrency(stats.dailyPurchases), icon: ShoppingBag, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    { title: 'मासिक खरेदी (Purchases)', value: formatCurrency(stats.monthlyPurchases), icon: ShoppingBag, color: 'text-amber-600', bgColor: 'bg-amber-600/10' },
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
          <h1 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">{t('dashboard')}</h1>
          <p className="text-muted-foreground mt-1">Welcome to your jewelry billing system</p>
        </div>
        <Button onClick={() => { fetchDashboardStats(); fetchBirthdayReminders(); }} variant="outline">Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-border hover:shadow-gold transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}><stat.icon className={`h-4 w-4 ${stat.color}`} /></div>
            </CardHeader>
            <CardContent><div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div></CardContent>
          </Card>
        ))}
      </div>

      {/* Birthday/Anniversary Reminders */}
      {reminders.length > 0 && (
        <Card className="border-l-4 border-l-pink-500 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-pink-500" />
              Birthday & Anniversary Reminders (शुभेच्छा)
              <Badge variant="secondary">{reminders.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reminders.map((reminder, i) => (
                <div key={`${reminder.id}-${reminder.type}-${i}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {reminder.type === 'birthday' ? <Gift className="h-5 w-5 text-pink-500" /> : <Heart className="h-5 w-5 text-red-500" />}
                    <div>
                      <p className="font-medium">{reminder.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {reminder.type === 'birthday' ? '🎂 Birthday' : '💍 Anniversary'} •{' '}
                        {reminder.daysUntil === 0 ? <span className="text-green-600 font-bold">Today!</span>
                          : reminder.daysUntil === 1 ? <span className="text-orange-500 font-bold">Tomorrow</span>
                          : <span>In {reminder.daysUntil} days</span>}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => sendWhatsAppWish(reminder)} className="border-green-500 text-green-600">
                    <MessageCircle className="h-4 w-4 mr-1" /> Wish
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" />{t('recent.bills')}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentBills.length > 0 ? (
              <div className="space-y-3">
                {stats.recentBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{bill.bill_number}</div>
                      <div className="text-sm text-muted-foreground">{bill.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(bill.created_at), 'dd/MM/yyyy HH:mm')}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">{formatCurrency(Number(bill.final_amount))}</div>
                      {Number(bill.balance_amount) > 0 && <Badge variant="destructive" className="text-xs">Pending: {formatCurrency(Number(bill.balance_amount))}</Badge>}
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

        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-destructive" />{t('pending.borrowings')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-destructive mb-2">{stats.pendingBorrowings}</div>
              <p className="text-muted-foreground mb-4">Active borrowings require attention</p>
              <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" />View All</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
