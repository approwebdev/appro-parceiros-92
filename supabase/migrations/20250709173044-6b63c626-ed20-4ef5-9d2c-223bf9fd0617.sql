-- Remover políticas que impedem a alteração do tipo da coluna role
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage banners" ON public.salon_banners;
DROP POLICY IF EXISTS "Admins can manage treatments" ON public.treatments;

-- Agora alterar o tipo da coluna role
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE text;

-- Recriar as políticas com suporte para colaboradores
CREATE POLICY "Admins and collaborators can manage categories" 
ON public.categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role IN ('admin', 'collaborator')
));

CREATE POLICY "Admins and collaborators can manage banners" 
ON public.salon_banners 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role IN ('admin', 'collaborator')
));

CREATE POLICY "Admins and collaborators can manage treatments" 
ON public.treatments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role IN ('admin', 'collaborator')
));