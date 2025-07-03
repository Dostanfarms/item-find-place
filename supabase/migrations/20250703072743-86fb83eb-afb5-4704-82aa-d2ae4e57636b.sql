
-- Create fashion_products table
CREATE TABLE IF NOT EXISTS public.fashion_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_per_unit NUMERIC NOT NULL,
  category TEXT NOT NULL DEFAULT 'Fashion',
  barcode TEXT UNIQUE,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fashion_product_sizes table for size inventory
CREATE TABLE IF NOT EXISTS public.fashion_product_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fashion_product_id UUID NOT NULL REFERENCES fashion_products(id) ON DELETE CASCADE,
  size TEXT NOT NULL CHECK (size IN ('S', 'M', 'L', 'XL', 'XXL')),
  pieces INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(fashion_product_id, size)
);

-- Enable RLS
ALTER TABLE public.fashion_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_product_sizes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on fashion_products" ON public.fashion_products FOR ALL USING (true);
CREATE POLICY "Allow all operations on fashion_product_sizes" ON public.fashion_product_sizes FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fashion_products_category ON fashion_products(category);
CREATE INDEX IF NOT EXISTS idx_fashion_products_is_active ON fashion_products(is_active);
CREATE INDEX IF NOT EXISTS idx_fashion_product_sizes_product_id ON fashion_product_sizes(fashion_product_id);
CREATE INDEX IF NOT EXISTS idx_fashion_product_sizes_size ON fashion_product_sizes(size);

-- Insert Fashion category if it doesn't exist
INSERT INTO categories (name, description, is_active) 
VALUES ('Fashion', 'Clothing and fashion items with size variants', true)
ON CONFLICT (name) DO NOTHING;
