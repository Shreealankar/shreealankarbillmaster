import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown } from "lucide-react";
import { format } from 'date-fns';

interface Rate {
  id: string;
  metal_type: string;
  rate_per_gram: number;
  updated_at: string;
}

const Index = () => {
  const [rates, setRates] = useState<Rate[]>([]);

  useEffect(() => {
    const fetchRates = async () => {
      const { data } = await supabase
        .from('rates')
        .select('*');
      
      setRates(data || []);
    };

    fetchRates();

    // Subscribe to rate changes
    const subscription = supabase
      .channel('rates_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rates' }, 
        fetchRates
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const goldRate = rates.find(r => r.metal_type === 'gold');
  const silverRate = rates.find(r => r.metal_type === 'silver');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-gray-600 bg-clip-text text-transparent">
            Jewelry Store
          </h1>
          <p className="text-2xl text-muted-foreground font-medium">Today's Precious Metal Rates</p>
          <p className="text-sm text-muted-foreground mt-2">Updated in real-time</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Gold Rate Card */}
          <Card className="border-4 border-yellow-400 shadow-2xl hover:shadow-yellow-200 transition-all duration-300 bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-3xl">
                <span className="text-5xl">💰</span>
                <span className="bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                  Gold Rate
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goldRate ? (
                <div className="space-y-4">
                  <div className="bg-yellow-100 rounded-xl p-6 border-2 border-yellow-300">
                    <div className="text-6xl font-bold text-yellow-700 mb-2">
                      ₹{(goldRate.rate_per_gram * 10).toFixed(2)}
                    </div>
                    <p className="text-lg font-semibold text-yellow-600">per 10 grams</p>
                  </div>
                  <div className="flex items-center justify-between text-sm bg-yellow-50 p-3 rounded-lg">
                    <span className="text-muted-foreground">Per gram:</span>
                    <span className="font-bold text-yellow-700">₹{goldRate.rate_per_gram.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Last updated: {format(new Date(goldRate.updated_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Rate not available</p>
              )}
            </CardContent>
          </Card>

          {/* Silver Rate Card */}
          <Card className="border-4 border-gray-400 shadow-2xl hover:shadow-gray-300 transition-all duration-300 bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-3xl">
                <span className="text-5xl">⚪</span>
                <span className="bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                  Silver Rate
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {silverRate ? (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-xl p-6 border-2 border-gray-300">
                    <div className="text-6xl font-bold text-gray-700 mb-2">
                      ₹{(silverRate.rate_per_gram * 10).toFixed(2)}
                    </div>
                    <p className="text-lg font-semibold text-gray-600">per 10 grams</p>
                  </div>
                  <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg">
                    <span className="text-muted-foreground">Per gram:</span>
                    <span className="font-bold text-gray-700">₹{silverRate.rate_per_gram.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Last updated: {format(new Date(silverRate.updated_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Rate not available</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 p-6 bg-muted/50 rounded-lg max-w-3xl mx-auto">
          <p className="text-base text-muted-foreground">
            📞 Rates are updated regularly throughout the day. For bulk orders or custom jewelry, please contact us for special pricing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
