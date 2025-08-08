
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

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
  is_active: boolean;
  branch_id?: string;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products for user:', currentUser);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      console.log('Raw products from database:', data?.length, 'items');

      // Apply branch filtering based on user's assigned branches
      let filteredProducts = data || [];
      
      if (currentUser?.role?.toLowerCase() !== 'admin') {
        const userBranchIds = currentUser?.branchIds || (currentUser?.branch_id ? [currentUser.branch_id] : []);
        console.log('Filtering products for branches:', userBranchIds);
        
        if (userBranchIds.length > 0) {
          filteredProducts = (data || []).filter(product => 
            !product.branch_id || userBranchIds.includes(product.branch_id)
          );
        } else {
          // If user has no branches assigned, show only products with no branch
          filteredProducts = (data || []).filter(product => !product.branch_id);
        }
      }

      console.log('Filtered products after branch restriction:', filteredProducts.length, 'items');
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error in fetchProducts:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateUniqueBarcode = async (branchName?: string): Promise<string> => {
    if (branchName) {
      // Use the database function for branch-specific barcode generation
      const { data, error } = await supabase.rpc('generate_branch_barcode', {
        branch_name: branchName
      });
      
      if (error) {
        console.error('Error generating branch barcode:', error);
        // Fallback to generic barcode generation
      } else if (data) {
        return data;
      }
    }
    
    // Fallback to generic barcode generation
    let barcode: string;
    let isUnique = false;
    
    while (!isUnique) {
      barcode = `GEN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Check if barcode exists in any product table
      const [generalCheck, fashionCheck] = await Promise.all([
        supabase.from('products').select('id').eq('barcode', barcode).single(),
        supabase.from('fashion_products').select('id').eq('barcode', barcode).single()
      ]);
      
      if (!generalCheck.data && !fashionCheck.data) {
        isUnique = true;
        return barcode;
      }
    }
    
    return barcode!;
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adding product:', productData);
      
      // Get branch name for barcode generation
      let branchName = null;
      if (productData.branch_id) {
        const { data: branchData } = await supabase
          .from('branches')
          .select('branch_name')
          .eq('id', productData.branch_id)
          .single();
        branchName = branchData?.branch_name;
      }
      
      const barcode = await generateUniqueBarcode(branchName);
      
      // Auto-assign branch based on user's assigned branches
      let branchId = productData.branch_id;
      if (currentUser?.role?.toLowerCase() !== 'admin') {
        const userBranchIds = currentUser?.branchIds || (currentUser?.branch_id ? [currentUser.branch_id] : []);
        if (userBranchIds.length > 0) {
          branchId = userBranchIds[0]; // Use first assigned branch as default
          console.log('Auto-assigning branch to product:', branchId);
        }
      }
      
      const insertData = {
        name: productData.name.trim(),
        description: productData.description?.trim() || null,
        quantity: Number(productData.quantity) || 0,
        unit: productData.unit.trim(),
        price_per_unit: Number(productData.price_per_unit),
        category: productData.category.trim(),
        barcode: barcode,
        image_url: productData.image_url || null,
        is_active: Boolean(productData.is_active),
        branch_id: branchId || null
      };

      console.log('Insert data for product:', insertData);

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([insertData])
        .select()
        .single();

      if (productError) {
        console.error('Error adding product:', productError);
        return { success: false, error: productError.message };
      }

      console.log('Product added successfully:', product);
      await fetchProducts();
      return { success: true, data: product };
    } catch (error) {
      console.error('Error in addProduct:', error);
      return { success: false, error: 'Failed to add product' };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentUser?.branchIds, currentUser?.branch_id]); // Re-fetch when user's branches change

  return {
    products,
    loading,
    fetchProducts,
    addProduct,
    updateProduct: async (id: string, productData: Partial<Product>) => {
      try {
        console.log('Updating product:', id, productData);

        const updateData: any = {};
        if (productData.name !== undefined) updateData.name = productData.name.trim();
        if (productData.description !== undefined) updateData.description = productData.description?.trim() || null;
        if (productData.quantity !== undefined) updateData.quantity = Number(productData.quantity);
        if (productData.unit !== undefined) updateData.unit = productData.unit.trim();
        if (productData.price_per_unit !== undefined) updateData.price_per_unit = Number(productData.price_per_unit);
        if (productData.category !== undefined) updateData.category = productData.category.trim();
        if (productData.image_url !== undefined) updateData.image_url = productData.image_url || null;
        if (productData.is_active !== undefined) updateData.is_active = Boolean(productData.is_active);
        if (productData.branch_id !== undefined) updateData.branch_id = productData.branch_id || null;

        console.log('Update data for product:', updateData);

        const { data: product, error: productError } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (productError) {
          console.error('Error updating product:', productError);
          return { success: false, error: productError.message };
        }

        console.log('Product updated successfully:', product);
        await fetchProducts();
        return { success: true, data: product };
      } catch (error) {
        console.error('Error in updateProduct:', error);
        return { success: false, error: 'Failed to update product' };
      }
    },
    deleteProduct: async (id: string) => {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting product:', error);
          return { success: false, error: error.message };
        }

        await fetchProducts();
        return { success: true };
      } catch (error) {
        console.error('Error in deleteProduct:', error);
        return { success: false, error: 'Failed to delete product' };
      }
    }
  };
};
