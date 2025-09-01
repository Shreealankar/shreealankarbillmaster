-- Create trigger to auto-generate bill numbers
CREATE TRIGGER trigger_auto_generate_bill_number
  BEFORE INSERT ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_bill_number();