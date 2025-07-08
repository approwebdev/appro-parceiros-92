-- Alterar o enum de role para incluir admin
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';

-- Atualizar a função handle_new_user para suportar admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'salon')
  );
  RETURN NEW;
END;
$$;