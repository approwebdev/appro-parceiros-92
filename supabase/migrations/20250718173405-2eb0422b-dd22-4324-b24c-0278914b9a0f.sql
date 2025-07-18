-- Criar função para criar access_request automaticamente quando usuário quer salão
CREATE OR REPLACE FUNCTION public.create_access_request_for_salon_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Se o usuário quer um salão, criar access_request automaticamente
  IF NEW.wants_salon = true AND NEW.role = 'salon' THEN
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
      -- Tentar pegar o salon_name dos metadados do usuário
      (SELECT raw_user_meta_data->>'salon_name' FROM auth.users WHERE id = NEW.user_id),
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

-- Criar trigger para executar após inserção de perfil
CREATE TRIGGER create_access_request_after_profile_insert
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_access_request_for_salon_owner();