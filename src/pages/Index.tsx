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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Jewelry Store</h1>
          <p className="text-xl text-muted-foreground">Today's Precious Metal Rates</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Gold Rate Card */}
          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span className="text-yellow-600">💰</span>
                Gold Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goldRate ? (
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-yellow-700">
                    ₹{goldRate.rate_per_gram.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">per gram</p>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {format(new Date(goldRate.updated_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Rate not available</p>
              )}
            </CardContent>
          </Card>

          {/* Silver Rate Card */}
          <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span className="text-gray-600">⚪</span>
                Silver Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {silverRate ? (
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-gray-700">
                    ₹{silverRate.rate_per_gram.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">per gram</p>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {format(new Date(silverRate.updated_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Rate not available</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Rates are updated regularly. Please contact us for the most current pricing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
