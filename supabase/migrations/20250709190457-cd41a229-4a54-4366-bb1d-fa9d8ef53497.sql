-- Criar bucket para imagens de tratamentos
INSERT INTO storage.buckets (id, name, public) VALUES ('treatment-images', 'treatment-images', true);

-- Criar políticas para o bucket
CREATE POLICY "Authenticated users can upload treatment images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'treatment-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view treatment images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'treatment-images');

CREATE POLICY "Authenticated users can update treatment images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'treatment-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete treatment images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'treatment-images' AND auth.uid() IS NOT NULL);

-- Atualizar salões existentes para plano básico como padrão
UPDATE salons SET plan = 'basico', plan_type = 'basico' WHERE plan IS NULL OR plan = '';

-- Atualizar coluna plan para ter valor padrão 'basico'
ALTER TABLE salons ALTER COLUMN plan SET DEFAULT 'basico';
ALTER TABLE salons ALTER COLUMN plan_type SET DEFAULT 'basico';