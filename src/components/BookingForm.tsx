import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const bookingFormSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  primary_mobile: z.string().min(10, 'Invalid mobile number').max(10, 'Invalid mobile number'),
  secondary_mobile: z.string().optional(),
  full_address: z.string().min(1, 'Address is required'),
  booking_type: z.string().min(1, 'Booking type is required'),
  gold_weight: z.string().min(1, 'Gold weight is required'),
  terms_accepted: z.boolean().default(true),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ open, onOpenChange, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      primary_mobile: '',
      secondary_mobile: '',
      full_address: '',
      booking_type: '',
      gold_weight: '',
      terms_accepted: true,
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase.from('bookings').insert([
        {
          full_name: data.full_name,
          email: data.email,
          primary_mobile: data.primary_mobile,
          secondary_mobile: data.secondary_mobile || null,
          full_address: data.full_address,
          booking_type: data.booking_type,
          gold_weight: parseFloat(data.gold_weight),
          terms_accepted: data.terms_accepted,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Booking created successfully',
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to create booking',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Booking</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="primary_mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Mobile</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mobile number" maxLength={10} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondary_mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Mobile (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mobile number" maxLength={10} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="full_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter full address" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="booking_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="24_carat_gold">24 Carat Gold</SelectItem>
                        <SelectItem value="22_carat_gold_normal">22 Carat Gold Normal</SelectItem>
                        <SelectItem value="gold_jewelry">Gold Jewelry</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gold_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gold Weight (grams)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Enter weight" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Booking
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
