
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expiry_date: string;
  is_active: boolean;
  max_discount_limit: number | null;
  target_type: 'all' | 'customer' | 'employee';
  target_user_id: string | null;
  branch_id?: string;
  created_at: string;
  updated_at: string;
}

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching coupons:', error);
        toast({
          title: "Error",
          description: "Failed to load coupons",
          variant: "destructive"
        });
        return;
      }

      setCoupons(data || []);
    } catch (error) {
      console.error('Error in fetchCoupons:', error);
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addCoupon = async (couponData: Omit<Coupon, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const insertData = {
        ...couponData,
        branch_id: couponData.branch_id || null
      };

      const { data, error } = await supabase
        .from('coupons')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error adding coupon:', error);
        toast({
          title: "Error",
          description: "Failed to add coupon",
          variant: "destructive"
        });
        return { success: false, error };
      }

      await fetchCoupons();
      toast({
        title: "Success",
        description: `Coupon ${couponData.code} was successfully created`
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in addCoupon:', error);
      toast({
        title: "Error",
        description: "Failed to add coupon",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const updateCoupon = async (id: string, couponData: Partial<Coupon>) => {
    try {
      const updateData = {
        ...couponData,
        branch_id: couponData.branch_id || null
      };

      const { data, error } = await supabase
        .from('coupons')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating coupon:', error);
        toast({
          title: "Error",
          description: "Failed to update coupon",
          variant: "destructive"
        });
        return { success: false, error };
      }

      await fetchCoupons();
      toast({
        title: "Success",
        description: `Coupon was successfully updated`
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in updateCoupon:', error);
      toast({
        title: "Error",
        description: "Failed to update coupon",
        variant: "destructive"
      });
      return { success: false, error };
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
        toast({
          title: "Error",
          description: "Failed to delete coupon",
          variant: "destructive"
        });
        return { success: false, error };
      }

      await fetchCoupons();
      toast({
        title: "Success",
        description: "Coupon has been deleted successfully"
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error in deleteCoupon:', error);
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const validateCoupon = async (code: string, customerId?: string, employeeId?: string) => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .gte('expiry_date', new Date().toISOString())
        .single();

      if (error) {
        return { success: false, error: 'Coupon not found or expired' };
      }

      // Check target restrictions
      if (data.target_type === 'customer' && data.target_user_id !== customerId) {
        return { success: false, error: 'This coupon is not valid for your account' };
      }

      if (data.target_type === 'employee' && data.target_user_id !== employeeId) {
        return { success: false, error: 'This coupon is not valid for your account' };
      }

      return { success: true, coupon: data };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { success: false, error: 'Failed to validate coupon' };
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return {
    coupons,
    loading,
    fetchCoupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon
  };
};
