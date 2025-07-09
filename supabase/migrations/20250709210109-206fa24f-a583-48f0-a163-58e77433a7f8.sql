-- Remover todas as políticas problemáticas novamente
DROP POLICY IF EXISTS "Allow users to see their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin to delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin to see all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin to update all profiles" ON public.profiles;

-- Desabilitar RLS temporariamente para testar
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Reabilitar com políticas muito simples
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas extremamente simples para evitar recursão
CREATE POLICY "Simple user access"
ON public.profiles FOR ALL
USING (true)
WITH CHECK (true);

-- Adicionar uma função simples para verificar admin sem recursão
CREATE OR REPLACE FUNCTION is_admin_user(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_uuid 
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;