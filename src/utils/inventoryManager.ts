
import { supabase } from '@/integrations/supabase/client';

export interface OrderItem {
  productId: string;
  quantity: number;
  size?: string; // For fashion products
  category: string;
}

export const updateInventoryOnOrder = async (orderItems: OrderItem[]) => {
  try {
    const results = await Promise.all(
      orderItems.map(async (item) => {
        if (item.category === 'Fashion' && item.size) {
          // For fashion products, update size-specific quantity
          const { data: currentSize, error: fetchError } = await supabase
            .from('product_sizes')
            .select('quantity')
            .eq('product_id', item.productId)
            .eq('size', item.size)
            .single();

          if (fetchError) {
            console.error('Error fetching size quantity:', fetchError);
            return { success: false, error: fetchError.message, item };
          }

          const newQuantity = Math.max(0, currentSize.quantity - item.quantity);

          const { error: updateError } = await supabase
            .from('product_sizes')
            .update({ quantity: newQuantity })
            .eq('product_id', item.productId)
            .eq('size', item.size);

          if (updateError) {
            console.error('Error updating size quantity:', updateError);
            return { success: false, error: updateError.message, item };
          }

          return { success: true, item };
        } else {
          // For regular products, update main quantity
          const { data: currentProduct, error: fetchError } = await supabase
            .from('products')
            .select('quantity')
            .eq('id', item.productId)
            .single();

          if (fetchError) {
            console.error('Error fetching product quantity:', fetchError);
            return { success: false, error: fetchError.message, item };
          }

          const newQuantity = Math.max(0, currentProduct.quantity - item.quantity);

          const { error: updateError } = await supabase
            .from('products')
            .update({ quantity: newQuantity })
            .eq('id', item.productId);

          if (updateError) {
            console.error('Error updating product quantity:', updateError);
            return { success: false, error: updateError.message, item };
          }

          return { success: true, item };
        }
      })
    );

    const failures = results.filter(result => !result.success);
    
    if (failures.length > 0) {
      console.error('Some inventory updates failed:', failures);
      return { 
        success: false, 
        error: `Failed to update inventory for ${failures.length} items`,
        failures 
      };
    }

    console.log('All inventory updates successful');
    return { success: true, results };
    
  } catch (error) {
    console.error('Error in updateInventoryOnOrder:', error);
    return { success: false, error: 'Failed to update inventory' };
  }
};
