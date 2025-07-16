-- Fix Supabase security warnings

-- 1. Fix OTP expiry (set to 1 hour instead of default 24 hours)
UPDATE auth.config 
SET value = '3600' 
WHERE parameter = 'OTP_EXPIRY';

-- If the config doesn't exist, insert it
INSERT INTO auth.config (parameter, value) 
SELECT 'OTP_EXPIRY', '3600'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.config WHERE parameter = 'OTP_EXPIRY'
);

-- 2. Enable leaked password protection
UPDATE auth.config 
SET value = 'true' 
WHERE parameter = 'PASSWORD_BREACH_GUARD_ENABLED';

-- If the config doesn't exist, insert it
INSERT INTO auth.config (parameter, value) 
SELECT 'PASSWORD_BREACH_GUARD_ENABLED', 'true'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.config WHERE parameter = 'PASSWORD_BREACH_GUARD_ENABLED'
);