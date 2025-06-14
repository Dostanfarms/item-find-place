
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CustomerCoupon {
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

export const useCustomerCoupons = (customerMobile?: string) => {
  const [coupons, setCoupons] = useState<CustomerCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomerCoupons = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (customerMobile) {
        // Filter coupons: either for all users OR specifically for this customer
        query = query.or(`target_type.eq.all,and(target_type.eq.customer,target_user_id.eq.${customerMobile})`);
      } else {
        // If no customer mobile provided, only show 'all' type coupons
        query = query.eq('target_type', 'all');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching customer coupons:', error);
        toast({
          title: "Error",
          description: "Failed to load available coupons",
          variant: "destructive"
        });
        return;
      }

      console.log('Fetched customer coupons:', data);
      setCoupons(data || []);
    } catch (error) {
      console.error('Error in fetchCustomerCoupons:', error);
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerCoupons();
  }, [customerMobile]);

  return {
    coupons,
    loading,
    fetchCustomerCoupons
  };
};
