-- Verificar se salão já existe e criar se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.salons WHERE user_id = '163f97b7-6d91-4f1c-8d3f-dcb6828f41fb') THEN
    INSERT INTO public.salons (
      user_id,
      name,
      responsible_name,
      responsible_email,
      slug,
      is_active,
      address,
      phone,
      plan_type
    )
    VALUES (
      '163f97b7-6d91-4f1c-8d3f-dcb6828f41fb',
      'Salão Lioli',
      'Arthur Lioli',
      'asts7ven@gmail.com',
      'salao-lioli-163f97b7',
      true,
      'Rua Serra Nevada, 122, casa 40, Chácara Cachoeira, Campo Grande - MS',
      '67991740654',
      'basico'
    );
  END IF;
END $$;