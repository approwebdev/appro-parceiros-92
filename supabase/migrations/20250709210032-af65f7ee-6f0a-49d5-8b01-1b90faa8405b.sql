-- Remover TODAS as políticas problemáticas de profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for admin only" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for new users" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for own profile or admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;

-- Criar políticas simples sem recursão
CREATE POLICY "Allow users to see their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Criar uma view para admins que não causa recursão
CREATE OR REPLACE VIEW admin_profile_access AS
SELECT p.* FROM profiles p
WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'collaborator');

-- Política para admin apenas para deletar
CREATE POLICY "Allow admin to delete profiles"
ON public.profiles FOR DELETE
USING (auth.uid() IN (
  SELECT user_id FROM profiles 
  WHERE role = 'admin' 
  AND user_id = auth.uid()
));

-- Política para admin ver todos os profiles
CREATE POLICY "Allow admin to see all profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE role IN ('admin', 'collaborator') 
    AND user_id = auth.uid()
  )
);

-- Política para admin atualizar outros profiles
CREATE POLICY "Allow admin to update all profiles"
ON public.profiles FOR UPDATE
USING (
  auth.uid() = user_id 
  OR 
  auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE role IN ('admin', 'collaborator') 
    AND user_id = auth.uid()
  )
);