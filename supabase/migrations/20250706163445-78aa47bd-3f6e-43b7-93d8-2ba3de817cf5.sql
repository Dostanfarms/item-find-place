
-- Create branches table
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_name TEXT NOT NULL,
  branch_owner_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  state TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on branches table
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Create policy for branches
CREATE POLICY "Allow all operations on branches" ON public.branches FOR ALL USING (true);

-- Add branch_id to existing tables
ALTER TABLE public.employees ADD COLUMN branch_id UUID REFERENCES public.branches(id);
ALTER TABLE public.farmers ADD COLUMN branch_id UUID REFERENCES public.branches(id);
ALTER TABLE public.products ADD COLUMN branch_id UUID REFERENCES public.branches(id);
ALTER TABLE public.fashion_products ADD COLUMN branch_id UUID REFERENCES public.branches(id);
ALTER TABLE public.coupons ADD COLUMN branch_id UUID REFERENCES public.branches(id);

-- Create indexes for better performance
CREATE INDEX idx_employees_branch_id ON public.employees(branch_id);
CREATE INDEX idx_farmers_branch_id ON public.farmers(branch_id);
CREATE INDEX idx_products_branch_id ON public.products(branch_id);
CREATE INDEX idx_fashion_products_branch_id ON public.fashion_products(branch_id);
CREATE INDEX idx_coupons_branch_id ON public.coupons(branch_id);
