
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { fetchOrderItems } from "@/api/orders";
import { toast } from "@/hooks/use-toast";

interface Order {
  id: string;
  status: string;
  payment_method: string;
  total: number;
}

interface ProductItem {
  id: string;
  product_id: string | null;
  name: string;
  quantity: number;
  price_per_unit: number;
  unit: string;
  category: string;
}

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onUpdateStatus?: (newStatus: string) => Promise<void>;
  statusOptions: string[];
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "confirmed": return "bg-blue-100 text-blue-800";
    case "shipped": return "bg-purple-100 text-purple-800";
    case "delivered": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  open,
  onOpenChange,
  order,
  onUpdateStatus,
  statusOptions,
}) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [status, setStatus] = useState(order?.status || "pending");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (open && order?.id) {
      setLoading(true);
      fetchOrderItems(order.id).then(({ items, error }) => {
        if (error) {
          toast({ title: "Error loading order items", description: error.message, variant: "destructive" });
          setItems([]);
        } else {
          setItems(items || []);
        }
        setLoading(false);
      });
      setStatus(order.status);
    }
  }, [open, order]);

  const handleStatusUpdate = async () => {
    if (!onUpdateStatus || !order) return;
    setUpdating(true);
    try {
      await onUpdateStatus(status);
      toast({ title: "Status updated", description: `Order #${order.id.slice(-8)} updated to ${status}` });
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message || "Failed to update status", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Order Details
            <span className="ml-2 font-mono text-xs text-muted-foreground">#{order?.id?.slice(-8)}</span>
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="text-center p-4 text-muted-foreground">Loading products...</div>
        ) : (
          <>
            <div className="mb-2 flex justify-between">
              <div>Status: <Badge className={getStatusColor(status)}>{status}</Badge></div>
              <div>
                Payment: <Badge variant="outline">{order?.payment_method === "upi" || order?.payment_method === "card" ? "Online" : "Cash"}</Badge>
              </div>
            </div>
            <div className="mb-2 font-semibold">Total: ₹{Number(order?.total).toFixed(2)}</div>
            <div className="mb-4">
              <div className="font-bold mb-2">Products:</div>
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-2">Product ID</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Quantity</th>
                    <th className="border p-2">Unit</th>
                    <th className="border p-2">Unit Price</th>
                    <th className="border p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={6} className="text-center p-3 text-muted-foreground">No products found</td></tr>
                  ) : (
                    items.map(item => (
                      <tr key={item.id}>
                        <td className="border px-2 py-1 font-mono">{item.product_id ? item.product_id.slice(-8) : "-"}</td>
                        <td className="border px-2 py-1">{item.name}</td>
                        <td className="border px-2 py-1">{item.quantity}</td>
                        <td className="border px-2 py-1">{item.unit}</td>
                        <td className="border px-2 py-1">₹{Number(item.price_per_unit).toFixed(2)}</td>
                        <td className="border px-2 py-1">₹{Number(item.price_per_unit * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mb-4">
              <Label className="font-bold mb-1 block">Update Status</Label>
              <Select value={status} onValueChange={setStatus} disabled={updating}>
                <SelectTrigger className="w-40">
                  <SelectValue>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem value={opt} key={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={handleStatusUpdate} disabled={updating || !status || status === order?.status} className="w-full">
                {updating ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Label: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <label className={className}>{children}</label>
);

export default OrderDetailsDialog;
