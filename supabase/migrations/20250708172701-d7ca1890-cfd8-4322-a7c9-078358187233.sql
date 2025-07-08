-- Adicionar campo responsible_name na tabela salons
ALTER TABLE public.salons 
ADD COLUMN responsible_name TEXT;

-- Criar função para associar automaticamente todos os tratamentos a um novo salão
CREATE OR REPLACE FUNCTION public.create_salon_treatments_for_new_salon()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Criar trigger para executar a função quando um novo salão for criado
CREATE TRIGGER trigger_create_salon_treatments
  AFTER INSERT ON public.salons
  FOR EACH ROW
  EXECUTE FUNCTION public.create_salon_treatments_for_new_salon();

-- Criar função para associar novos tratamentos a todos os salões existentes
CREATE OR REPLACE FUNCTION public.create_salon_treatments_for_new_treatment()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Criar trigger para executar a função quando um novo tratamento for criado
CREATE TRIGGER trigger_create_salon_treatments_for_treatment
  AFTER INSERT ON public.treatments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_salon_treatments_for_new_treatment();