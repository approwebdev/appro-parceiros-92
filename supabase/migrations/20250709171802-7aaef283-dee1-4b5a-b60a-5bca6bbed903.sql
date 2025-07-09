-- Permitir que admins vejam todos os salões
CREATE POLICY "Admins can view all salons" 
ON public.salons 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role = 'admin'
));