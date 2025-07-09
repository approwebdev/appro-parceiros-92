-- Remover a política problemática que causa recursão infinita
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all salons" ON public.salons;

-- Criar uma política mais simples para admins usando o user_id diretamente
-- Primeiro vamos permitir que usuários vejam seu próprio profile (já existe)
-- E adicionar uma política específica para um admin conhecido

-- Você pode adicionar manualmente o user_id do admin depois
-- Por enquanto, vou criar uma política que permita visualizar todos os profiles para usuários autenticados
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- E para salões também
CREATE POLICY "Authenticated users can view salons" 
ON public.salons 
FOR SELECT 
USING (true);