-- Criar tabela de salões
CREATE TABLE public.salons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de tratamentos/serviços
CREATE TABLE public.treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2),
  duration_minutes INTEGER,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de relacionamento salão-tratamentos (com preços personalizados)
CREATE TABLE public.salon_treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  treatment_id UUID NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
  custom_price DECIMAL(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(salon_id, treatment_id)
);

-- Habilitar Row Level Security
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_treatments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para visualização pública (cardápios são públicos)
CREATE POLICY "Salons are publicly viewable" 
ON public.salons 
FOR SELECT 
USING (true);

CREATE POLICY "Treatments are publicly viewable" 
ON public.treatments 
FOR SELECT 
USING (true);

CREATE POLICY "Salon treatments are publicly viewable" 
ON public.salon_treatments 
FOR SELECT 
USING (true);

-- Função para atualizar timestamps automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps
CREATE TRIGGER update_salons_updated_at
  BEFORE UPDATE ON public.salons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treatments_updated_at
  BEFORE UPDATE ON public.treatments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salon_treatments_updated_at
  BEFORE UPDATE ON public.salon_treatments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns dados de exemplo
INSERT INTO public.treatments (name, description, base_price, duration_minutes, category) VALUES
('Corte Feminino', 'Corte e finalização para cabelos femininos', 80.00, 60, 'Cabelo'),
('Corte Masculino', 'Corte tradicional ou moderno para homens', 50.00, 45, 'Cabelo'),
('Escova', 'Escova modeladora com finalização', 60.00, 45, 'Cabelo'),
('Hidratação', 'Tratamento hidratante para cabelos ressecados', 90.00, 60, 'Tratamento'),
('Coloração', 'Aplicação de cor permanente ou semipermanente', 150.00, 120, 'Coloração'),
('Luzes', 'Mechas ou reflexos para clarear o cabelo', 200.00, 180, 'Coloração'),
('Manicure', 'Cuidados e esmaltação das unhas das mãos', 35.00, 45, 'Unhas'),
('Pedicure', 'Cuidados e esmaltação das unhas dos pés', 40.00, 60, 'Unhas'),
('Unha de Gel', 'Alongamento ou fortalecimento com gel', 80.00, 90, 'Unhas'),
('Limpeza de Pele', 'Limpeza profunda facial', 120.00, 75, 'Estética');

-- Inserir um salão de exemplo
INSERT INTO public.salons (name, slug, description) VALUES
('Salão Belle Époque', 'belle-epoque', 'Salão de beleza completo com serviços de cabelo, unhas e estética facial');

-- Associar alguns tratamentos ao salão de exemplo
INSERT INTO public.salon_treatments (salon_id, treatment_id, custom_price, is_active) 
SELECT 
  s.id, 
  t.id, 
  CASE 
    WHEN t.name = 'Corte Feminino' THEN 75.00
    WHEN t.name = 'Corte Masculino' THEN 45.00
    ELSE t.base_price
  END,
  true
FROM public.salons s, public.treatments t 
WHERE s.slug = 'belle-epoque' 
AND t.name IN ('Corte Feminino', 'Corte Masculino', 'Escova', 'Hidratação', 'Manicure', 'Pedicure');