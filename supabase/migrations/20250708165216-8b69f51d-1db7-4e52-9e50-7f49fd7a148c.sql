-- Adicionar campos faltantes na tabela treatments
ALTER TABLE public.treatments 
ADD COLUMN button_color TEXT DEFAULT '#D4AF37';

-- Adicionar campo de foto na tabela salons
ALTER TABLE public.salons 
ADD COLUMN photo_url TEXT;

-- Criar tabela para banners da página de salões
CREATE TABLE public.salon_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS para salon_banners
ALTER TABLE public.salon_banners ENABLE ROW LEVEL SECURITY;

-- Políticas para salon_banners
CREATE POLICY "Banners are publicly viewable" 
ON public.salon_banners 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage banners" 
ON public.salon_banners 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Atualizar políticas de treatments para permitir admin gerenciar
CREATE POLICY "Admins can manage treatments" 
ON public.treatments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Trigger para atualizar timestamps
CREATE TRIGGER update_salon_banners_updated_at
BEFORE UPDATE ON public.salon_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns dados de exemplo
INSERT INTO public.treatments (name, description, subtitle, category, base_price, button_color) VALUES 
('Corte Masculino', 'Corte moderno e estiloso para homens', 'Estilo e personalidade', 'Corte', 35.00, '#D4AF37'),
('Coloração', 'Coloração profissional com produtos de qualidade', 'Transforme seu visual', 'Cor', 80.00, '#8B4513'),
('Hidratação Capilar', 'Tratamento intensivo para cabelos ressecados', 'Nutrição e brilho', 'Tratamento', 45.00, '#228B22');

INSERT INTO public.salon_banners (title, image_url, order_position) VALUES 
('Transforme seu visual', '/lovable-uploads/63155ad2-ae8d-41f6-8e01-774a09edeb0a.png', 1);