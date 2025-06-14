
-- Add new columns to farmer_products table for payment tracking
ALTER TABLE public.farmer_products 
ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unsettled',
ADD COLUMN transaction_image TEXT;

-- Add check constraint for payment_status
ALTER TABLE public.farmer_products 
ADD CONSTRAINT payment_status_check 
CHECK (payment_status IN ('settled', 'unsettled'));

-- Create index for better performance on payment_status queries
CREATE INDEX idx_farmer_products_payment_status ON public.farmer_products(payment_status);
