
-- Create settlements table to track payment settlements
CREATE TABLE public.settlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  settled_amount NUMERIC NOT NULL DEFAULT 0,
  product_count INTEGER NOT NULL DEFAULT 0,
  transaction_image TEXT,
  settlement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  settlement_method TEXT DEFAULT 'manual',
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create settlement_products junction table to track which products were included in each settlement
CREATE TABLE public.settlement_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  settlement_id UUID NOT NULL REFERENCES public.settlements(id) ON DELETE CASCADE,
  farmer_product_id UUID NOT NULL REFERENCES public.farmer_products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price_per_unit NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX idx_settlements_farmer_id ON public.settlements(farmer_id);
CREATE INDEX idx_settlements_settlement_date ON public.settlements(settlement_date);
CREATE INDEX idx_settlement_products_settlement_id ON public.settlement_products(settlement_id);
CREATE INDEX idx_settlement_products_farmer_product_id ON public.settlement_products(farmer_product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for settlements table
CREATE POLICY "Allow all operations on settlements" ON public.settlements FOR ALL USING (true);

-- Create RLS policies for settlement_products table  
CREATE POLICY "Allow all operations on settlement_products" ON public.settlement_products FOR ALL USING (true);
