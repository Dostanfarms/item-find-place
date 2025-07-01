
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  total_pieces?: number;
}

export interface FashionProductSize {
  id: string;
  fashion_product_id: string;
  size: string;
  pieces: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryProduct {
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
}

export const useCategoryProducts = () => {
  const [fashionProducts, setFashionProducts] = useState<FashionProduct[]>([]);
  const [vegetableProducts, setVegetableProducts] = useState<CategoryProduct[]>([]);
  const [fruitProducts, setFruitProducts] = useState<CategoryProduct[]>([]);
  const [grainProducts, setGrainProducts] = useState<CategoryProduct[]>([]);
  const [dairyProducts, setDairyProducts] = useState<CategoryProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFashionProducts = async () => {
    try {
      const { data: fashionData, error: fashionError } = await supabase
        .from('fashion_products')
        .select('*')
        .order('name', { ascending: true });

      if (fashionError) {
        console.error('Error fetching fashion products:', fashionError);
        return;
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

      setFashionProducts(productsWithSizes);
    } catch (error) {
      console.error('Error in fetchFashionProducts:', error);
    }
  };

  const fetchVegetableProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('vegetable_products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching vegetable products:', error);
        return;
      }

      setVegetableProducts(data || []);
    } catch (error) {
      console.error('Error in fetchVegetableProducts:', error);
    }
  };

  const fetchFruitProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('fruit_products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching fruit products:', error);
        return;
      }

      setFruitProducts(data || []);
    } catch (error) {
      console.error('Error in fetchFruitProducts:', error);
    }
  };

  const fetchGrainProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('grain_products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching grain products:', error);
        return;
      }

      setGrainProducts(data || []);
    } catch (error) {
      console.error('Error in fetchGrainProducts:', error);
    }
  };

  const fetchDairyProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('dairy_products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching dairy products:', error);
        return;
      }

      setDairyProducts(data || []);
    } catch (error) {
      console.error('Error in fetchDairyProducts:', error);
    }
  };

  const fetchAllProducts = async () => {
    setLoading(true);
    await Promise.all([
      fetchFashionProducts(),
      fetchVegetableProducts(),
      fetchFruitProducts(),
      fetchGrainProducts(),
      fetchDairyProducts()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  return {
    fashionProducts,
    vegetableProducts,
    fruitProducts,
    grainProducts,
    dairyProducts,
    loading,
    refetch: fetchAllProducts
  };
};
