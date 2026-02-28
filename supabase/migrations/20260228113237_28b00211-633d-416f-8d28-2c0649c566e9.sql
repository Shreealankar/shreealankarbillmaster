
-- Fix schemes RLS
DROP POLICY IF EXISTS "Staff can manage schemes" ON public.schemes;
CREATE POLICY "Allow all operations on schemes" ON public.schemes FOR ALL USING (true) WITH CHECK (true);

-- Fix scheme_payments RLS
DROP POLICY IF EXISTS "Staff can manage scheme payments" ON public.scheme_payments;
CREATE POLICY "Allow all operations on scheme_payments" ON public.scheme_payments FOR ALL USING (true) WITH CHECK (true);

-- Fix repair_jobs RLS
DROP POLICY IF EXISTS "Staff can manage repair jobs" ON public.repair_jobs;
CREATE POLICY "Allow all operations on repair_jobs" ON public.repair_jobs FOR ALL USING (true) WITH CHECK (true);

-- Fix activity_logs RLS
DROP POLICY IF EXISTS "Staff can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;
CREATE POLICY "Allow all operations on activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
