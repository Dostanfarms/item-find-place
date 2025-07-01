
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductSize {
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  quantity: number;
}

export interface ProductSizeData {
  id: string;
  product_id: string;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
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
        size: item.size as 'S' | 'M' | 'L' | 'XL' | 'XXL',
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

      // Then insert new sizes
      if (sizes.length > 0) {
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

  return {
    loading,
    fetchProductSizes,
    saveProductSizes
  };
};
