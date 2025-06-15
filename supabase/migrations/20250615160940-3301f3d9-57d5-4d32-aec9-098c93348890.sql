
-- Add `is_active` column to products table to support active/inactive status for products
ALTER TABLE public.products
ADD COLUMN is_active boolean NOT NULL DEFAULT true;
