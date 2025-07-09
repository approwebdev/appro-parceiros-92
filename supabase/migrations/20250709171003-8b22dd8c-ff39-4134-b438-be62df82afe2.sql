-- Substituir campo de cor por foto de capa nas categorias
ALTER TABLE public.categories 
DROP COLUMN color,
ADD COLUMN cover_image_url TEXT;