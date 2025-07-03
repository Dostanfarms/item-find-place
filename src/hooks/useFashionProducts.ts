
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FashionProductSize {
  id: string;
  fashion_product_id: string;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  pieces: number;
  created_at: string;
  updated_at: string;
}

export interface FashionProduct {
  id: string;
  name: string;
  description?: string;
  price_per_unit: number;
  category: string;
  barcode?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sizes?: FashionProductSize[];
}

export const useFashionProducts = () => {
  const [fashionProducts, setFashionProducts] = useState<FashionProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFashionProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fashion_products')
        .select(`
          *,
          fashion_product_sizes (*)
        `)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching fashion products:', error);
        return;
      }

      const productsWithSizes = (data || []).map(product => ({
        ...product,
        sizes: product.fashion_product_sizes || []
      }));

      setFashionProducts(productsWithSizes);
    } catch (error) {
      console.error('Error in fetchFashionProducts:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateUniqueBarcode = async (): Promise<string> => {
    let barcode: string;
    let isUnique = false;
    
    while (!isUnique) {
      barcode = `FAR${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Check if barcode exists in any product table
      const [fashionCheck, generalCheck] = await Promise.all([
        supabase.from('fashion_products').select('id').eq('barcode', barcode).single(),
        supabase.from('products').select('id').eq('barcode', barcode).single()
      ]);
      
      if (!fashionCheck.data && !generalCheck.data) {
        isUnique = true;
        return barcode;
      }
    }
    
    return barcode!;
  };

  const addFashionProduct = async (productData: Omit<FashionProduct, 'id' | 'created_at' | 'updated_at'>, sizes: { size: string; pieces: number }[]) => {
    try {
      console.log('Adding fashion product:', productData);
      
      const barcode = await generateUniqueBarcode();
      
      const { data: product, error: productError } = await supabase
        .from('fashion_products')
        .insert([{ ...productData, barcode }])
        .select()
        .single();

      if (productError) {
        console.error('Error adding fashion product:', productError);
        return { success: false, error: productError.message };
      }

      // Add sizes
      if (sizes.length > 0) {
        const sizesToInsert = sizes.map(size => ({
          fashion_product_id: product.id,
          size: size.size,
          pieces: size.pieces
        }));

        const { error: sizesError } = await supabase
          .from('fashion_product_sizes')
          .insert(sizesToInsert);

        if (sizesError) {
          console.error('Error adding sizes:', sizesError);
          return { success: false, error: sizesError.message };
        }
      }

      console.log('Fashion product added successfully:', product);
      await fetchFashionProducts();
      return { success: true, data: product };
    } catch (error) {
      console.error('Error in addFashionProduct:', error);
      return { success: false, error: 'Failed to add fashion product' };
    }
  };

  const updateFashionProduct = async (id: string, productData: Partial<FashionProduct>, sizes?: { size: string; pieces: number }[]) => {
    try {
      console.log('Updating fashion product:', id, productData);

      const { data: product, error: productError } = await supabase
        .from('fashion_products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (productError) {
        console.error('Error updating fashion product:', productError);
        return { success: false, error: productError.message };
      }

      // Update sizes if provided
      if (sizes) {
        // Delete existing sizes
        await supabase
          .from('fashion_product_sizes')
          .delete()
          .eq('fashion_product_id', id);

        // Insert new sizes
        if (sizes.length > 0) {
          const sizesToInsert = sizes.map(size => ({
            fashion_product_id: id,
            size: size.size,
            pieces: size.pieces
          }));

          const { error: sizesError } = await supabase
            .from('fashion_product_sizes')
            .insert(sizesToInsert);

          if (sizesError) {
            console.error('Error updating sizes:', sizesError);
            return { success: false, error: sizesError.message };
          }
        }
      }

      console.log('Fashion product updated successfully:', product);
      await fetchFashionProducts();
      return { success: true, data: product };
    } catch (error) {
      console.error('Error in updateFashionProduct:', error);
      return { success: false, error: 'Failed to update fashion product' };
    }
  };

  const updateProductSizes = async (productId: string, sizeId: string, newPieces: number) => {
    try {
      const { error } = await supabase
        .from('fashion_product_sizes')
        .update({ pieces: newPieces })
        .eq('id', sizeId);

      if (error) {
        console.error('Error updating product size:', error);
        return { success: false, error: error.message };
      }

      await fetchFashionProducts();
      return { success: true };
    } catch (error) {
      console.error('Error in updateProductSizes:', error);
      return { success: false, error: 'Failed to update product sizes' };
    }
  };

  useEffect(() => {
    fetchFashionProducts();
  }, []);

  return {
    fashionProducts,
    loading,
    fetchFashionProducts,
    addFashionProduct,
    updateFashionProduct,
    updateProductSizes
  };
};
