
-- Ensure all tables have proper branch_id references
ALTER TABLE public.farmers 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

ALTER TABLE public.fashion_products 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farmers_branch_id ON public.farmers(branch_id);
CREATE INDEX IF NOT EXISTS idx_products_branch_id ON public.products(branch_id);
CREATE INDEX IF NOT EXISTS idx_fashion_products_branch_id ON public.fashion_products(branch_id);
CREATE INDEX IF NOT EXISTS idx_coupons_branch_id ON public.coupons(branch_id);
CREATE INDEX IF NOT EXISTS idx_transactions_branch_id ON public.transactions(branch_id);

-- Add branch search indexes for better performance
CREATE INDEX IF NOT EXISTS idx_branches_name_search ON public.branches USING gin(to_tsvector('english', branch_name || ' ' || branch_owner_name));

-- Update employees table to ensure proper branch relationship
ALTER TABLE public.employees 
DROP CONSTRAINT IF EXISTS employees_branch_id_fkey;

ALTER TABLE public.employees 
ADD CONSTRAINT employees_branch_id_fkey 
FOREIGN KEY (branch_id) REFERENCES public.branches(id);
