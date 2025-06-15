
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Use the database types directly
type DatabaseFarmerProduct = Database['public']['Tables']['farmer_products']['Row'];

export interface FarmerProduct {
  id: string;
  farmer_id: string;
  name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  category: string;
  barcode?: string;
  payment_status: 'settled' | 'unsettled';
  transaction_image?: string;
  created_at: string;
  updated_at: string;
}

export const useFarmerProducts = (farmerId?: string) => {
  const [products, setProducts] = useState<FarmerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFarmerProducts = useCallback(async (id?: string) => {
    try {
      setLoading(true);
      console.log('Fetching farmer products...', id ? `for farmer: ${id}` : 'for all farmers');
      
      let query = supabase
        .from('farmer_products')
        .select('*')
        .order('created_at', { ascending: false });

      // Only filter by farmer_id if one is provided
      if (id) {
        query = query.eq('farmer_id', id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching farmer products:', error);
        return;
      }

      console.log('Farmer products fetched successfully:', data);
      
      // Transform the data to match our interface
      const transformedProducts: FarmerProduct[] = (data || []).map((dbProduct: DatabaseFarmerProduct) => ({
        id: dbProduct.id,
        farmer_id: dbProduct.farmer_id,
        name: dbProduct.name,
        quantity: Number(dbProduct.quantity),
        unit: dbProduct.unit,
        price_per_unit: Number(dbProduct.price_per_unit),
        category: dbProduct.category,
        barcode: dbProduct.barcode || undefined,
        payment_status: dbProduct.payment_status as 'settled' | 'unsettled',
        transaction_image: dbProduct.transaction_image || undefined,
        created_at: dbProduct.created_at,
        updated_at: dbProduct.updated_at,
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error in fetchFarmerProducts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addFarmerProduct = async (productData: Omit<FarmerProduct, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adding farmer product:', productData);
      
      const { data, error } = await supabase
        .from('farmer_products')
        .insert([{
          farmer_id: productData.farmer_id,
          name: productData.name,
          quantity: productData.quantity,
          unit: productData.unit,
          price_per_unit: productData.price_per_unit,
          category: productData.category,
          barcode: productData.barcode,
          payment_status: productData.payment_status,
          transaction_image: productData.transaction_image,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding farmer product:', error);
        return { success: false, error: error.message };
      }

      console.log('Farmer product added successfully:', data);
      // Refresh the products list
      await fetchFarmerProducts(farmerId);
      return { success: true, data };
    } catch (error) {
      console.error('Error in addFarmerProduct:', error);
      return { success: false, error: 'Failed to add farmer product' };
    }
  };

  const updateFarmerProduct = async (id: string, updates: Partial<FarmerProduct>) => {
    try {
      console.log('Updating farmer product:', id, updates);
      
      const { data, error } = await supabase
        .from('farmer_products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating farmer product:', error);
        return { success: false, error: error.message };
      }

      console.log('Farmer product updated successfully:', data);
      // Refresh the products list
      await fetchFarmerProducts(farmerId);
      return { success: true, data };
    } catch (error) {
      console.error('Error in updateFarmerProduct:', error);
      return { success: false, error: 'Failed to update farmer product' };
    }
  };

  useEffect(() => {
    fetchFarmerProducts(farmerId);
  }, [fetchFarmerProducts, farmerId]);

  return {
    products,
    loading,
    fetchFarmerProducts,
    addFarmerProduct,
    updateFarmerProduct
  };
};
