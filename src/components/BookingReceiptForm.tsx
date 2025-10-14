import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BookingReceiptFormProps {
  booking: {
    id: string;
    booking_type: string;
    booking_code: string;
    full_name: string;
  };
  existingReceipt?: {
    paid_amount: number;
    jewelry_name?: string;
    notes?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const BookingReceiptForm: React.FC<BookingReceiptFormProps> = ({
  booking,
  existingReceipt,
  open,
  onOpenChange,
  onSuccess
}) => {
  const { t } = useLanguage();
  const [paidAmount, setPaidAmount] = useState(existingReceipt?.paid_amount?.toString() || '0');
  const [jewelryName, setJewelryName] = useState(existingReceipt?.jewelry_name || '');
  const [notes, setNotes] = useState(existingReceipt?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isGoldJewellery = booking.booking_type === 'gold_jewellery';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const receiptData = {
        booking_id: booking.id,
        paid_amount: parseFloat(paidAmount) || 0,
        jewelry_name: isGoldJewellery ? jewelryName : null,
        notes: notes || null
      };

      if (existingReceipt) {
        // Update existing receipt
        const { error } = await supabase
          .from('booking_receipts')
          .update(receiptData)
          .eq('booking_id', booking.id);

        if (error) throw error;
        toast.success('Booking receipt updated successfully');
      } else {
        // Create new receipt
        const { error } = await supabase
          .from('booking_receipts')
          .insert([receiptData]);

        if (error) throw error;
        toast.success('Booking receipt created successfully');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving booking receipt:', error);
      toast.error('Failed to save booking receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingReceipt ? 'Edit' : 'Create'} Booking Receipt - {booking.booking_code}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer Name</Label>
            <Input
              id="customer"
              value={booking.full_name}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidAmount">Paid Amount *</Label>
            <Input
              id="paidAmount"
              type="number"
              step="0.01"
              min="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder="Enter paid amount"
              required
            />
          </div>

          {isGoldJewellery && (
            <div className="space-y-2">
              <Label htmlFor="jewelryName">Jewelry Name *</Label>
              <Input
                id="jewelryName"
                value={jewelryName}
                onChange={(e) => setJewelryName(e.target.value)}
                placeholder="Enter jewelry name"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : existingReceipt ? 'Update' : 'Create'} Receipt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
