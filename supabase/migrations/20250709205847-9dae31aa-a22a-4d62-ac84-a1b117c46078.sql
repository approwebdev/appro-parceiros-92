-- Atualizar a função para criar salão usando o nome do salão dos metadados
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
      COALESCE(NEW.raw_user_meta_data->>'salon_name', NEW.name || ' - Salão'),
      NEW.name,
      NEW.email,
      LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'salon_name', NEW.name), ' ', '-')) || '-' || substring(NEW.user_id::text, 1, 8),
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