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

  // Render print-friendly billing - Show all customer info fields, with extracted parts
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

  // Render print-friendly shipping - Show all shipping fields with clear labels, including landmark if available
  function renderPrintableShipping(order: Order | null, customer: CustomerInfo | null) {
    const addr = order?.shipping_address || {};
    const customerParts = extractAddressParts(customer?.address);

    return (
      `<div style="margin-bottom:8px; font-size:15px;">
        <div><b>Name:</b> ${addr.name ?? customer?.name ?? "-"}</div>
        <div><b>Mobile:</b> ${addr.mobile ?? customer?.mobile ?? "-"}</div>
        <div><b>Address:</b> ${addr.address ?? customerParts.address}</div>
        ${
          addr.landmark
            ? `<div><b>Landmark:</b> ${addr.landmark}</div>`
            : ""
        }
        <div><b>City:</b> ${addr.city ?? customerParts.city}</div>
        <div><b>State:</b> ${addr.state ?? customerParts.state}</div>
        <div><b>Pincode:</b> ${addr.pincode ?? customer?.pincode ?? "-"}</div>
      </div>`
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
            {/* CUSTOMER INFO (modal dialog, not print) */}
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
              {/* --- Updated Shipping Address: NOW formatted vertically, clear spacing/labels --- */}
              <div className="mt-2 font-bold">Shipping Address</div>
              <div className="p-2 bg-gray-50 rounded border border-gray-200 my-1 space-y-1">
                {order && order.shipping_address ? (
                  <>
                    {order.shipping_address.name && <div><b>Name:</b> {order.shipping_address.name}</div>}
                    {order.shipping_address.address && <div><b>Address:</b> {order.shipping_address.address}</div>}
                    {order.shipping_address.city && <div><b>City:</b> {order.shipping_address.city}</div>}
                    {order.shipping_address.state && <div><b>State:</b> {order.shipping_address.state}</div>}
                    {order.shipping_address.pincode && <div><b>Pincode:</b> {order.shipping_address.pincode}</div>}
                    {order.shipping_address.mobile && <div><b>Mobile:</b> {order.shipping_address.mobile}</div>}
                    {!order.shipping_address.name && !order.shipping_address.address && !order.shipping_address.city && !order.shipping_address.state && !order.shipping_address.pincode && !order.shipping_address.mobile && (
                      <pre className="text-xs">{JSON.stringify(order.shipping_address, null, 2)}</pre>
                    )}
                  </>
                ) : (
                  <div className="text-muted-foreground">No shipping address available.</div>
                )}
              </div>
            </div>
            
            {/* --- Printable sections --- */}
            {/* Printable SHIPPING section */}
            <div style={{ display: "none" }}>
              <div ref={shippingRef}>
                <div style={{
                  fontFamily: 'sans-serif',
                  maxWidth: 420,
                  border: '1px solid #dee2e6',
                  borderRadius: 8,
                  padding: 18,
                  margin: '0 auto'
                }}>
                  <h2 style={{
                    textAlign: 'center',
                    fontSize: 20,
                    marginBottom: 14,
                    letterSpacing: "0.5px"
                  }}>
                    Shipping Address
                  </h2>
                  <div style={{
                    lineHeight: 1.65,
                    fontSize: 15,
                    marginBottom: 8
                  }} dangerouslySetInnerHTML={{ __html: renderPrintableShipping(order, customer) }} />
                </div>
              </div>
            </div>
            {/* Printable INVOICE section (updated to show all customer data) */}
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
                        <b>Date:</b> {order && "created_at" in order && order.created_at ? new Date(order.created_at as string).toLocaleDateString() : "-"}
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
                  {/* Products Table */}
                  <div>
                    <h3 style={{ margin: "18px 0 8px", fontSize: 16, fontWeight: "bold" }}>Products</h3>
                    <table style={{
                      borderCollapse: "collapse",
                      width: "100%",
                      marginBottom: 12,
                      fontSize: 14
                    }}>
                      <thead>
                        <tr style={{ background: "#f8f9fa" }}>
                          <th style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "left" }}>Product ID</th>
                          <th style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "left" }}>Name</th>
                          <th style={{ border: "1px solid #ccc", padding: "6px 8px" }}>Qty</th>
                          <th style={{ border: "1px solid #ccc", padding: "6px 8px" }}>Unit</th>
                          <th style={{ border: "1px solid #ccc", padding: "6px 8px" }}>Unit Price</th>
                          <th style={{ border: "1px solid #ccc", padding: "6px 8px" }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: "center", padding: 12, color: "#888" }}>No products found</td>
                          </tr>
                        ) : (
                          items.map(item => (
                            <tr key={item.id}>
                              <td style={{ border: "1px solid #ccc", padding: "6px 8px", fontFamily: "monospace" }}>
                                {item.product_id ? item.product_id.slice(-8) : "-"}
                              </td>
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

            {/* PRODUCTS TABLE (Modal, not print) */}
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
