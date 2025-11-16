import { Package, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrderTracking } from '@/contexts/OrderTrackingContext';
import { Progress } from '@/components/ui/progress';

interface OrderTrackingButtonProps {
  onClick: () => void;
}

const OrderTrackingButton = ({ onClick }: OrderTrackingButtonProps) => {
  const { activeOrder } = useOrderTracking();

  if (!activeOrder) return null;

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'Order Placed',
      accepted: 'Order Accepted',
      preparing: 'Preparing Order',
      packed: 'Order Packed',
      assigned: 'Partner Assigned',
      going_for_pickup: 'Going for Pickup',
      picked_up: 'Order Picked Up',
      going_for_delivery: 'Out for Delivery',
      delivered: 'Delivered'
    };
    return statusMap[status] || status;
  };

  const getProgress = (status: string) => {
    const progressMap: { [key: string]: number } = {
      pending: 10,
      accepted: 25,
      preparing: 40,
      packed: 55,
      assigned: 60,
      going_for_pickup: 70,
      picked_up: 80,
      going_for_delivery: 90,
      delivered: 100
    };
    return progressMap[status] || 0;
  };

  const items = Array.isArray(activeOrder.items) ? activeOrder.items : [];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <Button
        onClick={onClick}
        variant="ghost"
        className="w-full h-auto p-4 hover:bg-accent/50 rounded-none"
      >
        <div className="flex items-center gap-3 w-full">
          <div className="bg-primary/10 p-2 rounded-full">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm">{getStatusText(activeOrder.status)}</p>
              <ChevronUp className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted-foreground">
              {activeOrder.seller_name} • {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
            <Progress value={getProgress(activeOrder.status)} className="h-1 mt-2" />
          </div>
        </div>
      </Button>
    </div>
  );
};

export default OrderTrackingButton;
