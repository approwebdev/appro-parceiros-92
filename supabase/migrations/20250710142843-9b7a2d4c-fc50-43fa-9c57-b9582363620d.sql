-- Adicionar campos para cidade, estado e CEP na tabela salons
ALTER TABLE public.salons 
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN postal_code TEXT;