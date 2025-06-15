
import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  created_at?: string;
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

interface OrderSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
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

// Helper to print invoice
function printInvoice(invoiceRef: React.RefObject<HTMLDivElement>) {
  if (invoiceRef.current) {
    const printWindow = window.open("", "_blank")!;
    printWindow.document.write(`
      <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: sans-serif; padding: 16px; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; }
          h3 { margin-top: 24px; }
        </style>
      </head>
      <body>
        ${invoiceRef.current.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setTimeout(() => printWindow.close(), 800);
  }
}

const OrderSummaryDialog: React.FC<OrderSummaryDialogProps> = ({
  open,
  onOpenChange,
  order,
}) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);

  const invoiceRef = useRef<HTMLDivElement>(null);

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

  // Helper function to extract address parts
  function extractAddressParts(address?: string | null) {
    if (!address) {
      return { address: "-", city: "-", state: "-" };
    }
    const parts = address.split(",").map((p) => p.trim());
    return {
      address: parts[0] || "-",
      city: parts[1] || "-",
      state: parts[2] || "-",
    };
  }

  // Render print-friendly billing
  function renderPrintableBilling(customer: CustomerInfo | null) {
    const { address, city, state } = extractAddressParts(customer?.address);
    return (
      `<div style="margin-bottom:8px; font-size:15px;">
        <div><b>Name:</b> ${customer?.name ?? "-"}</div>
        <div><b>Mobile:</b> ${customer?.mobile ?? "-"}</div>
        <div><b>Address:</b> ${address}</div>
        <div><b>City:</b> ${city}</div>
        <div><b>State:</b> ${state}</div>
        <div><b>Pincode:</b> ${customer?.pincode ?? "-"}</div>
        ${customer?.email ? `<div><b>Email:</b> ${customer.email}</div>` : ""}
      </div>`
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              Order Summary
              <span className="ml-2 font-mono text-xs text-muted-foreground">#{order?.id?.slice(-8)}</span>
            </span>
            {order?.status?.toLowerCase() === "delivered" && (
              <Button
                size="sm"
                variant="default"
                className="gap-1"
                onClick={() => printInvoice(invoiceRef)}
                title="Print invoice"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center p-4 text-muted-foreground">Loading...</div>
        ) : (
          <>
            {/* Order Status and Payment Info */}
            <div className="mb-4 flex flex-wrap gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Status: </span>
                <Badge className={getStatusColor(order?.status || "pending")}>
                  {order?.status || "pending"}
                </Badge>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Payment: </span>
                <Badge variant="outline">
                  {order?.payment_method === "upi" || order?.payment_method === "card" ? "Online" : "Cash"}
                </Badge>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Total: </span>
                <span className="font-medium">₹{Number(order?.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Order Date */}
            <div className="mb-4">
              <span className="text-sm text-muted-foreground">Order Date: </span>
              <span>{order?.created_at ? new Date(order.created_at).toLocaleDateString() : "-"}</span>
            </div>

            {/* Shipping Address */}
            <div className="mb-4">
              <div className="font-bold mb-2">Delivery Address</div>
              <div className="p-3 bg-gray-50 rounded border space-y-1 text-sm">
                {order && order.shipping_address ? (
                  <>
                    {order.shipping_address.name && <div><b>Name:</b> {order.shipping_address.name}</div>}
                    {order.shipping_address.address && <div><b>Address:</b> {order.shipping_address.address}</div>}
                    {order.shipping_address.landmark && <div><b>Landmark:</b> {order.shipping_address.landmark}</div>}
                    {order.shipping_address.city && <div><b>City:</b> {order.shipping_address.city}</div>}
                    {order.shipping_address.state && <div><b>State:</b> {order.shipping_address.state}</div>}
                    {order.shipping_address.pincode && <div><b>Pincode:</b> {order.shipping_address.pincode}</div>}
                    {order.shipping_address.mobile && <div><b>Mobile:</b> {order.shipping_address.mobile}</div>}
                  </>
                ) : (
                  <div className="text-muted-foreground">No delivery address available.</div>
                )}
              </div>
            </div>

            {/* Products Summary */}
            <div className="mb-4">
              <div className="font-bold mb-2">Items Ordered ({items.length})</div>
              <div className="space-y-2">
                {items.length === 0 ? (
                  <div className="text-center p-3 text-muted-foreground">No items found</div>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit} × ₹{Number(item.price_per_unit).toFixed(2)}
                        </div>
                      </div>
                      <div className="font-medium">
                        ₹{Number(item.price_per_unit * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Printable Invoice (hidden) */}
            <div style={{ display: "none" }}>
              <div ref={invoiceRef}>
                <div style={{
                  fontFamily: 'sans-serif',
                  maxWidth: 600,
                  margin: '0 auto',
                  border: '1px solid #dee2e6',
                  borderRadius: 8,
                  padding: 24
                }}>
                  <h2 style={{
                    textAlign: "center",
                    marginBottom: 24,
                    fontSize: 22,
                    letterSpacing: "1px"
                  }}>
                    Invoice
                  </h2>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                      <div><b>Order ID:</b> #{order?.id?.slice(-8) || "-"}</div>
                      <div>
                        <b>Date:</b> {order?.created_at ? new Date(order.created_at).toLocaleDateString() : "-"}
                      </div>
                      <div>
                        <b>Payment:</b> {order?.payment_method === "upi" || order?.payment_method === "card" ? "Online" : "Cash"}
                      </div>
                    </div>
                    <div style={{ minWidth: 240, textAlign: "left" }}>
                      <div style={{ fontWeight: "bold", marginBottom: 4 }}>Billing Address</div>
                      <div dangerouslySetInnerHTML={{ __html: renderPrintableBilling(customer) }} />
                    </div>
                  </div>
                  
                  <div>
                    <h3 style={{ margin: "18px 0 8px", fontSize: 16, fontWeight: "bold" }}>Items</h3>
                    <table style={{
                      borderCollapse: "collapse",
                      width: "100%",
                      marginBottom: 12,
                      fontSize: 14
                    }}>
                      <thead>
                        <tr style={{ background: "#f8f9fa" }}>
                          <th style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "left" }}>Item</th>
                          <th style={{ border: "1px solid #ccc", padding: "6px 8px" }}>Qty</th>
                          <th style={{ border: "1px solid #ccc", padding: "6px 8px" }}>Unit</th>
                          <th style={{ border: "1px solid #ccc", padding: "6px 8px" }}>Unit Price</th>
                          <th style={{ border: "1px solid #ccc", padding: "6px 8px" }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: "center", padding: 12, color: "#888" }}>No items found</td>
                          </tr>
                        ) : (
                          items.map(item => (
                            <tr key={item.id}>
                              <td style={{ border: "1px solid #ccc", padding: "6px 8px" }}>{item.name}</td>
                              <td style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "right" }}>{item.quantity}</td>
                              <td style={{ border: "1px solid #ccc", padding: "6px 8px" }}>{item.unit}</td>
                              <td style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "right" }}>₹{Number(item.price_per_unit).toFixed(2)}</td>
                              <td style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "right" }}>₹{Number(item.price_per_unit * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div style={{
                    marginTop: 18,
                    textAlign: "right",
                    fontWeight: "bold",
                    fontSize: 16
                  }}>
                    Total Amount: ₹{Number(order?.total).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderSummaryDialog;
