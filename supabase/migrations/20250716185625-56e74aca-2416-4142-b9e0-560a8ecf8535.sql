-- Corrigir problemas de segurança identificados pelo linter

-- 1. Corrigir funções removendo SECURITY DEFINER desnecessário e adicionando search_path
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_uuid 
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_address_from_cep(cep_input text)
 RETURNS TABLE(logradouro text, bairro text, cidade text, uf text, latitude numeric, longitude numeric)
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Placeholder para função de busca de CEP
  -- Integração com API de CEP seria implementada aqui
  RETURN QUERY SELECT 
    'Endereço não encontrado'::TEXT as logradouro,
    ''::TEXT as bairro,
    ''::TEXT as cidade,
    ''::TEXT as uf,
    NULL::DECIMAL as latitude,
    NULL::DECIMAL as longitude
  WHERE FALSE; -- Retorna vazio por enquanto
END;
$function$;

CREATE OR REPLACE FUNCTION public.activate_kiwify_subscription(p_email text, p_name text, p_kiwify_order_id text, p_kiwify_customer_id text, p_product_id text, p_plan_type text, p_webhook_data jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
DECLARE
  subscription_id UUID;
  profile_id UUID;
BEGIN
  -- Inserir nova assinatura
  INSERT INTO public.kiwify_subscriptions (
    kiwify_order_id,
    kiwify_customer_id,
    customer_email,
    customer_name,
    product_id,
    plan_type,
    webhook_data,
    status
  ) VALUES (
    p_kiwify_order_id,
    p_kiwify_customer_id,
    p_email,
    p_name,
    p_product_id,
    p_plan_type,
    p_webhook_data,
    'active'
  ) RETURNING id INTO subscription_id;

  -- Buscar perfil existente pelo email
  SELECT id INTO profile_id
  FROM public.profiles
  WHERE email = p_email
  LIMIT 1;

  -- Se perfil existe, atualizar com assinatura
  IF profile_id IS NOT NULL THEN
    UPDATE public.profiles
    SET 
      kiwify_subscription_id = subscription_id,
      subscription_plan = p_plan_type,
      subscription_status = 'active',
      role = 'partner',
      updated_at = now()
    WHERE id = profile_id;

    -- Atualizar salões do usuário
    UPDATE public.salons
    SET subscription_plan = p_plan_type
    WHERE user_id = (SELECT user_id FROM public.profiles WHERE id = profile_id);
  END IF;

  RETURN subscription_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
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
    has_salon,
    status
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
    COALESCE((NEW.raw_user_meta_data->>'wants_salon')::boolean, false),
    'pending'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, still allow user creation but log the error
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_salon_treatments_for_new_salon()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Inserir todos os tratamentos existentes para o novo salão
  INSERT INTO public.salon_treatments (salon_id, treatment_id, custom_price, is_active)
  SELECT 
    NEW.id,
    t.id,
    t.base_price, -- usar preço base como preço inicial
    true -- ativo por padrão
  FROM public.treatments t
  WHERE t.is_active = true;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_salon_treatments_for_new_treatment()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Inserir o novo tratamento para todos os salões existentes
  INSERT INTO public.salon_treatments (salon_id, treatment_id, custom_price, is_active)
  SELECT 
    s.id,
    NEW.id,
    NEW.base_price,
    true
  FROM public.salons s
  WHERE s.is_active = true;
  
  RETURN NEW;
END;
$function$;

-- 2. Remover a view admin_profile_access problemática e criar uma função segura
DROP VIEW IF EXISTS public.admin_profile_access;

-- Função para acesso administrativo a perfis
CREATE OR REPLACE FUNCTION public.get_admin_profiles()
 RETURNS TABLE(
   id uuid,
   user_id uuid,
   name text,
   email text,
   role text,
   phone text,
   instagram text,
   address text,
   address_number text,
   address_complement text,
   postal_code text,
   created_at timestamp with time zone,
   updated_at timestamp with time zone,
   has_salon boolean,
   wants_salon boolean
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Verificar se usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.name,
    p.email,
    p.role,
    p.phone,
    p.instagram,
    p.address,
    p.address_number,
    p.address_complement,
    p.postal_code,
    p.created_at,
    p.updated_at,
    p.has_salon,
    p.wants_salon
  FROM public.profiles p;
END;
$function$;