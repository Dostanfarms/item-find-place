import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const fetchFarmerProducts = async (id?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('farmer_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (id) {
        query = query.eq('farmer_id', id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching farmer products:', error);
        toast({
          title: "Error",
          description: "Failed to load farmer products",
          variant: "destructive"
        });
        return;
      }

      // Type assertion to ensure payment_status is properly typed
      const typedData = (data || []).map(product => ({
        ...product,
        payment_status: product.payment_status as 'settled' | 'unsettled'
      }));

      setProducts(typedData);
    } catch (error) {
      console.error('Error in fetchFarmerProducts:', error);
      toast({
        title: "Error",
        description: "Failed to load farmer products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addFarmerProduct = async (productData: Omit<FarmerProduct, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('farmer_products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        console.error('Error adding farmer product:', error);
        toast({
          title: "Error",
          description: "Failed to add product",
          variant: "destructive"
        });
        return { success: false, error };
      }

      await fetchFarmerProducts(farmerId);
      toast({
        title: "Success",
        description: `${productData.name} was successfully added`
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in addFarmerProduct:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const updateFarmerProduct = async (id: string, productData: Partial<FarmerProduct>) => {
    try {
      const { data, error } = await supabase
        .from('farmer_products')
        .update({
          name: productData.name,
          quantity: productData.quantity,
          unit: productData.unit,
          price_per_unit: productData.price_per_unit,
          category: productData.category,
          barcode: productData.barcode,
          payment_status: productData.payment_status,
          transaction_image: productData.transaction_image,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating farmer product:', error);
        toast({
          title: "Error",
          description: "Failed to update product",
          variant: "destructive"
        });
        return { success: false, error };
      }

      await fetchFarmerProducts(farmerId);
      toast({
        title: "Success",
        description: `${productData.name} was successfully updated`
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in updateFarmerProduct:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const deleteFarmerProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('farmer_products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting farmer product:', error);
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive"
        });
        return { success: false, error };
      }

      await fetchFarmerProducts(farmerId);
      toast({
        title: "Success",
        description: "Product has been deleted successfully"
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error in deleteFarmerProduct:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (farmerId) {
      fetchFarmerProducts(farmerId);
    }
  }, [farmerId]);

  return {
    products,
    loading,
    fetchFarmerProducts,
    addFarmerProduct,
    updateFarmerProduct,
    deleteFarmerProduct
  };
};
