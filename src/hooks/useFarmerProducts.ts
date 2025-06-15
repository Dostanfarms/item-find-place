
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Use the database types directly
type DatabaseFarmerProduct = Database['public']['Tables']['farmer_products']['Row'];

export interface FarmerProduct {
  id: string;
  farmer_id: string;
  farmer_mobile?: string;
  name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  category: string;
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
      console.log('Fetching farmer products for farmer:', id || 'all farmers');
      
      // Build the query - if no farmer ID provided, fetch all products
      let query = supabase
        .from('farmer_products')
        .select(`
          *,
          farmers!farmer_products_farmer_id_fkey (
            phone
          )
        `)
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

      console.log('Farmer products fetched successfully:', data?.length || 0, 'products');
      
      // Transform the data to match our interface
      const transformedProducts: FarmerProduct[] = (data || []).map((dbProduct: any) => ({
        id: dbProduct.id,
        farmer_id: dbProduct.farmer_id,
        farmer_mobile: dbProduct.farmers?.phone,
        name: dbProduct.name,
        quantity: Number(dbProduct.quantity),
        unit: dbProduct.unit,
        price_per_unit: Number(dbProduct.price_per_unit),
        category: dbProduct.category,
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
      
      // Remove farmer_mobile from the data being inserted since the column doesn't exist in DB
      const { farmer_mobile, ...dbProductData } = productData;
      
      const { data, error } = await supabase
        .from('farmer_products')
        .insert([{
          farmer_id: dbProductData.farmer_id,
          name: dbProductData.name,
          quantity: dbProductData.quantity,
          unit: dbProductData.unit,
          price_per_unit: dbProductData.price_per_unit,
          category: dbProductData.category,
          payment_status: dbProductData.payment_status,
          transaction_image: dbProductData.transaction_image,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding farmer product:', error);
        return { success: false, error: error.message };
      }

      console.log('Farmer product added successfully:', data);
      // Refresh the products list for the specific farmer
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
      
      // Remove farmer_mobile from updates since the column doesn't exist in DB
      const { farmer_mobile, ...dbUpdates } = updates;
      
      const { data, error } = await supabase
        .from('farmer_products')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating farmer product:', error);
        return { success: false, error: error.message };
      }

      console.log('Farmer product updated successfully:', data);
      // Refresh the products list for the specific farmer
      await fetchFarmerProducts(farmerId);
      return { success: true, data };
    } catch (error) {
      console.error('Error in updateFarmerProduct:', error);
      return { success: false, error: 'Failed to update farmer product' };
    }
  };

  useEffect(() => {
    console.log('Farmer ID changed, fetching products for:', farmerId || 'all farmers');
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
