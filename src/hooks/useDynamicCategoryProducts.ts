
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useCategories';

export interface DynamicProduct {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  unit?: string;
  price_per_unit: number;
  category: string;
  barcode?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Fashion specific
  sizes?: Array<{
    id: string;
    size: string;
    pieces: number;
  }>;
  total_pieces?: number;
}

export const useDynamicCategoryProducts = () => {
  const { categories } = useCategories();
  const [productsByCategory, setProductsByCategory] = useState<Record<string, DynamicProduct[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchProductsForCategory = async (categoryName: string): Promise<DynamicProduct[]> => {
    try {
      // Special handling for fashion products (with sizes)
      if (categoryName.toLowerCase() === 'fashion') {
        const { data: fashionData, error: fashionError } = await supabase
          .from('fashion_products')
          .select('*')
          .order('name', { ascending: true });

        if (fashionError) {
          console.error(`Error fetching fashion products:`, fashionError);
          return [];
        }

        // Fetch sizes for each fashion product
        const productsWithSizes = await Promise.all(
          (fashionData || []).map(async (product) => {
            const { data: sizesData } = await supabase
              .from('fashion_product_sizes')
              .select('*')
              .eq('fashion_product_id', product.id)
              .order('size');

            const totalPieces = sizesData?.reduce((sum, size) => sum + size.pieces, 0) || 0;

            return {
              ...product,
              sizes: sizesData || [],
              total_pieces: totalPieces
            } as DynamicProduct;
          })
        );

        return productsWithSizes;
      } else {
        // For other categories, use specific table queries
        let data: any[] = [];
        
        if (categoryName.toLowerCase() === 'vegetables') {
          const { data: vegData, error } = await supabase
            .from('vegetable_products')
            .select('*')
            .order('name', { ascending: true });
          if (error) throw error;
          data = vegData || [];
        } else if (categoryName.toLowerCase() === 'fruits') {
          const { data: fruitData, error } = await supabase
            .from('fruit_products')
            .select('*')
            .order('name', { ascending: true });
          if (error) throw error;
          data = fruitData || [];
        } else if (categoryName.toLowerCase() === 'grains') {
          const { data: grainData, error } = await supabase
            .from('grain_products')
            .select('*')
            .order('name', { ascending: true });
          if (error) throw error;
          data = grainData || [];
        } else if (categoryName.toLowerCase() === 'dairy') {
          const { data: dairyData, error } = await supabase
            .from('dairy_products')
            .select('*')
            .order('name', { ascending: true });
          if (error) throw error;
          data = dairyData || [];
        } else {
          // For new categories, try to use RPC function to query dynamically
          console.log(`No specific handler for category: ${categoryName}`);
          return [];
        }

        return data.map(item => ({
          ...item,
          quantity: item.quantity || 0,
          unit: item.unit || 'piece'
        })) as DynamicProduct[];
      }
    } catch (error) {
      console.error(`Error in fetchProductsForCategory for ${categoryName}:`, error);
      return [];
    }
  };

  const fetchAllProducts = async () => {
    setLoading(true);
    const productsData: Record<string, DynamicProduct[]> = {};

    // Fetch products for each active category
    for (const category of categories) {
      if (category.is_active) {
        const products = await fetchProductsForCategory(category.name);
        productsData[category.name] = products;
      }
    }

    setProductsByCategory(productsData);
    setLoading(false);
  };

  useEffect(() => {
    if (categories.length > 0) {
      fetchAllProducts();
    }
  }, [categories]);

  // Get all products combined
  const getAllProducts = () => {
    return Object.values(productsByCategory).flat();
  };

  // Get products for a specific category
  const getProductsByCategory = (categoryName: string) => {
    return productsByCategory[categoryName] || [];
  };

  // Get product counts by category
  const getProductCounts = () => {
    const counts: Record<string, number> = {};
    Object.entries(productsByCategory).forEach(([category, products]) => {
      counts[category] = products.length;
    });
    return counts;
  };

  return {
    productsByCategory,
    loading,
    getAllProducts,
    getProductsByCategory,
    getProductCounts,
    refetch: fetchAllProducts
  };
};
