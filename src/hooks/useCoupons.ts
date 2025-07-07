
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { getBranchRestrictedData } from '@/utils/employeeData';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expiry_date: string;
  is_active: boolean;
  max_discount_limit: number | null;
  target_type: 'all' | 'customer' | 'employee';
  target_user_id: string | null;
  created_at: string;
  updated_at: string;
  branch_id?: string | null;
}

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      console.log('Fetching coupons for user:', currentUser);
      
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching coupons:', error);
        return;
      }

      console.log('Raw coupons from database:', data?.length, 'items');

      // Apply branch filtering
      const filteredCoupons = getBranchRestrictedData(
        data || [], 
        currentUser?.role || '', 
        currentUser?.branch_id || null
      );

      console.log('Filtered coupons after branch restriction:', filteredCoupons.length, 'items');
      setCoupons(filteredCoupons);
    } catch (error) {
      console.error('Error in fetchCoupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCoupon = async (couponData: Omit<Coupon, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adding coupon:', couponData);
      
      // Auto-assign current user's branch if not admin
      let branchId = couponData.branch_id;
      if (currentUser?.role?.toLowerCase() !== 'admin' && currentUser?.branch_id) {
        branchId = currentUser.branch_id;
        console.log('Auto-assigning branch to coupon:', branchId);
      }
      
      const insertData = {
        ...couponData,
        branch_id: branchId || null
      };

      console.log('Insert data for coupon:', insertData);

      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .insert([insertData])
        .select()
        .single();

      if (couponError) {
        console.error('Error adding coupon:', couponError);
        return { success: false, error: couponError.message };
      }

      console.log('Coupon added successfully:', coupon);
      await fetchCoupons();
      return { success: true, data: coupon };
    } catch (error) {
      console.error('Error in addCoupon:', error);
      return { success: false, error: 'Failed to add coupon' };
    }
  };

  const updateCoupon = async (id: string, couponData: Partial<Coupon>) => {
    try {
      console.log('Updating coupon:', id, couponData);

      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', id)
        .select()
        .single();

      if (couponError) {
        console.error('Error updating coupon:', couponError);
        return { success: false, error: couponError.message };
      }

      console.log('Coupon updated successfully:', coupon);
      await fetchCoupons();
      return { success: true, data: coupon };
    } catch (error) {
      console.error('Error in updateCoupon:', error);
      return { success: false, error: 'Failed to update coupon' };
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting coupon:', error);
        return { success: false, error: error.message };
      }

      await fetchCoupons();
      return { success: true };
    } catch (error) {
      console.error('Error in deleteCoupon:', error);
      return { success: false, error: 'Failed to delete coupon' };
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [currentUser?.branch_id]);

  return {
    coupons,
    loading,
    fetchCoupons,
    addCoupon,
    updateCoupon,
    deleteCoupon
  };
};
