
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FarmerProduct {
  id: string;
  farmer_id: string;
  name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  category: string;
  payment_status: 'settled' | 'unsettled';
  transaction_image?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export const useFarmerProducts = (farmerId?: string) => {
  const [farmerProducts, setFarmerProducts] = useState<FarmerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFarmerProducts = async (targetFarmerId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('farmer_products')
        .select('*')
        .order('name', { ascending: true });

      const idToUse = targetFarmerId || farmerId;
      if (idToUse) {
        query = query.eq('farmer_id', idToUse);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching farmer products:', error);
        return;
      }

      // Ensure is_active defaults to true if missing
      const typedData = (data || []).map(item => ({
        ...item,
        payment_status: item.payment_status as 'settled' | 'unsettled',
        is_active: 'is_active' in item ? item.is_active : true,
      })) as FarmerProduct[];

      setFarmerProducts(typedData);
    } catch (error) {
      console.error('Error in fetchFarmerProducts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFarmerProduct = async (
    productData: Omit<FarmerProduct, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      console.log('Adding farmer product:', productData);
      const { data, error } = await supabase
        .from('farmer_products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        console.error('Error adding farmer product:', error);
        return { success: false, error: error.message };
      }

      console.log('Farmer product added successfully:', data);
      // Ensure is_active defaults to true if missing
      const typedData = {
        ...data,
        payment_status: data.payment_status as 'settled' | 'unsettled',
        is_active: 'is_active' in data ? data.is_active : true,
      } as FarmerProduct;

      setFarmerProducts(prev =>
        [...prev, typedData].sort((a, b) => a.name.localeCompare(b.name))
      );
      return { success: true, data: typedData };
    } catch (error) {
      console.error('Error in addFarmerProduct:', error);
      return { success: false, error: 'Failed to add farmer product' };
    }
  };

  const updateFarmerProduct = async (
    id: string,
    productData: Partial<FarmerProduct>
  ) => {
    try {
      console.log('Updating farmer product:', id, productData);

      // Create update object with only the fields that can be updated
      const updateData: any = {};

      if (productData.name !== undefined) updateData.name = productData.name;
      if (productData.quantity !== undefined)
        updateData.quantity = productData.quantity;
      if (productData.unit !== undefined) updateData.unit = productData.unit;
      if (productData.price_per_unit !== undefined)
        updateData.price_per_unit = productData.price_per_unit;
      if (productData.category !== undefined)
        updateData.category = productData.category;
      if (productData.payment_status !== undefined)
        updateData.payment_status = productData.payment_status;
      if (productData.transaction_image !== undefined)
        updateData.transaction_image = productData.transaction_image;
      if (productData.is_active !== undefined)
        updateData.is_active = productData.is_active;

      const { data, error } = await supabase
        .from('farmer_products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating farmer product:', error);
        return { success: false, error: error.message };
      }

      console.log('Farmer product updated successfully:', data);
      // Ensure is_active defaults to true if missing
      const typedData = {
        ...data,
        payment_status: data.payment_status as 'settled' | 'unsettled',
        is_active: 'is_active' in data ? data.is_active : true,
      } as FarmerProduct;

      setFarmerProducts(prev =>
        prev
          .map(product => (product.id === id ? typedData : product))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      return { success: true, data: typedData };
    } catch (error) {
      console.error('Error in updateFarmerProduct:', error);
      return { success: false, error: 'Failed to update farmer product' };
    }
  };

  useEffect(() => {
    fetchFarmerProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmerId]);

  return {
    farmerProducts,
    loading,
    fetchFarmerProducts,
    addFarmerProduct,
    updateFarmerProduct,
  };
};
