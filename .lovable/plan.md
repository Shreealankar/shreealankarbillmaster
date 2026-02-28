

# Fix RLS Policies for Schemes, Repair Jobs, and Activity Logs

## Problem
These three tables have Row-Level Security (RLS) policies that require `is_authenticated_staff()`, but your app uses simple password protection (not Supabase auth). This means all queries to these tables return empty results or fail silently.

Tables that work (bills, customers, products) have open policies allowing all operations. We need to match that pattern.

## What Each Tab Does (for your reference)
- **Schemes**: Manage customer gold savings schemes (monthly installments with bonus)
- **Repair Jobs**: Track jewelry repair work (polish, resize, fix) from customers
- **Activity Logs**: View history of all actions in the system

## Fix: Update RLS Policies via Migration

Create a new database migration to replace the restrictive policies with open ones (matching your existing working tables):

### Tables to fix:
1. **schemes** - Drop staff-only policy, add "Allow all operations" policy
2. **scheme_payments** - Same fix (needed for scheme payment recording)
3. **repair_jobs** - Drop staff-only policy, add "Allow all operations" policy
4. **activity_logs** - Drop staff-only SELECT policy and INSERT policy, add "Allow all operations" policy

### Technical Details

**Migration SQL** will:
- Drop existing restrictive RLS policies on `schemes`, `scheme_payments`, `repair_jobs`, `activity_logs`
- Create new permissive policies with `USING (true)` and `WITH CHECK (true)` for ALL operations
- Also need to create the missing RPC functions `generate_scheme_code` and `generate_job_number` if they don't exist (Schemes and Repair Jobs call these to auto-generate IDs)

### Files
- **New migration file** - SQL to update RLS policies and ensure RPC functions exist

No frontend code changes needed - the pages are already built correctly, they just can't access data due to security policies.
