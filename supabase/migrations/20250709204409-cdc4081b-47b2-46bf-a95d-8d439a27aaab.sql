-- Corrigir políticas RLS para permitir que admins gerenciem salões
-- Remover políticas existentes conflitantes e criar novas

-- Políticas para salons
DROP POLICY IF EXISTS "Salon owners can manage their salon" ON public.salons;
DROP POLICY IF EXISTS "Authenticated users can view salons" ON public.salons;

-- Permitir que admins/colaboradores vejam e gerenciem todos os salões
CREATE POLICY "Admins can manage all salons" 
ON public.salons 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('admin', 'collaborator')
  )
);

-- Permitir que donos de salão gerenciem apenas seu próprio salão
CREATE POLICY "Salon owners can manage their own salon" 
ON public.salons 
FOR ALL 
USING (auth.uid() = user_id);

-- Permitir visualização pública de salões ativos
CREATE POLICY "Salons are publicly viewable" 
ON public.salons 
FOR SELECT 
USING (is_active = true);

-- Políticas para profiles - permitir que admins vejam e gerenciem todos os perfis
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('admin', 'collaborator')
  )
);

-- Permitir que usuários vejam e editem apenas seu próprio perfil
CREATE POLICY "Users can view and edit own profile" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = user_id);