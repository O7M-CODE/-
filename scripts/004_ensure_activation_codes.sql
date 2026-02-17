-- Ensure activation_codes table exists
CREATE TABLE IF NOT EXISTS public.activation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  used_at timestamp with time zone
);

-- Ensure RLS is enabled
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS "admins_read_codes" ON public.activation_codes;
DROP POLICY IF EXISTS "admins_insert_codes" ON public.activation_codes;
DROP POLICY IF EXISTS "admins_update_codes" ON public.activation_codes;
DROP POLICY IF EXISTS "admins_delete_codes" ON public.activation_codes;
DROP POLICY IF EXISTS "anyone_read_unused_codes" ON public.activation_codes;
DROP POLICY IF EXISTS "anyone_update_unused_codes" ON public.activation_codes;

-- Admins full CRUD
CREATE POLICY "admins_read_codes" ON public.activation_codes
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admins_insert_codes" ON public.activation_codes
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "admins_update_codes" ON public.activation_codes
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "admins_delete_codes" ON public.activation_codes
  FOR DELETE USING (public.is_admin());

-- Allow anyone to read unused codes (for activation during signup)
CREATE POLICY "anyone_read_unused_codes" ON public.activation_codes
  FOR SELECT USING (is_used = false);

-- Allow anyone to update unused codes (for marking as used during signup)
CREATE POLICY "anyone_update_unused_codes" ON public.activation_codes
  FOR UPDATE USING (is_used = false);
