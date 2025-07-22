-- Adicionar campo de verificação aos salões
ALTER TABLE public.salons 
ADD COLUMN is_verified boolean DEFAULT false;