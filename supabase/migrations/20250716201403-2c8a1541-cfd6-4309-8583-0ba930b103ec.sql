-- CRITICAL SECURITY FIX: Replace dangerous RLS policies on profiles table
-- The current "Simple user access" policy allows unrestricted access to all profiles

-- Remove the dangerous policy that allows unlimited access
DROP POLICY IF EXISTS "Simple user access" ON public.profiles;

-- Create secure, restrictive policies
-- 1. Users can only view and edit their own profile
CREATE POLICY "Users can manage own profile" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Admins can view all profiles (read-only)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- 3. Only allow role changes by admins (separate policy for role updates)
CREATE POLICY "Admins can update user roles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- 4. Secure admin management function to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.admin_update_user_profile(
  target_user_id UUID,
  new_name TEXT DEFAULT NULL,
  new_email TEXT DEFAULT NULL,
  new_role TEXT DEFAULT NULL,
  new_phone TEXT DEFAULT NULL,
  new_instagram TEXT DEFAULT NULL,
  new_address TEXT DEFAULT NULL,
  new_address_number TEXT DEFAULT NULL,
  new_address_complement TEXT DEFAULT NULL,
  new_postal_code TEXT DEFAULT NULL,
  new_has_salon BOOLEAN DEFAULT NULL,
  new_wants_salon BOOLEAN DEFAULT NULL,
  new_status TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Verify the current user is an admin
  SELECT role INTO current_user_role
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Prevent admins from removing their own admin role (to prevent lockout)
  IF target_user_id = auth.uid() AND new_role IS NOT NULL AND new_role != 'admin' THEN
    RAISE EXCEPTION 'Cannot remove your own admin privileges';
  END IF;
  
  -- Update only provided fields
  UPDATE public.profiles 
  SET 
    name = COALESCE(new_name, name),
    email = COALESCE(new_email, email),
    role = COALESCE(new_role, role),
    phone = COALESCE(new_phone, phone),
    instagram = COALESCE(new_instagram, instagram),
    address = COALESCE(new_address, address),
    address_number = COALESCE(new_address_number, address_number),
    address_complement = COALESCE(new_address_complement, address_complement),
    postal_code = COALESCE(new_postal_code, postal_code),
    has_salon = COALESCE(new_has_salon, has_salon),
    wants_salon = COALESCE(new_wants_salon, wants_salon),
    status = COALESCE(new_status, status),
    updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN FOUND;
END;
$$;