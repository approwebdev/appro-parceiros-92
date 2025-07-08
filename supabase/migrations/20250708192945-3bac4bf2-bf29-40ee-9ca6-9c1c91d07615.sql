-- Criar função para automaticamente criar salão para usuários com role 'salon'
CREATE OR REPLACE FUNCTION public.create_salon_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Se o usuário é do tipo salon, criar automaticamente um salão
  IF NEW.role = 'salon' THEN
    INSERT INTO public.salons (
      user_id,
      name,
      responsible_name,
      responsible_email,
      slug,
      is_active
    )
    VALUES (
      NEW.user_id,
      COALESCE(NEW.name, 'Meu Salão'),
      NEW.name,
      NEW.email,
      LOWER(REPLACE(COALESCE(NEW.name, 'salon'), ' ', '-')) || '-' || substring(NEW.user_id::text, 1, 8),
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar após inserir perfil
CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_salon_for_new_user();