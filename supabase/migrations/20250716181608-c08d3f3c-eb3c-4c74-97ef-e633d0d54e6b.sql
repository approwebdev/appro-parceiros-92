-- Criar salão para o usuário Arthur Lioli
INSERT INTO public.salons (
  user_id,
  name,
  responsible_name,
  responsible_email,
  slug,
  is_active,
  address,
  phone,
  plan_type
)
VALUES (
  '163f97b7-6d91-4f1c-8d3f-dcb6828f41fb',
  'Salão Lioli',
  'Arthur Lioli',
  'asts7ven@gmail.com',
  'salao-lioli-163f97b7',
  true,
  'Rua Serra Nevada, 122, casa 40, Chácara Cachoeira, Campo Grande - MS',
  '67991740654',
  'basico'
)
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  responsible_name = EXCLUDED.responsible_name,
  responsible_email = EXCLUDED.responsible_email,
  slug = EXCLUDED.slug,
  is_active = EXCLUDED.is_active,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone;