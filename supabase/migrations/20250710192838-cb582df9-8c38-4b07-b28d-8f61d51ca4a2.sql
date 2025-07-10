-- Criar política para permitir que usuários recém-criados insiram suas próprias solicitações de acesso
CREATE POLICY "Users can create their own access requests"
ON public.access_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Remover a política existente que está muito restritiva
DROP POLICY IF EXISTS "Users can view their own access requests" ON public.access_requests;