-- Corrigir recursão infinita nas políticas RLS
-- Primeiro, remover políticas problemáticas
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.profiles;

-- Criar função de segurança para evitar recursão
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'salon');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Criar função para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_current_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recriar políticas sem recursão
CREATE POLICY "Users can manage own profile" ON public.profiles
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.is_current_user_admin());

CREATE POLICY "Admins can update user roles" ON public.profiles
FOR UPDATE USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());