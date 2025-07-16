-- FASE 1: Criar dados padrão para demonstração (versão com planos corretos)

-- Verificar se já existem dados antes de inserir
DO $$
BEGIN
  -- Inserir categorias apenas se não existirem
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Cabelos') THEN
    INSERT INTO public.categories (name, description, cover_image_url, order_position, is_active) VALUES
    ('Cabelos', 'Serviços especializados em cabelos', '/lovable-uploads/4645a4ff-beda-4f6f-90f1-ea6a54167f18.png', 1, true),
    ('Unhas', 'Manicure, pedicure e nail art', '/lovable-uploads/7b0ce177-78db-44ee-9a51-a94e3561d5cd.png', 2, true),
    ('Estética', 'Tratamentos estéticos e cuidados com a pele', '/lovable-uploads/b5d43ff0-f061-4528-b645-d6b8ea12f516.png', 3, true),
    ('Massagens', 'Relaxamento e terapias corporais', '/lovable-uploads/c3cd9e4a-b3d4-4156-a87a-797c0fcb0e19.png', 4, true);
  END IF;

  -- Criar salão de exemplo apenas se não existir (com planos corretos)
  IF NOT EXISTS (SELECT 1 FROM public.salons WHERE slug = 'salao-exemplo') THEN
    INSERT INTO public.salons (
      name, slug, phone, address, instagram, photo_url,
      responsible_name, responsible_email, city, state, postal_code,
      latitude, longitude, is_active, plan_type, subscription_plan
    ) VALUES (
      'Salão Exemplo', 'salao-exemplo', '(11) 99999-9999', 'Rua das Flores, 123',
      '@salaoexemplo', '/lovable-uploads/d0d82eec-20d9-4476-bebc-9f78f7816775.png',
      'Maria Silva', 'maria@salaoexemplo.com', 'São Paulo', 'SP', '01234-567',
      -23.5505, -46.6333, true, 'verificado_dourado', 'verificado_dourado'
    );
  END IF;

  -- Inserir tratamentos apenas se não existirem
  IF NOT EXISTS (SELECT 1 FROM public.treatments WHERE name = 'Corte Feminino') THEN
    INSERT INTO public.treatments (
      name, subtitle, description, category, base_price, promotional_price,
      is_promotional, duration_minutes, rating, rating_count, images, 
      video_url, button_color, is_active
    ) VALUES 
    -- Cabelos
    ('Corte Feminino', 'Corte moderno e estiloso', 'Corte personalizado com as últimas tendências da moda', 'Cabelos', 80.00, 65.00, true, 60, 4.8, 156, ARRAY['/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png'], null, '#8B5CF6', true),
    ('Coloração', 'Mudança total de visual', 'Coloração profissional com produtos de qualidade premium', 'Cabelos', 150.00, null, false, 120, 4.9, 89, ARRAY['/lovable-uploads/1572fc57-750b-4248-a2aa-a7bf7e6da5a2.png'], null, '#D946EF', true),
    ('Escova Progressiva', 'Cabelos lisos por mais tempo', 'Tratamento para alisar e nutrir profundamente os fios', 'Cabelos', 200.00, 180.00, true, 180, 4.7, 203, ARRAY['/lovable-uploads/4645a4ff-beda-4f6f-90f1-ea6a54167f18.png'], null, '#06B6D4', true),
    
    -- Unhas
    ('Manicure Completa', 'Unhas perfeitas', 'Manicure completa com esmaltação de qualidade', 'Unhas', 35.00, null, false, 45, 4.6, 234, ARRAY['/lovable-uploads/63155ad2-ae8d-41f6-8e01-774a09edeb0a.png'], null, '#F59E0B', true),
    ('Nail Art', 'Arte nas unhas', 'Desenhos personalizados e decorações especiais', 'Unhas', 60.00, 50.00, true, 75, 4.9, 127, ARRAY['/lovable-uploads/7b0ce177-78db-44ee-9a51-a94e3561d5cd.png'], null, '#EF4444', true),
    ('Pedicure Spa', 'Cuidado completo dos pés', 'Pedicure relaxante com hidratação e massagem', 'Unhas', 45.00, null, false, 60, 4.8, 178, ARRAY['/lovable-uploads/9c25a7ad-7cc5-4900-8063-caae12ddfd0f.png'], null, '#10B981', true),
    
    -- Estética
    ('Limpeza de Pele', 'Pele renovada', 'Limpeza profunda com extração e hidratação', 'Estética', 120.00, 100.00, true, 90, 4.7, 156, ARRAY['/lovable-uploads/b5d43ff0-f061-4528-b645-d6b8ea12f516.png'], null, '#8B5CF6', true),
    ('Microagulhamento', 'Rejuvenescimento facial', 'Tratamento para renovação celular e combate ao envelhecimento', 'Estética', 180.00, null, false, 60, 4.9, 89, ARRAY['/lovable-uploads/c3cd9e4a-b3d4-4156-a87a-797c0fcb0e19.png'], null, '#06B6D4', true),
    ('Peeling Químico', 'Renovação da pele', 'Peeling para renovar a pele e tratar manchas', 'Estética', 150.00, 130.00, true, 75, 4.6, 134, ARRAY['/lovable-uploads/d0d82eec-20d9-4476-bebc-9f78f7816775.png'], null, '#D946EF', true),
    
    -- Massagens
    ('Relaxante', 'Alívio total do stress', 'Massagem relaxante para alívio do stress e tensões', 'Massagens', 90.00, null, false, 60, 4.8, 198, ARRAY['/lovable-uploads/f5c1b56b-2cb9-470a-8b4c-7640e6b2ac64.png'], null, '#10B981', true),
    ('Drenagem Linfática', 'Redução de inchaço', 'Massagem terapêutica para drenagem e modelagem corporal', 'Massagens', 110.00, 95.00, true, 75, 4.9, 167, ARRAY['/lovable-uploads/f77b22c2-a495-423a-bce4-4ddc7b37074d.png'], null, '#F59E0B', true),
    ('Pedras Quentes', 'Relaxamento profundo', 'Massagem com pedras quentes para relaxamento muscular', 'Massagens', 130.00, null, false, 90, 4.7, 145, ARRAY['/lovable-uploads/058b2b94-b909-437a-a7ca-7630a654016f.png'], null, '#EF4444', true);
  END IF;

  -- Inserir banners apenas se não existirem
  IF NOT EXISTS (SELECT 1 FROM public.salon_banners WHERE title = 'Promoção Especial') THEN
    INSERT INTO public.salon_banners (title, description, image_url, order_position, is_active) VALUES
    ('Promoção Especial', 'Desconto de 20% em todos os serviços de cabelo', '/lovable-uploads/4645a4ff-beda-4f6f-90f1-ea6a54167f18.png', 1, true),
    ('Novo Tratamento', 'Conheça nosso novo tratamento de rejuvenescimento', '/lovable-uploads/b5d43ff0-f061-4528-b645-d6b8ea12f516.png', 2, true),
    ('Pacote Relax', 'Massagem + Limpeza de pele com desconto especial', '/lovable-uploads/f5c1b56b-2cb9-470a-8b4c-7640e6b2ac64.png', 3, true);
  END IF;
END $$;