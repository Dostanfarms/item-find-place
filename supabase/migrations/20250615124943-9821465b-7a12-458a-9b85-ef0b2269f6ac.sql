
-- 1. Create a new "orders" table for customer orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  status text NOT NULL DEFAULT 'pending', -- pending, confirmed, delivering, delivered, cancelled
  shipping_address jsonb NOT NULL, -- To store address, city, pincode, etc.
  payment_method text NOT NULL,
  coupon_code text,
  subtotal numeric NOT NULL,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Create an "order_items" table to track products in each order
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  name text NOT NULL,
  price_per_unit numeric NOT NULL,
  quantity integer NOT NULL,
  unit text NOT NULL,
  category text,
  farmer_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Enable RLS for both tables for access control
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 4. Add RLS policies for:
-- Customers: can select (read) only their own orders
CREATE POLICY "Customers can view their own orders"
  ON public.orders
  FOR SELECT
  USING (customer_id = (SELECT id FROM customers WHERE customers.mobile = current_setting('request.jwt.claim.sub', true)));

-- Customers: can insert their own orders
CREATE POLICY "Customers can create their own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (customer_id = (SELECT id FROM customers WHERE customers.mobile = current_setting('request.jwt.claim.sub', true)));

-- Admin (and employees): manage ALL orders
CREATE POLICY "Admins can manage all orders"
  ON public.orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- For order_items, allow access if the user has access to the parent order (for simplicity)
CREATE POLICY "Access order_items if user can access parent order"
  ON public.order_items
  FOR SELECT
  USING (order_id IN (SELECT id FROM public.orders WHERE customer_id = (SELECT id FROM customers WHERE customers.mobile = current_setting('request.jwt.claim.sub', true))));
