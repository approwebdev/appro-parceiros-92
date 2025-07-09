-- Fix the handle_new_user function to handle missing raw_user_meta_data
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
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'instagram', NULL),
    COALESCE((NEW.raw_user_meta_data->>'wants_salon')::boolean, false),
    COALESCE(NEW.raw_user_meta_data->>'postal_code', NULL),
    COALESCE(NEW.raw_user_meta_data->>'address', NULL),
    COALESCE(NEW.raw_user_meta_data->>'address_number', NULL),
    COALESCE(NEW.raw_user_meta_data->>'address_complement', NULL),
    COALESCE((NEW.raw_user_meta_data->>'wants_salon')::boolean, false)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, still allow user creation but log the error
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;