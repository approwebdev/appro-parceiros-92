-- Corrigir o trigger que estava causando erro
DROP TRIGGER IF EXISTS create_salon_for_new_user_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.create_salon_for_new_user();

-- Criar nova função corrigida para criação de salão
CREATE OR REPLACE FUNCTION public.create_salon_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Se o usuário é do tipo salon E quer ter um salão, criar automaticamente
  IF NEW.role = 'salon' AND NEW.wants_salon = true THEN
    INSERT INTO public.salons (
      user_id,
      name,
      responsible_name,
      responsible_email,
      slug,
      is_active,
      address,
      phone
    )
    VALUES (
      NEW.user_id,
      COALESCE(NEW.name || ' - Salão', 'Salão'),
      NEW.name,
      NEW.email,
      LOWER(REPLACE(COALESCE(NEW.name, 'salon'), ' ', '-')) || '-' || substring(NEW.user_id::text, 1, 8),
      true,
      COALESCE(NEW.address || ' ' || COALESCE(NEW.address_number, ''), NULL),
      NEW.phone
    );
    
    -- Atualizar o profile para indicar que tem salão
    UPDATE public.profiles 
    SET has_salon = true 
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger para criar salão automaticamente quando profile for criado/atualizado
CREATE TRIGGER create_salon_for_new_user_trigger
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_salon_for_new_user();

-- Inserir o perfil que estava faltando
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