-- Adicionar política RLS para admins gerenciarem salon_treatments
CREATE POLICY "Admins can manage all salon treatments" 
ON public.salon_treatments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = ANY(ARRAY['admin', 'collaborator'])
));