
-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'piece',
  price_per_unit DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  farmer_id UUID,
  barcode TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  mobile TEXT NOT NULL,
  address TEXT,
  pincode TEXT,
  password TEXT NOT NULL,
  profile_photo TEXT,
  date_joined TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create farmers table
CREATE TABLE public.farmers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  address TEXT,
  state TEXT,
  district TEXT,
  village TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  profile_photo TEXT,
  date_joined TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_discount_limit DECIMAL(10,2),
  target_type TEXT NOT NULL DEFAULT 'all',
  target_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_type TEXT NOT NULL,
  user_contact TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to TEXT,
  resolution TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some default categories
INSERT INTO public.categories (name, description, is_active) VALUES
('Vegetables', 'Fresh vegetables and produce', true),
('Fruits', 'Fresh fruits and seasonal produce', true),
('Grains', 'Rice, wheat, and other grains', true),
('Dairy', 'Milk products and dairy items', true);

-- Insert some sample products for the e-commerce store
INSERT INTO public.products (name, quantity, unit, price_per_unit, category, barcode) VALUES
('Organic Tomatoes', 100, 'kg', 80.00, 'Vegetables', 'VEG001'),
('Fresh Apples', 50, 'kg', 150.00, 'Fruits', 'FRT001'),
('Basmati Rice', 200, 'kg', 120.00, 'Grains', 'GRN001'),
('Fresh Milk', 30, 'liter', 60.00, 'Dairy', 'DRY001'),
('Organic Carrots', 80, 'kg', 70.00, 'Vegetables', 'VEG002'),
('Bananas', 60, 'dozen', 40.00, 'Fruits', 'FRT002');

-- Enable Row Level Security for all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables (allow all operations for internal business app)
CREATE POLICY "Allow all operations on categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all operations on customers" ON public.customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on farmers" ON public.farmers FOR ALL USING (true);
CREATE POLICY "Allow all operations on coupons" ON public.coupons FOR ALL USING (true);
CREATE POLICY "Allow all operations on tickets" ON public.tickets FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_customers_mobile ON public.customers(mobile);
CREATE INDEX idx_farmers_email ON public.farmers(email);
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_tickets_status ON public.tickets(status);
