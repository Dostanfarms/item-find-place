
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductSize {
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  quantity: number;
}

export interface ProductSizeData {
  id: string;
  product_id: string;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  quantity: number;
  created_at: string;
  updated_at: string;
}

export const useProductSizes = () => {
  const [loading, setLoading] = useState(false);

  const fetchProductSizes = async (productId: string): Promise<ProductSize[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_sizes')
        .select('*')
        .eq('product_id', productId)
        .order('size');

      if (error) {
        console.error('Error fetching product sizes:', error);
        return [];
      }

      return (data || []).map(item => ({
        size: item.size as 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL',
        quantity: item.quantity
      }));
    } catch (error) {
      console.error('Error in fetchProductSizes:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const saveProductSizes = async (productId: string, sizes: ProductSize[]) => {
    try {
      setLoading(true);

      // First, delete existing sizes for this product
      const { error: deleteError } = await supabase
        .from('product_sizes')
        .delete()
        .eq('product_id', productId);

      if (deleteError) {
        console.error('Error deleting existing sizes:', deleteError);
        return { success: false, error: deleteError.message };
      }

      // Then insert new sizes (only those with quantity > 0)
      const sizesToInsert = sizes.filter(size => size.quantity > 0);
      
      if (sizesToInsert.length > 0) {
        const sizesToInsert = sizes.map(size => ({
          product_id: productId,
          size: size.size,
          quantity: size.quantity
        }));

        const { error: insertError } = await supabase
          .from('product_sizes')
          .insert(sizesToInsert);

        if (insertError) {
          console.error('Error inserting sizes:', insertError);
          return { success: false, error: insertError.message };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error in saveProductSizes:', error);
      return { success: false, error: 'Failed to save product sizes' };
    } finally {
      setLoading(false);
    }
  };

  const updateSizeQuantity = async (productId: string, size: string, quantityChange: number) => {
    try {
      const { data: currentSize, error: fetchError } = await supabase
        .from('product_sizes')
        .select('quantity')
        .eq('product_id', productId)
        .eq('size', size)
        .single();

      if (fetchError) {
        console.error('Error fetching current size quantity:', fetchError);
        return { success: false, error: fetchError.message };
      }

      const newQuantity = Math.max(0, currentSize.quantity + quantityChange);

      const { error: updateError } = await supabase
        .from('product_sizes')
        .update({ quantity: newQuantity })
        .eq('product_id', productId)
        .eq('size', size);

      if (updateError) {
        console.error('Error updating size quantity:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateSizeQuantity:', error);
      return { success: false, error: 'Failed to update size quantity' };
    }
  };

  return {
    loading,
    fetchProductSizes,
    saveProductSizes,
    updateSizeQuantity
  };
};
