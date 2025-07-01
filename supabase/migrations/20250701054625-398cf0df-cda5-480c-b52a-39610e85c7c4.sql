
-- Ensure product description field exists and is properly set up
-- Add index for better performance on category filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Ensure product_sizes table has proper indexes
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sizes_size ON product_sizes(size);

-- Add any missing constraints
DO $$ 
BEGIN
    -- Check if size constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'product_sizes_size_check'
    ) THEN
        ALTER TABLE product_sizes 
        ADD CONSTRAINT product_sizes_size_check 
        CHECK (size IN ('S', 'M', 'L', 'XL', 'XXL', 'XXXL'));
    END IF;
END $$;
