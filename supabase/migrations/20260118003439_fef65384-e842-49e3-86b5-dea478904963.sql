-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop and recreate verify_password function with correct parameter order
DROP FUNCTION IF EXISTS public.verify_password(text, text);

CREATE OR REPLACE FUNCTION public.verify_password(hash text, password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if hash starts with $2 (bcrypt prefix)
  IF hash LIKE '$2%' THEN
    RETURN hash = crypt(password, hash);
  ELSE
    -- Legacy plain text comparison (for migration period)
    RETURN hash = password;
  END IF;
END;
$$;