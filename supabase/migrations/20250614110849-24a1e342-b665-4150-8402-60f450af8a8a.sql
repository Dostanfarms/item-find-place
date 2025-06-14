
-- Remove description and category columns from the roles table
ALTER TABLE public.roles DROP COLUMN IF EXISTS description;
ALTER TABLE public.roles DROP COLUMN IF EXISTS category;
