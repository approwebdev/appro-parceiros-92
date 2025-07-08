-- Remover o default temporariamente
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- Criar tipo de enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'salon');

-- Alterar a coluna role para usar o enum
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE public.app_role 
USING role::public.app_role;

-- Definir o novo default
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'salon'::public.app_role;

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
    COALESCE(NEW.raw_user_meta_data->>'role', 'salon')::public.app_role
  );
  RETURN NEW;
END;
$$;