
-- Create farmer_products table to store products associated with farmers
CREATE TABLE public.farmer_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg',
  price_per_unit NUMERIC NOT NULL,
  category TEXT NOT NULL,
  barcode TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.farmer_products ENABLE ROW LEVEL SECURITY;

-- Create policies for farmer_products table
CREATE POLICY "Enable read access for all users" ON public.farmer_products
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.farmer_products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.farmer_products
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.farmer_products
  FOR DELETE USING (true);

-- Create index for better performance
CREATE INDEX idx_farmer_products_farmer_id ON public.farmer_products(farmer_id);
CREATE INDEX idx_farmer_products_created_at ON public.farmer_products(created_at);
