-- Limpar tabelas existentes
DROP TABLE IF EXISTS public.salon_treatments CASCADE;
DROP TABLE IF EXISTS public.treatments CASCADE;
DROP TABLE IF EXISTS public.salons CASCADE;

-- Criar tabela de usuários/perfis (para autenticação do painel admin)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'salon' CHECK (role IN ('admin', 'salon')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de salões parceiros
CREATE TABLE public.salons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  instagram TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de tratamentos da Appro (padrão para todos os salões)
CREATE TABLE public.treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('treatment', 'transformation', 'combos', 'home_care')),
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_minutes INTEGER,
  rating DECIMAL(3,2) DEFAULT 5.0,
  rating_count INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de relacionamento salão-tratamentos (preços personalizados)
CREATE TABLE public.salon_treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  treatment_id UUID NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
  custom_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(salon_id, treatment_id)
);

-- Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_treatments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para visualização pública dos menus
CREATE POLICY "Salons are publicly viewable" 
ON public.salons 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Treatments are publicly viewable" 
ON public.treatments 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Salon treatments are publicly viewable" 
ON public.salon_treatments 
FOR SELECT 
USING (is_active = true);

-- Políticas RLS para profiles (apenas próprio usuário)
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas RLS para salões (apenas próprio salão + admin)
CREATE POLICY "Salon owners can manage their salon" 
ON public.salons 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Salon owners can manage their treatments" 
ON public.salon_treatments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.salons 
    WHERE salons.id = salon_treatments.salon_id 
    AND salons.user_id = auth.uid()
  )
);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

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

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    'salon'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Inserir dados de exemplo dos tratamentos da Appro
INSERT INTO public.treatments (name, subtitle, description, category, base_price, duration_minutes) VALUES
-- Treatment
('Liso Lambido', 'Realinhamento capilar de alto desempenho', 'Apresentamos o Liso Lambido, a solução perfeita para quem busca um realinhamento capilar impecável e duradouro. Este produto inovador foi desenvolvido para proporcionar um efeito liso e sedoso, eliminando o frizz e disciplinando até os fios mais rebeldes.', 'treatment', 150.00, 90),
('Botox Capilar', 'Tratamento intensivo de rejuvenescimento', 'O Botox Capilar é um tratamento revolucionário que promove o rejuvenescimento dos fios, restaurando a vitalidade e brilho natural dos cabelos. Ideal para cabelos danificados e ressecados.', 'treatment', 120.00, 60),
('Hidratação Profunda', 'Nutrição intensiva para cabelos secos', 'Tratamento de hidratação profunda que repõe a umidade natural dos fios, proporcionando maciez, brilho e vitalidade aos cabelos mais ressecados e danificados.', 'treatment', 80.00, 45),

-- Transformation
('Coloração Premium', 'Transformação completa da cor', 'Serviço completo de coloração com produtos de alta qualidade que proporcionam cobertura perfeita e durabilidade excepcional. Inclui análise de fios e tratamento pré-coloração.', 'transformation', 200.00, 120),
('Mechas Balayage', 'Técnica francesa de iluminação', 'Técnica sofisticada que cria um efeito natural de iluminação nos fios, proporcionando movimento e dimensão ao cabelo com transições suaves e elegantes.', 'transformation', 250.00, 150),
('Corte + Escova', 'Renovação completa do visual', 'Serviço completo que inclui corte personalizado e finalização profissional, criando um visual moderno e adaptado ao seu estilo de vida.', 'transformation', 100.00, 90),

-- Combos
('Combo Liso + Hidratação', 'Realinhamento + nutrição em um só serviço', 'Combinação perfeita do tratamento Liso Lambido com hidratação profunda, garantindo fios lisos, nutridos e com brilho intenso por mais tempo.', 'combos', 220.00, 120),
('Combo Coloração + Tratamento', 'Cor + cuidado em uma sessão', 'Pacote completo que une coloração premium com tratamento reparador, mantendo a cor vibrante e os fios saudáveis.', 'combos', 280.00, 180),
('Combo Transformação Total', 'Corte + cor + tratamento', 'O pacote mais completo: corte moderno, coloração personalizada e tratamento intensivo para uma transformação completa do visual.', 'combos', 350.00, 240),

-- Home Care
('Kit Manutenção Liso', 'Produtos para manter o liso em casa', 'Kit completo com shampoo, condicionador e leave-in específicos para manter o efeito do tratamento Liso Lambido por mais tempo em casa.', 'home_care', 120.00, 0),
('Kit Hidratação Intensiva', 'Cuidados nutritivos para casa', 'Conjunto de produtos para hidratação caseira, incluindo máscara nutritiva, óleo reparador e spray protetor térmico.', 'home_care', 90.00, 0),
('Kit Proteção Cor', 'Preserva a cor dos fios', 'Produtos específicos para cabelos coloridos, com proteção UV e antioxidantes que mantêm a cor vibrante por mais tempo.', 'home_care', 110.00, 0);

-- Inserir um salão de exemplo
INSERT INTO public.salons (name, slug, phone, address, instagram) VALUES
('Salão Bella Vita', 'bella-vita', '(11) 99999-9999', 'Rua das Flores, 123 - Centro', '@salaobella');

-- Associar todos os tratamentos ao salão de exemplo
INSERT INTO public.salon_treatments (salon_id, treatment_id, custom_price, is_active) 
SELECT 
  s.id, 
  t.id, 
  t.base_price,
  true
FROM public.salons s, public.treatments t 
WHERE s.slug = 'bella-vita';