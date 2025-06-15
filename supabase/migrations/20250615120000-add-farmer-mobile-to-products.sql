
-- Add farmer_mobile column to farmer_products table
ALTER TABLE public.farmer_products 
ADD COLUMN farmer_mobile TEXT;

-- Update existing records with farmer mobile numbers
UPDATE public.farmer_products 
SET farmer_mobile = farmers.phone 
FROM public.farmers 
WHERE farmer_products.farmer_id = farmers.id;

-- Create index for better performance on farmer_mobile queries
CREATE INDEX idx_farmer_products_farmer_mobile ON public.farmer_products(farmer_mobile);
