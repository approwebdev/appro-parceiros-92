-- Criar usuários de teste através de inserção direta
-- Inserir profiles diretamente para teste
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'admin@teste.com',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Admin Teste", "role": "admin"}'::jsonb
),
(
  '00000000-0000-0000-0000-000000000002', 
  'salao@teste.com',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Salão Teste", "role": "salon"}'::jsonb
);

-- Inserir profiles correspondentes
INSERT INTO public.profiles (user_id, name, email, role) VALUES 
('00000000-0000-0000-0000-000000000001', 'Admin Teste', 'admin@teste.com', 'admin'),
('00000000-0000-0000-0000-000000000002', 'Salão Teste', 'salao@teste.com', 'salon');