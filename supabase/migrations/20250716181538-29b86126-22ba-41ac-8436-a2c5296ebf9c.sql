-- Remover triggers e funções com CASCADE
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.create_salon_for_new_user() CASCADE;

-- Inserir o perfil que estava faltando diretamente
INSERT INTO public.profiles (
  user_id, 
  name, 
  email, 
  role, 
  phone, 
  instagram, 
  wants_salon, 
  postal_code, 
  address, 
  address_number, 
  address_complement, 
  has_salon, 
  status
) 
VALUES (
  '163f97b7-6d91-4f1c-8d3f-dcb6828f41fb', 
  'Arthur Lioli', 
  'asts7ven@gmail.com', 
  'salon', 
  '67991740654', 
  '', 
  true, 
  '79040480', 
  'Rua Serra Nevada, Chácara Cachoeira, Campo Grande - MS', 
  '122', 
  'casa 40', 
  true, 
  'approved'
) 
ON CONFLICT (user_id) DO UPDATE SET 
  name = EXCLUDED.name, 
  email = EXCLUDED.email, 
  role = EXCLUDED.role, 
  phone = EXCLUDED.phone, 
  wants_salon = EXCLUDED.wants_salon, 
  has_salon = EXCLUDED.has_salon, 
  status = EXCLUDED.status;