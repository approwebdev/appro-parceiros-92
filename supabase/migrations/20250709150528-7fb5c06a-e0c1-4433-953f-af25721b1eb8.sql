-- Adicionar campos para preço promocional e múltiplas imagens nos tratamentos
ALTER TABLE public.treatments 
ADD COLUMN promotional_price numeric DEFAULT NULL,
ADD COLUMN is_promotional boolean DEFAULT false;

-- Adicionar campo para plano no salões
ALTER TABLE public.salons 
ADD COLUMN plan_type text DEFAULT 'basico';

-- Criar tabela para categorias personalizadas
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  color text DEFAULT '#D4AF37',
  order_position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Política para admins gerenciarem categorias
CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Política para categorias serem visíveis publicamente
CREATE POLICY "Categories are publicly viewable"
ON public.categories
FOR SELECT
USING (is_active = true);

-- Trigger para atualizar updated_at em categories
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir algumas categorias padrão
INSERT INTO public.categories (name, description, color, order_position) VALUES
('treatment', 'Tratamentos', '#ff6b35', 1),
('transformation', 'Transformações', '#e8e8e8', 2),
('combos', 'Combos', '#89cff0', 3),
('home_care', 'Home Care', '#f4d03f', 4);