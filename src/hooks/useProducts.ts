import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  category: string;
  barcode?: string;
  image_url?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  total_size_quantity?: number; // For fashion products
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      // For fashion products, fetch and aggregate size quantities
      const productsWithSizes = await Promise.all(
        (data || []).map(async (product) => {
          if (product.category === 'Fashion') {
            const { data: sizesData } = await supabase
              .from('product_sizes')
              .select('quantity')
              .eq('product_id', product.id);
            
            const totalSizeQuantity = sizesData?.reduce((sum, size) => sum + size.quantity, 0) || 0;
            
            return {
              ...product,
              total_size_quantity: totalSizeQuantity
            };
          }
          return product;
        })
      );

      setProducts(productsWithSizes);
    } catch (error) {
      console.error('Error in fetchProducts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adding product:', productData);
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        return { success: false, error: error.message };
      }

      console.log('Product added successfully:', data);
      await fetchProducts(); // Refresh to get updated data with size quantities
      return { success: true, data };
    } catch (error) {
      console.error('Error in addProduct:', error);
      return { success: false, error: 'Failed to add product' };
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      console.log('Updating product:', id, productData);

      // Only update fields present in the productData object
      const updateData: any = {};
      if (productData.name !== undefined) updateData.name = productData.name;
      if (productData.quantity !== undefined) updateData.quantity = productData.quantity;
      if (productData.unit !== undefined) updateData.unit = productData.unit;
      if (productData.price_per_unit !== undefined) updateData.price_per_unit = productData.price_per_unit;
      if (productData.category !== undefined) updateData.category = productData.category;
      if (productData.barcode !== undefined) updateData.barcode = productData.barcode;
      if (productData.image_url !== undefined) updateData.image_url = productData.image_url;
      if (productData.is_active !== undefined) updateData.is_active = productData.is_active;
      if (productData.description !== undefined) updateData.description = productData.description;

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
      }

      console.log('Product updated successfully:', data);
      await fetchProducts(); // Refresh to get updated data with size quantities
      return { success: true, data };
    } catch (error) {
      console.error('Error in updateProduct:', error);
      return { success: false, error: 'Failed to update product' };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    fetchProducts,
    addProduct,
    updateProduct
  };
};
