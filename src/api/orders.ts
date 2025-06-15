
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/contexts/CartContext";

export interface OrderPayload {
  customerId: string;
  shippingAddress: any;
  paymentMethod: string;
  couponCode: string | null;
  subtotal: number;
  discount: number;
  total: number;
  items: CartItem[];
}

export async function placeOrder(payload: OrderPayload) {
  // Insert order
  const { customerId, shippingAddress, paymentMethod, couponCode, subtotal, discount, total, items } = payload;
  
  console.log('Placing order with payload:', payload);
  
  // Validate customerId is not empty
  if (!customerId || customerId.trim() === '') {
    console.error('Customer ID is required and cannot be empty');
    return { success: false, error: "Customer ID is required" };
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert([{
      customer_id: customerId,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      coupon_code: couponCode,
      subtotal,
      discount,
      total,
      status: "pending"
    }])
    .select("id")
    .maybeSingle();

  if (error || !order) {
    console.error('Error creating order:', error);
    return { success: false, error: error?.message || "Order creation failed" };
  }

  console.log('Order created successfully:', order);

  // Insert each item to order_items
  const itemsToInsert = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId || null, // Handle case where productId might be empty
    name: item.name,
    price_per_unit: item.pricePerUnit,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    farmer_id: item.farmerId || null, // Handle case where farmerId might be empty
  }));

  console.log('Inserting order items:', itemsToInsert);

  const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    return { success: false, error: itemsError.message };
  }

  console.log('Order items inserted successfully');
  return { success: true, id: order.id };
}

export async function fetchCustomerOrders(customerId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  return { orders: data || [], error };
}

// For admin/employee: fetch all orders
export async function fetchAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return { orders: data || [], error };
}

export async function fetchOrderItems(orderId: string) {
  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  return { items: data || [], error };
}
