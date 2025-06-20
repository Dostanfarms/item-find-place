import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  expiry_date: string;
  is_active: boolean;
  max_discount_limit: number | null;
  target_type: string;
  target_user_id: string | null;
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

      console.log('Fetched coupons:', data);
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

  const verifyMobileNumber = async (mobile: string, targetType: string) => {
    try {
      console.log('Verifying mobile number:', mobile, 'for target type:', targetType);
      
      if (targetType === 'customer') {
        const { data, error } = await supabase
          .from('customers')
          .select('id, name')
          .eq('mobile', mobile)
          .single();

        if (error) {
          console.error('Error verifying customer mobile number:', error);
          return { success: false, error: 'Customer with this mobile number not found' };
        }

        console.log('Customer mobile number verified:', data);
        return { success: true, user: data };
      } else if (targetType === 'employee') {
        const { data, error } = await supabase
          .from('employees')
          .select('id, name')
          .eq('phone', mobile)
          .single();

        if (error) {
          console.error('Error verifying employee mobile number:', error);
          return { success: false, error: 'Employee with this mobile number not found' };
        }

        console.log('Employee mobile number verified:', data);
        return { success: true, user: data };
      } else {
        return { success: false, error: 'Invalid target type' };
      }
    } catch (error) {
      console.error('Error in verifyMobileNumber:', error);
      return { success: false, error: 'Failed to verify mobile number' };
    }
  };

  const validateCouponForUser = async (couponCode: string, userMobile: string, userType: 'customer' | 'employee') => {
    try {
      console.log('Validating coupon:', couponCode, 'for user:', userMobile, 'type:', userType);
      
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Coupon not found:', error);
        return { success: false, error: 'Invalid coupon code' };
      }

      // Check if coupon is expired
      if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
        return { success: false, error: 'Coupon has expired' };
      }

      // Check if coupon is for all users
      if (coupon.target_type === 'all') {
        return { success: true, coupon };
      }

      // Check if coupon is for specific user type and matches the user
      if (coupon.target_type === userType && coupon.target_user_id === userMobile) {
        return { success: true, coupon };
      }

      return { success: false, error: 'This coupon is not valid for your account' };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { success: false, error: 'Failed to validate coupon' };
    }
  };

  const addCoupon = async (couponData: Omit<Coupon, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adding coupon to Supabase:', couponData);
      
      let finalTargetUserId = couponData.target_user_id;
      
      // If target type is customer or employee and target_user_id is provided, treat it as mobile number
      if ((couponData.target_type === 'customer' || couponData.target_type === 'employee') && couponData.target_user_id) {
        const verificationResult = await verifyMobileNumber(couponData.target_user_id, couponData.target_type);
        
        if (!verificationResult.success) {
          toast({
            title: "Error",
            description: verificationResult.error,
            variant: "destructive"
          });
          return { success: false, error: verificationResult.error };
        }
        
        // Store the mobile number as target_user_id for targeted coupons
        finalTargetUserId = couponData.target_user_id;
        
        toast({
          title: "Mobile Verified",
          description: `Coupon will be created for ${verificationResult.user?.name}`,
        });
      }
      
      const { data, error } = await supabase
        .from('coupons')
        .insert([{
          code: couponData.code,
          discount_type: couponData.discount_type,
          discount_value: Number(couponData.discount_value),
          expiry_date: couponData.expiry_date,
          is_active: couponData.is_active,
          max_discount_limit: couponData.max_discount_limit ? Number(couponData.max_discount_limit) : null,
          target_type: couponData.target_type,
          target_user_id: finalTargetUserId
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding coupon:', error);
        toast({
          title: "Error",
          description: `Failed to add coupon: ${error.message}`,
          variant: "destructive"
        });
        return { success: false, error };
      }

      console.log('Coupon added successfully:', data);
      await fetchCoupons();
      toast({
        title: "Success",
        description: `Coupon ${couponData.code} was successfully added`
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
      console.log('Updating coupon:', id, couponData);
      
      const updateData: any = {};
      if (couponData.code !== undefined) updateData.code = couponData.code;
      if (couponData.discount_type !== undefined) updateData.discount_type = couponData.discount_type;
      if (couponData.discount_value !== undefined) updateData.discount_value = Number(couponData.discount_value);
      if (couponData.expiry_date !== undefined) updateData.expiry_date = couponData.expiry_date;
      if (couponData.is_active !== undefined) updateData.is_active = couponData.is_active;
      if (couponData.max_discount_limit !== undefined) updateData.max_discount_limit = couponData.max_discount_limit ? Number(couponData.max_discount_limit) : null;
      if (couponData.target_type !== undefined) updateData.target_type = couponData.target_type;
      if (couponData.target_user_id !== undefined) updateData.target_user_id = couponData.target_user_id;

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
          description: `Failed to update coupon: ${error.message}`,
          variant: "destructive"
        });
        return { success: false, error };
      }

      await fetchCoupons();
      toast({
        title: "Success",
        description: "Coupon was successfully updated"
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
          description: `Failed to delete coupon: ${error.message}`,
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
    verifyMobileNumber,
    validateCouponForUser
  };
};
