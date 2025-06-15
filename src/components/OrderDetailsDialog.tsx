
import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { fetchOrderItems } from "@/api/orders";
import { toast } from "@/hooks/use-toast";
import { Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  status: string;
  payment_method: string;
  total: number;
  customer_id?: string;
  shipping_address?: any;
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

interface CustomerInfo {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  address?: string | null;
  pincode?: string | null;
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

// Helper to print content by selector
function printSection(sectionRef: React.RefObject<HTMLDivElement>) {
  if (sectionRef.current) {
    const printWindow = window.open("", "_blank")!;
    printWindow.document.write(`
      <html>
      <head>
        <title>Print</title>
        <style>
          body { font-family: sans-serif; padding: 16px; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; }
          h3 { margin-top: 24px; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; background: #eee; }
        </style>
      </head>
      <body>
        ${sectionRef.current.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setTimeout(() => printWindow.close(), 800);
  }
}

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
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);

  const invoiceRef = useRef<HTMLDivElement>(null);
  const shippingRef = useRef<HTMLDivElement>(null);

  // Fetch products and customer info when dialog opens or order changes
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

      // Fetch customer info
      if (order.customer_id) {
        supabase
          .from("customers")
          .select("*")
          .eq("id", order.customer_id)
          .maybeSingle()
          .then(({ data }) => {
            setCustomer(data || null);
          });
      } else {
        setCustomer(null);
      }
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

  // Shipping address is stored as JSON, ensure we display it nicely
  function renderShippingAddress() {
    const addr = order?.shipping_address;
    if (!addr) return <div className="text-muted-foreground">No shipping address available.</div>;
    // Try to display known fields: name, street, city, state, pincode, etc.
    return (
      <div>
        {addr.name && <div><b>Name:</b> {addr.name}</div>}
        {addr.address && <div><b>Address:</b> {addr.address}</div>}
        {addr.city && <div><b>City:</b> {addr.city}</div>}
        {addr.state && <div><b>State:</b> {addr.state}</div>}
        {addr.pincode && <div><b>Pincode:</b> {addr.pincode}</div>}
        {addr.mobile && <div><b>Mobile:</b> {addr.mobile}</div>}
        {!addr.name && !addr.address && !addr.city && !addr.state && !addr.pincode && !addr.mobile && (
          <pre className="text-xs">{JSON.stringify(addr, null, 2)}</pre>
        )}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Order Details
            <span className="ml-2 font-mono text-xs text-muted-foreground">#{order?.id?.slice(-8)}</span>
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="text-center p-4 text-muted-foreground">Loading...</div>
        ) : (
          <>
            <div className="mb-2 flex flex-wrap justify-between gap-2">
              <div>
                Status: <Badge className={getStatusColor(status)}>{status}</Badge>
              </div>
              <div>
                Payment: <Badge variant="outline">{order?.payment_method === "upi" || order?.payment_method === "card" ? "Online" : "Cash"}</Badge>
              </div>
              <div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1"
                  onClick={() => printSection(shippingRef)}
                  title="Print shipping address"
                >
                  <Printer className="w-4 h-4" />
                  Print Shipping
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="gap-1 ml-2"
                  onClick={() => printSection(invoiceRef)}
                  title="Print invoice"
                >
                  <Printer className="w-4 h-4" />
                  Print Invoice
                </Button>
              </div>
            </div>
            {/* CUSTOMER INFO */}
            <div className="mb-2" ref={shippingRef}>
              <div className="font-bold mb-1">Customer Info</div>
              {customer ? (
                <div>
                  <div><b>Name:</b> {customer.name}</div>
                  <div><b>Mobile:</b> {customer.mobile}</div>
                  {customer.email && <div><b>Email:</b> {customer.email}</div>}
                  {customer.address && <div><b>Address:</b> {customer.address}{customer.pincode ? ` (${customer.pincode})` : ""}</div>}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">No customer info available.</div>
              )}
              <div className="mt-2 font-bold">Shipping Address</div>
              {renderShippingAddress()}
            </div>
            {/* PRINTABLE INVOICE (products + all info) */}
            <div style={{ display: "none" }}>
              {/* Hidden in modal, rendered for printing invoice */}
              <div ref={invoiceRef}>
                <h2>Invoice</h2>
                <div>
                  <b>Order ID:</b> #{order?.id?.slice(-8)}<br />
                  <b>Status:</b> {status}<br />
                  <b>Payment:</b> {order?.payment_method === "upi" || order?.payment_method === "card" ? "Online" : "Cash"}
                </div>
                <div style={{ marginTop: 12 }}>
                  <h3 style={{ marginBottom: 4 }}>Customer Info</h3>
                  {customer ? (
                    <div>
                      <div><b>Name:</b> {customer.name}</div>
                      <div><b>Mobile:</b> {customer.mobile}</div>
                      {customer.email && <div><b>Email:</b> {customer.email}</div>}
                      {customer.address && <div><b>Address:</b> {customer.address}{customer.pincode ? ` (${customer.pincode})` : ""}</div>}
                    </div>
                  ) : (
                    <div>No customer info available.</div>
                  )}
                  <div style={{ marginTop: 6 }}>Shipping Address:<br />{order ? JSON.stringify(order.shipping_address, null, 2) : ""}</div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <h3>Products</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Product ID</th>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={6}>No products found</td>
                        </tr>
                      ) : (
                        items.map(item => (
                          <tr key={item.id}>
                            <td>{item.product_id ? item.product_id.slice(-8) : "-"}</td>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>{item.unit}</td>
                            <td>₹{Number(item.price_per_unit).toFixed(2)}</td>
                            <td>₹{Number(item.price_per_unit * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  <div style={{ marginTop: 12, fontWeight: "bold" }}>
                    Total: ₹{Number(order?.total).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            {/* PRODUCTS TABLE */}
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
            {/* STATUS DROPDOWN + footer */}
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
