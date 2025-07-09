-- Corrigir as políticas RLS com recursão infinita
-- Remover todas as políticas existentes problemáticas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin and collaborator can manage all profiles" ON public.profiles;

-- Criar políticas simples e funcionais para profiles
CREATE POLICY "Enable read access for authenticated users" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role IN ('admin', 'collaborator')
));

CREATE POLICY "Enable insert for new users" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own profile or admin" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role IN ('admin', 'collaborator')
));

CREATE POLICY "Enable delete for admin only" 
ON public.profiles FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role = 'admin'
));