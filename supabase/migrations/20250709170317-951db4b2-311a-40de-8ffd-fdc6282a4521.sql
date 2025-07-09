-- Adicionar campos necessários para suportar usuários com e sem salão
ALTER TABLE public.profiles 
ADD COLUMN has_salon BOOLEAN DEFAULT false,
ADD COLUMN phone TEXT,
ADD COLUMN instagram TEXT,
ADD COLUMN wants_salon BOOLEAN DEFAULT false,
ADD COLUMN address TEXT,
ADD COLUMN address_number TEXT,
ADD COLUMN address_complement TEXT,
ADD COLUMN postal_code TEXT;