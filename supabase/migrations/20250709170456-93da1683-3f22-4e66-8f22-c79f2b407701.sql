-- Atualizar a função handle_new_user para incluir os novos campos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
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
    has_salon
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'salon'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'instagram',
    COALESCE((NEW.raw_user_meta_data->>'wants_salon')::boolean, false),
    NEW.raw_user_meta_data->>'postal_code',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'address_number',
    NEW.raw_user_meta_data->>'address_complement',
    COALESCE((NEW.raw_user_meta_data->>'wants_salon')::boolean, false)
  );
  RETURN NEW;
END;
$function$;