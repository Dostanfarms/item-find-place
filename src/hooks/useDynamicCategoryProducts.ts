
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

  const fetchProductsForCategory = async (categoryName: string) => {
    try {
      const tableName = `${categoryName.toLowerCase().replace(/\s+/g, '_')}_products`;
      
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
            };
          })
        );

        return productsWithSizes;
      } else {
        // For other categories, try to fetch from their specific table
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          console.error(`Error fetching ${categoryName} products:`, error);
          return [];
        }

        return data || [];
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
