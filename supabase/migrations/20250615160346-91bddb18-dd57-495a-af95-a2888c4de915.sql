
-- Add is_active column to farmer_products table
ALTER TABLE public.farmer_products 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;
