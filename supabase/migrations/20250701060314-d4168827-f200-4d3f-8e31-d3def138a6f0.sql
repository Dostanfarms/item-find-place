
-- Create separate tables for different product categories
-- Fashion products table with size management
CREATE TABLE fashion_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_per_unit NUMERIC NOT NULL,
    category TEXT NOT NULL DEFAULT 'Fashion',
    barcode TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fashion product sizes table
CREATE TABLE fashion_product_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fashion_product_id UUID NOT NULL REFERENCES fashion_products(id) ON DELETE CASCADE,
    size TEXT NOT NULL CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL')),
    pieces INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(fashion_product_id, size)
);

-- Vegetables products table
CREATE TABLE vegetable_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'kg',
    price_per_unit NUMERIC NOT NULL,
    category TEXT NOT NULL DEFAULT 'Vegetables',
    barcode TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fruits products table
CREATE TABLE fruit_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'kg',
    price_per_unit NUMERIC NOT NULL,
    category TEXT NOT NULL DEFAULT 'Fruits',
    barcode TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grains products table
CREATE TABLE grain_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'kg',
    price_per_unit NUMERIC NOT NULL,
    category TEXT NOT NULL DEFAULT 'Grains',
    barcode TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dairy products table
CREATE TABLE dairy_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'liter',
    price_per_unit NUMERIC NOT NULL,
    category TEXT NOT NULL DEFAULT 'Dairy',
    barcode TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_fashion_products_category ON fashion_products(category);
CREATE INDEX idx_fashion_products_is_active ON fashion_products(is_active);
CREATE INDEX idx_fashion_product_sizes_product_id ON fashion_product_sizes(fashion_product_id);
CREATE INDEX idx_fashion_product_sizes_size ON fashion_product_sizes(size);

CREATE INDEX idx_vegetable_products_category ON vegetable_products(category);
CREATE INDEX idx_vegetable_products_is_active ON vegetable_products(is_active);

CREATE INDEX idx_fruit_products_category ON fruit_products(category);
CREATE INDEX idx_fruit_products_is_active ON fruit_products(is_active);

CREATE INDEX idx_grain_products_category ON grain_products(category);
CREATE INDEX idx_grain_products_is_active ON grain_products(is_active);

CREATE INDEX idx_dairy_products_category ON dairy_products(category);
CREATE INDEX idx_dairy_products_is_active ON dairy_products(is_active);

-- Migrate existing products to appropriate tables (optional - can be done manually)
-- Insert existing fashion products
INSERT INTO fashion_products (id, name, description, price_per_unit, category, barcode, image_url, is_active, created_at, updated_at)
SELECT id, name, description, price_per_unit, category, barcode, image_url, is_active, created_at, updated_at
FROM products WHERE category = 'Fashion';

-- Insert existing vegetable products
INSERT INTO vegetable_products (id, name, description, quantity, unit, price_per_unit, category, barcode, image_url, is_active, created_at, updated_at)
SELECT id, name, description, quantity, unit, price_per_unit, category, barcode, image_url, is_active, created_at, updated_at
FROM products WHERE category = 'Vegetables';

-- Insert existing fruit products
INSERT INTO fruit_products (id, name, description, quantity, unit, price_per_unit, category, barcode, image_url, is_active, created_at, updated_at)
SELECT id, name, description, quantity, unit, price_per_unit, category, barcode, image_url, is_active, created_at, updated_at
FROM products WHERE category = 'Fruits';

-- Insert existing grain products
INSERT INTO grain_products (id, name, description, quantity, unit, price_per_unit, category, barcode, image_url, is_active, created_at, updated_at)
SELECT id, name, description, quantity, unit, price_per_unit, category, barcode, image_url, is_active, created_at, updated_at
FROM products WHERE category = 'Grains';

-- Insert existing dairy products
INSERT INTO dairy_products (id, name, description, quantity, unit, price_per_unit, category, barcode, image_url, is_active, created_at, updated_at)
SELECT id, name, description, quantity, unit, price_per_unit, category, barcode, image_url, is_active, created_at, updated_at
FROM products WHERE category = 'Dairy';

-- Copy existing fashion product sizes
INSERT INTO fashion_product_sizes (fashion_product_id, size, pieces, created_at, updated_at)
SELECT product_id, size, quantity, created_at, updated_at
FROM product_sizes 
WHERE product_id IN (SELECT id FROM products WHERE category = 'Fashion');
