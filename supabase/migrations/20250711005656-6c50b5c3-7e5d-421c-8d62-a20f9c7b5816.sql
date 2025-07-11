-- Criar tabela para gerenciar assinaturas da Kiwify
CREATE TABLE public.kiwify_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kiwify_order_id TEXT NOT NULL UNIQUE,
  kiwify_customer_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  product_id TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basico', 'verificado_azul', 'verificado_dourado')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  webhook_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kiwify_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies para assinaturas Kiwify
CREATE POLICY "Admins can manage all Kiwify subscriptions"
ON public.kiwify_subscriptions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_kiwify_subscriptions_updated_at
  BEFORE UPDATE ON public.kiwify_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar campos relacionados à assinatura na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kiwify_subscription_id UUID REFERENCES public.kiwify_subscriptions(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'basico' CHECK (subscription_plan IN ('basico', 'verificado_azul', 'verificado_dourado'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired'));

-- Atualizar tabela salons para incluir plano
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'basico' CHECK (subscription_plan IN ('basico', 'verificado_azul', 'verificado_dourado'));

-- Função para ativar assinatura e atualizar perfil
CREATE OR REPLACE FUNCTION public.activate_kiwify_subscription(
  p_email TEXT,
  p_name TEXT,
  p_kiwify_order_id TEXT,
  p_kiwify_customer_id TEXT,
  p_product_id TEXT,
  p_plan_type TEXT,
  p_webhook_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;