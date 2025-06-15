
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DatabaseSettlement = Database['public']['Tables']['settlements']['Row'];
type DatabaseSettlementInsert = Database['public']['Tables']['settlements']['Insert'];
type DatabaseSettlementProduct = Database['public']['Tables']['settlement_products']['Row'];
type DatabaseSettlementProductInsert = Database['public']['Tables']['settlement_products']['Insert'];

export interface Settlement {
  id: string;
  farmer_id: string;
  total_amount: number;
  settled_amount: number;
  product_count: number;
  transaction_image?: string;
  settlement_date: string;
  settlement_method?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SettlementProduct {
  id: string;
  settlement_id: string;
  farmer_product_id: string;
  product_name: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  created_at: string;
}

export const useSettlements = () => {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettlements = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching settlements from database...');
      
      const { data, error } = await supabase
        .from('settlements')
        .select(`
          *,
          farmers (
            name,
            phone
          )
        `)
        .order('settlement_date', { ascending: false });

      if (error) {
        console.error('Error fetching settlements:', error);
        return;
      }

      console.log('Settlements fetched successfully:', data?.length || 0);
      
      const transformedSettlements: Settlement[] = (data || []).map((dbSettlement: any) => ({
        id: dbSettlement.id,
        farmer_id: dbSettlement.farmer_id,
        total_amount: Number(dbSettlement.total_amount),
        settled_amount: Number(dbSettlement.settled_amount),
        product_count: dbSettlement.product_count,
        transaction_image: dbSettlement.transaction_image,
        settlement_date: dbSettlement.settlement_date,
        settlement_method: dbSettlement.settlement_method,
        notes: dbSettlement.notes,
        created_by: dbSettlement.created_by,
        created_at: dbSettlement.created_at,
        updated_at: dbSettlement.updated_at,
      }));
      
      setSettlements(transformedSettlements);
    } catch (error) {
      console.error('Error in fetchSettlements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSettlement = async (settlementData: {
    farmer_id: string;
    total_amount: number;
    settled_amount: number;
    product_count: number;
    transaction_image?: string;
    settlement_method?: string;
    notes?: string;
    created_by?: string;
    products: Array<{
      farmer_product_id: string;
      product_name: string;
      quantity: number;
      price_per_unit: number;
      total_amount: number;
    }>;
  }) => {
    try {
      console.log('Creating settlement:', settlementData);
      
      // Create the settlement record
      const { data: settlement, error: settlementError } = await supabase
        .from('settlements')
        .insert({
          farmer_id: settlementData.farmer_id,
          total_amount: settlementData.total_amount,
          settled_amount: settlementData.settled_amount,
          product_count: settlementData.product_count,
          transaction_image: settlementData.transaction_image,
          settlement_method: settlementData.settlement_method || 'manual',
          notes: settlementData.notes,
          created_by: settlementData.created_by,
        })
        .select()
        .single();

      if (settlementError) {
        console.error('Error creating settlement:', settlementError);
        return { success: false, error: settlementError.message };
      }

      // Create settlement product records
      const settlementProducts: DatabaseSettlementProductInsert[] = settlementData.products.map(product => ({
        settlement_id: settlement.id,
        farmer_product_id: product.farmer_product_id,
        product_name: product.product_name,
        quantity: product.quantity,
        price_per_unit: product.price_per_unit,
        total_amount: product.total_amount,
      }));

      const { error: productsError } = await supabase
        .from('settlement_products')
        .insert(settlementProducts);

      if (productsError) {
        console.error('Error creating settlement products:', productsError);
        return { success: false, error: productsError.message };
      }

      console.log('Settlement created successfully:', settlement);
      await fetchSettlements(); // Refresh the settlements list
      return { success: true, data: settlement };
    } catch (error) {
      console.error('Error in createSettlement:', error);
      return { success: false, error: 'Failed to create settlement' };
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  return {
    settlements,
    loading,
    fetchSettlements,
    createSettlement
  };
};
