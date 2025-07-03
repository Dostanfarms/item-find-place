
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

  // Check stock availability for fashion products
  for (const item of items) {
    if (item.type === 'fashion' && item.size && item.productId) {
      const { data: sizeData, error } = await supabase
        .from('fashion_product_sizes')
        .select('pieces')
        .eq('fashion_product_id', item.productId)
        .eq('size', item.size)
        .single();

      if (error) {
        console.error('Error checking fashion product stock:', error);
        return { success: false, error: `Error checking stock for ${item.name} size ${item.size}` };
      }

      if (!sizeData || sizeData.pieces < item.quantity) {
        return { 
          success: false, 
          error: `Insufficient stock for ${item.name} size ${item.size}. Available: ${sizeData?.pieces || 0}, Requested: ${item.quantity}` 
        };
      }
    }
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
    .single();

  if (error || !order) {
    console.error('Error creating order:', error);
    return { success: false, error: error?.message || "Order creation failed" };
  }

  console.log('Order created successfully:', order);

  // Insert each item to order_items - handle fashion products differently
  const itemsToInsert = items.map((item) => ({
    order_id: order.id,
    // Only set product_id for general products, leave null for fashion products
    product_id: item.type === 'general' ? item.productId : null,
    name: item.name,
    price_per_unit: item.pricePerUnit,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    farmer_id: item.farmerId || null,
  }));

  console.log('Inserting order items:', itemsToInsert);

  const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    return { success: false, error: itemsError.message };
  }

  // Update stock for fashion products
  for (const item of items) {
    if (item.type === 'fashion' && item.size && item.productId) {
      // Get current pieces count
      const { data: currentData } = await supabase
        .from('fashion_product_sizes')
        .select('pieces')
        .eq('fashion_product_id', item.productId)
        .eq('size', item.size)
        .single();

      if (currentData) {
        const newPieces = currentData.pieces - item.quantity;
        const { error: updateError } = await supabase
          .from('fashion_product_sizes')
          .update({ pieces: Math.max(0, newPieces) })
          .eq('fashion_product_id', item.productId)
          .eq('size', item.size);

        if (updateError) {
          console.error('Error updating fashion product stock:', updateError);
          // Don't fail the order, but log the error
        }
      }
    } else if (item.type === 'general' && item.productId) {
      // Get current quantity
      const { data: currentData } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', item.productId)
        .single();

      if (currentData) {
        const newQuantity = currentData.quantity - item.quantity;
        const { error: updateError } = await supabase
          .from('products')
          .update({ quantity: Math.max(0, newQuantity) })
          .eq('id', item.productId);

        if (updateError) {
          console.error('Error updating general product stock:', updateError);
          // Don't fail the order, but log the error
        }
      }
    }
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
