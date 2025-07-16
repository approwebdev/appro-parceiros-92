-- Aprovar o usuário admin@teste.com
UPDATE profiles 
SET status = 'approved' 
WHERE email = 'admin@teste.com' AND role = 'admin';