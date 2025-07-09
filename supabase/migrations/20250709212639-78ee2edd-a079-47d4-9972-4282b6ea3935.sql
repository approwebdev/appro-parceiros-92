-- Adicionar colunas de coordenadas para salões
ALTER TABLE public.salons 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Adicionar índice para busca geoespacial
CREATE INDEX IF NOT EXISTS idx_salons_coordinates ON public.salons(latitude, longitude);

-- Verificar se existe função de busca de endereço por CEP
CREATE OR REPLACE FUNCTION public.get_address_from_cep(cep_input TEXT)
RETURNS TABLE (
  logradouro TEXT,
  bairro TEXT,
  cidade TEXT,
  uf TEXT,
  latitude DECIMAL,
  longitude DECIMAL
)
LANGUAGE plpgsql
AS $$
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
$$;