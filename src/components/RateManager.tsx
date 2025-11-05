import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, Lock, Unlock } from "lucide-react";
import { format } from 'date-fns';

interface Rate {
  id: string;
  metal_type: string;
  rate_per_gram: number;
  is_locked: boolean;
  updated_at: string;
}

interface RateHistory {
  id: string;
  metal_type: string;
  rate_per_gram: number;
  created_at: string;
}

export const RateManager: React.FC = () => {
  const { toast } = useToast();
  const [rates, setRates] = useState<Rate[]>([]);
  const [goldHistory, setGoldHistory] = useState<RateHistory[]>([]);
  const [silverHistory, setSilverHistory] = useState<RateHistory[]>([]);
  const [goldRate, setGoldRate] = useState('');
  const [silverRate, setSilverRate] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRates = async () => {
    try {
      const { data, error } = await supabase
        .from('rates')
        .select('*');

      if (error) throw error;
      setRates(data || []);

      const gold = data?.find(r => r.metal_type === 'gold');
      const silver = data?.find(r => r.metal_type === 'silver');
      
      // Convert from per gram to per 10 grams for display
      setGoldRate(gold?.rate_per_gram ? (gold.rate_per_gram * 10).toString() : '');
      setSilverRate(silver?.rate_per_gram ? (silver.rate_per_gram * 10).toString() : '');
    } catch (error) {
      console.error('Error fetching rates:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: goldData } = await supabase
        .from('rate_history')
        .select('*')
        .eq('metal_type', 'gold')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(7);

      const { data: silverData } = await supabase
        .from('rate_history')
        .select('*')
        .eq('metal_type', 'silver')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(7);

      setGoldHistory(goldData || []);
      setSilverHistory(silverData || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    fetchRates();
    fetchHistory();
  }, []);

  const updateRate = async (metalType: 'gold' | 'silver', rate: string) => {
    if (!rate || parseFloat(rate) <= 0) {
      toast({
        title: "Invalid Rate",
        description: "Please enter a valid rate",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First check if rate exists
      const { data: existingRate } = await supabase
        .from('rates')
        .select('*')
        .eq('metal_type', metalType)
        .maybeSingle();

      // Convert from per 10 grams to per gram for storage
      const ratePerGram = parseFloat(rate) / 10;

      if (existingRate) {
        // Update existing rate
        const { error } = await supabase
          .from('rates')
          .update({
            rate_per_gram: ratePerGram,
            updated_at: new Date().toISOString(),
          })
          .eq('metal_type', metalType);

        if (error) throw error;
      } else {
        // Insert new rate
        const { error } = await supabase
          .from('rates')
          .insert({
            metal_type: metalType,
            rate_per_gram: ratePerGram,
          });

        if (error) throw error;
      }

      toast({
        title: "Rate Updated",
        description: `${metalType.charAt(0).toUpperCase() + metalType.slice(1)} rate updated successfully`,
      });

      fetchRates();
      fetchHistory();
    } catch (error: any) {
      console.error('Error updating rate:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update rate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLock = async (metalType: string, currentLockStatus: boolean) => {
    try {
      const { error } = await supabase.rpc('update_rate_lock_status', {
        p_metal_type: metalType,
        p_is_locked: !currentLockStatus
      });

      if (error) throw error;

      toast({
        title: currentLockStatus ? "Rate Unlocked" : "Rate Locked",
        description: `${metalType.charAt(0).toUpperCase() + metalType.slice(1)} rate ${currentLockStatus ? 'unlocked' : 'locked'}`,
      });

      fetchRates();
    } catch (error) {
      console.error('Error toggling lock:', error);
      toast({
        title: "Error",
        description: "Failed to update lock status",
        variant: "destructive",
      });
    }
  };

  const getRateChange = (history: RateHistory[]) => {
    if (history.length < 2) return null;
    const latest = history[0].rate_per_gram;
    const previous = history[1].rate_per_gram;
    const change = latest - previous;
    const percentChange = ((change / previous) * 100).toFixed(2);
    return { change, percentChange, isPositive: change > 0 };
  };

  const goldRateObj = rates.find(r => r.metal_type === 'gold');
  const silverRateObj = rates.find(r => r.metal_type === 'silver');
  const goldChange = getRateChange(goldHistory);
  const silverChange = getRateChange(silverHistory);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gold Rate Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Gold Rate</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => goldRateObj && toggleLock(goldRateObj.metal_type, goldRateObj.is_locked)}
              >
                {goldRateObj?.is_locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </Button>
            </CardTitle>
            <CardDescription>Update gold rate per gram</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goldRate">Rate per 10 Grams (₹)</Label>
              <Input
                id="goldRate"
                type="number"
                step="0.01"
                value={goldRate}
                onChange={(e) => setGoldRate(e.target.value)}
                placeholder="Enter gold rate for 10g"
                disabled={goldRateObj?.is_locked}
              />
            </div>
            <Button 
              onClick={() => updateRate('gold', goldRate)} 
              disabled={loading || goldRateObj?.is_locked}
              className="w-full"
            >
              Update Gold Rate
            </Button>
            
            {goldChange && (
              <div className={`flex items-center gap-2 text-sm ${goldChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {goldChange.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{goldChange.isPositive ? '+' : ''}{goldChange.change.toFixed(2)} ({goldChange.percentChange}%)</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Silver Rate Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Silver Rate</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => silverRateObj && toggleLock(silverRateObj.metal_type, silverRateObj.is_locked)}
              >
                {silverRateObj?.is_locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </Button>
            </CardTitle>
            <CardDescription>Update silver rate per gram</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="silverRate">Rate per 10 Grams (₹)</Label>
              <Input
                id="silverRate"
                type="number"
                step="0.01"
                value={silverRate}
                onChange={(e) => setSilverRate(e.target.value)}
                placeholder="Enter silver rate for 10g"
                disabled={silverRateObj?.is_locked}
              />
            </div>
            <Button 
              onClick={() => updateRate('silver', silverRate)} 
              disabled={loading || silverRateObj?.is_locked}
              className="w-full"
            >
              Update Silver Rate
            </Button>
            
            {silverChange && (
              <div className={`flex items-center gap-2 text-sm ${silverChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {silverChange.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{silverChange.isPositive ? '+' : ''}{silverChange.change.toFixed(2)} ({silverChange.percentChange}%)</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rate History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gold History */}
        <Card>
          <CardHeader>
            <CardTitle>Gold Rate History (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {goldHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history available</p>
              ) : (
                goldHistory.map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(entry.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                    <span className="font-medium">₹{entry.rate_per_gram.toFixed(2)}/g</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Silver History */}
        <Card>
          <CardHeader>
            <CardTitle>Silver Rate History (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {silverHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history available</p>
              ) : (
                silverHistory.map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(entry.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                    <span className="font-medium">₹{entry.rate_per_gram.toFixed(2)}/g</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
