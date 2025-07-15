-- Create profile for existing user that doesn't have one
INSERT INTO public.profiles (
  user_id,
  name,
  email,
  role,
  phone,
  instagram,
  wants_salon,
  status,
  has_salon
) VALUES (
  'fd8c0b37-d277-4269-864a-38fe08b309e9',
  'Arthur Lincoln de Oliveira Lima',
  'admin@clubcars.com',
  'admin',
  '15991070101',
  'arthurlioli',
  false,
  'approved',
  false
) ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  instagram = EXCLUDED.instagram,
  status = EXCLUDED.status;