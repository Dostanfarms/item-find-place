
-- Add branch_id to orders table if not exists
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

-- Add branch_id to tickets table if not exists  
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_branch_id ON public.orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_tickets_branch_id ON public.tickets(branch_id);

-- Create function for branch-specific barcode generation
CREATE OR REPLACE FUNCTION public.generate_branch_barcode(branch_name TEXT)
RETURNS TEXT AS $$
DECLARE
    branch_code TEXT;
    timestamp_part TEXT;
    random_part TEXT;
    barcode TEXT;
    is_unique BOOLEAN := FALSE;
BEGIN
    -- Extract first 3 characters of branch name and make uppercase
    branch_code := UPPER(LEFT(REGEXP_REPLACE(branch_name, '[^A-Za-z0-9]', '', 'g'), 3));
    
    -- If branch code is less than 3 chars, pad with zeros
    IF LENGTH(branch_code) < 3 THEN
        branch_code := RPAD(branch_code, 3, '0');
    END IF;
    
    -- Generate unique barcode
    WHILE NOT is_unique LOOP
        timestamp_part := TO_CHAR(NOW(), 'YYYYMMDDHH24MI');
        random_part := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        barcode := branch_code || timestamp_part || random_part;
        
        -- Check uniqueness across all product tables
        IF NOT EXISTS (
            SELECT 1 FROM public.products WHERE barcode = barcode
            UNION ALL
            SELECT 1 FROM public.fashion_products WHERE barcode = barcode
            UNION ALL
            SELECT 1 FROM public.vegetable_products WHERE barcode = barcode
            UNION ALL
            SELECT 1 FROM public.fruit_products WHERE barcode = barcode
            UNION ALL
            SELECT 1 FROM public.dairy_products WHERE barcode = barcode
            UNION ALL
            SELECT 1 FROM public.grain_products WHERE barcode = barcode
        ) THEN
            is_unique := TRUE;
        END IF;
    END LOOP;
    
    RETURN barcode;
END;
$$ LANGUAGE plpgsql;

-- Create table for product copy operations tracking
CREATE TABLE IF NOT EXISTS public.product_copy_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_branch_id UUID REFERENCES public.branches(id),
    target_branch_id UUID NOT NULL REFERENCES public.branches(id),
    product_ids JSONB NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'pending'
);

-- Enable RLS on new table
ALTER TABLE public.product_copy_operations ENABLE ROW LEVEL SECURITY;

-- Create policy for product copy operations
CREATE POLICY "Allow all operations on product_copy_operations" ON public.product_copy_operations FOR ALL USING (true);
