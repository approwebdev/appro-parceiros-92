-- Corrigir o role do usuário admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@teste.com';