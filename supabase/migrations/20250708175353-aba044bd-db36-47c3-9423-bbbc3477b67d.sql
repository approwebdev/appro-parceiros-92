-- Adicionar novos campos à tabela salons
ALTER TABLE public.salons 
ADD COLUMN plan text DEFAULT 'basico' CHECK (plan IN ('basico', 'verificado_azul', 'verificado_dourado')),
ADD COLUMN responsible_email text;