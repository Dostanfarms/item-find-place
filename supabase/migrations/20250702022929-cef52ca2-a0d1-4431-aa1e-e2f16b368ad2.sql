
-- Add RLS policies for the new category-specific product tables
ALTER TABLE fashion_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vegetable_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE fruit_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE grain_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE dairy_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all category product tables
CREATE POLICY "Allow all operations on fashion_products" ON fashion_products FOR ALL USING (true);
CREATE POLICY "Allow all operations on vegetable_products" ON vegetable_products FOR ALL USING (true);
CREATE POLICY "Allow all operations on fruit_products" ON fruit_products FOR ALL USING (true);
CREATE POLICY "Allow all operations on grain_products" ON grain_products FOR ALL USING (true);
CREATE POLICY "Allow all operations on dairy_products" ON dairy_products FOR ALL USING (true);

-- Create a function to dynamically create product tables for new categories
CREATE OR REPLACE FUNCTION create_category_product_table(category_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    table_name TEXT;
    default_unit TEXT := 'piece';
BEGIN
    -- Convert category name to lowercase and replace spaces with underscores
    table_name := lower(regexp_replace(category_name, '\s+', '_', 'g')) || '_products';
    
    -- Set default unit based on category
    CASE lower(category_name)
        WHEN 'vegetables', 'fruits', 'grains' THEN default_unit := 'kg';
        WHEN 'dairy' THEN default_unit := 'liter';
        ELSE default_unit := 'piece';
    END CASE;
    
    -- Create the table dynamically
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            quantity INTEGER NOT NULL DEFAULT 0,
            unit TEXT NOT NULL DEFAULT %L,
            price_per_unit NUMERIC NOT NULL,
            category TEXT NOT NULL DEFAULT %L,
            barcode TEXT,
            image_url TEXT,
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        )', table_name, default_unit, category_name);
    
    -- Enable RLS
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    
    -- Create RLS policy
    EXECUTE format('CREATE POLICY "Allow all operations on %I" ON %I FOR ALL USING (true)', table_name, table_name);
    
    -- Create indexes
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_category ON %I(category)', table_name, table_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_is_active ON %I(is_active)', table_name, table_name);
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to automatically create product table when category is added
CREATE OR REPLACE FUNCTION create_product_table_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create table for active categories
    IF NEW.is_active = true THEN
        PERFORM create_category_product_table(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on categories table
DROP TRIGGER IF EXISTS trigger_create_product_table ON categories;
CREATE TRIGGER trigger_create_product_table
    AFTER INSERT ON categories
    FOR EACH ROW
    EXECUTE FUNCTION create_product_table_trigger();
