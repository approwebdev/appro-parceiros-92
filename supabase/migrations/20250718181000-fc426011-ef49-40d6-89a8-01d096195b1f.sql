-- Criar access_request automaticamente quando profile é criado com wants_salon = false
CREATE OR REPLACE FUNCTION public.create_access_request_for_salon_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
BEGIN
  -- Se o usuário tem role salon e não tem salão, criar access_request automaticamente
  IF NEW.role = 'salon' AND NEW.wants_salon = false AND NEW.has_salon = false THEN
    INSERT INTO public.access_requests (
      user_id,
      name,
      email,
      phone,
      salon_name,
      address,
      status,
      plan_type
    )
    VALUES (
      NEW.user_id,
      NEW.name,
      NEW.email,
      NEW.phone,
      NULL, -- Sem salão para usuários que não querem salão
      CASE 
        WHEN NEW.address IS NOT NULL AND NEW.address_number IS NOT NULL 
        THEN NEW.address || ' ' || NEW.address_number 
        ELSE NEW.address
      END,
      'pending',
      'basico'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recriar o trigger
DROP TRIGGER IF EXISTS create_access_request_trigger ON public.profiles;
CREATE TRIGGER create_access_request_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_access_request_for_salon_user();