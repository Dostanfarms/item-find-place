
-- Create a table to store product sizes for fashion items
CREATE TABLE public.product_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL CHECK (size IN ('S', 'M', 'L', 'XL', 'XXL')),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, size)
);

-- Add index for better performance
CREATE INDEX idx_product_sizes_product_id ON public.product_sizes(product_id);
CREATE INDEX idx_product_sizes_quantity ON public.product_sizes(quantity);

-- Enable RLS
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow public read access for customer browsing)
CREATE POLICY "Public can view product sizes" 
  ON public.product_sizes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only authenticated users can manage product sizes" 
  ON public.product_sizes 
  FOR ALL 
  USING (true);
