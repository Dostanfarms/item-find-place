import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserAuth } from './UserAuthContext';

interface OrderTrackingContextType {
  activeOrder: any | null;
  setActiveOrder: (order: any) => void;
  clearActiveOrder: () => void;
  refreshOrder: () => Promise<void>;
}

const OrderTrackingContext = createContext<OrderTrackingContextType | undefined>(undefined);

export const OrderTrackingProvider = ({ children }: { children: ReactNode }) => {
  const [activeOrder, setActiveOrderState] = useState<any | null>(null);
  const { user } = useUserAuth();

  // Check for active orders on mount
  useEffect(() => {
    if (user) {
      checkForActiveOrders();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('order-tracking')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newOrder = payload.new as any;
            if (newOrder && activeOrder && newOrder.id === activeOrder.id) {
              setActiveOrderState(newOrder);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, activeOrder?.id]);

  const checkForActiveOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, delivery_partners(id, name, mobile, profile_photo_url), sellers(seller_latitude, seller_longitude, seller_name)')
        .eq('user_id', user.id)
        .in('status', ['pending', 'accepted', 'preparing', 'packed', 'assigned', 'going_for_pickup', 'picked_up', 'going_for_delivery'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setActiveOrderState(data);
      }
    } catch (error) {
      console.error('Error checking for active orders:', error);
    }
  };

  const setActiveOrder = (order: any) => {
    setActiveOrderState(order);
    localStorage.setItem('activeOrderId', order.id);
  };

  const clearActiveOrder = () => {
    setActiveOrderState(null);
    localStorage.removeItem('activeOrderId');
  };

  const refreshOrder = async () => {
    if (!activeOrder) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, delivery_partners(id, name, mobile, profile_photo_url), sellers(seller_latitude, seller_longitude, seller_name)')
        .eq('id', activeOrder.id)
        .single();

      if (data && !error) {
        setActiveOrderState(data);
      }
    } catch (error) {
      console.error('Error refreshing order:', error);
    }
  };

  return (
    <OrderTrackingContext.Provider value={{ activeOrder, setActiveOrder, clearActiveOrder, refreshOrder }}>
      {children}
    </OrderTrackingContext.Provider>
  );
};

export const useOrderTracking = () => {
  const context = useContext(OrderTrackingContext);
  if (context === undefined) {
    throw new Error('useOrderTracking must be used within an OrderTrackingProvider');
  }
  return context;
};
