
-- Add is_active column to employees table
ALTER TABLE public.employees 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;
