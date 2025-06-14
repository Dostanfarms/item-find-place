
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  category: string;
  barcode?: string;
  created_at: string;
  updated_at: string;
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

      setProducts(data || []);
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
      // Immediately update the local state instead of refetching
      setProducts(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return { success: true, data };
    } catch (error) {
      console.error('Error in addProduct:', error);
      return { success: false, error: 'Failed to add product' };
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      console.log('Updating product:', id, productData);
      
      // Create update object with only the fields that can be updated
      const updateData: any = {};
      
      if (productData.name !== undefined) updateData.name = productData.name;
      if (productData.quantity !== undefined) updateData.quantity = productData.quantity;
      if (productData.unit !== undefined) updateData.unit = productData.unit;
      if (productData.price_per_unit !== undefined) updateData.price_per_unit = productData.price_per_unit;
      if (productData.category !== undefined) updateData.category = productData.category;
      if (productData.barcode !== undefined) updateData.barcode = productData.barcode;

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
      // Immediately update the local state instead of refetching
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? data : product
        ).sort((a, b) => a.name.localeCompare(b.name))
      );
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
