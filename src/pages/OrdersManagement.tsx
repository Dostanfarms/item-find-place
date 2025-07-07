
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { fetchAllOrders } from "@/api/orders";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Package, MoreHorizontal, Eye, Building, Calendar as CalendarIcon, Phone as PhoneIcon } from "lucide-react";
import OrderDetailsDialog from "@/components/OrderDetailsDialog";
import BranchAssignmentDialog from "@/components/BranchAssignmentDialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import ProtectedAction from "@/components/ProtectedAction";
import { useAuth } from "@/context/AuthContext";

interface Order {
  id: string;
  customer_id: string;
  status: string;
  created_at: string;
  payment_method: string;
  total: number;
  branch_id?: string | null;
}

interface Customer {
  id: string;
  mobile: string;
}

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered"];

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "confirmed": return "bg-blue-100 text-blue-800";
    case "shipped": return "bg-purple-100 text-purple-800";
    case "delivered": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const OrdersManagement: React.FC = () => {
  const { hasPermission, currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [orderDate, setOrderDate] = useState<Date | undefined>();
  const [mobileSearch, setMobileSearch] = useState("");
  const [assignmentDialog, setAssignmentDialog] = useState<{
    open: boolean;
    orderId: string;
    currentBranchId?: string | null;
  }>({ open: false, orderId: '' });

  // Fetch all orders and related customers
  useEffect(() => {
    const fetchOrdersAndCustomers = async () => {
      setLoading(true);
      const { orders: fetchedOrders, error } = await fetchAllOrders();
      // Fetch all customers to match mobile numbers
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("id, mobile");
      if (error) {
        toast({
          title: "Error loading orders",
          description: error.message || "Could not load orders",
          variant: "destructive"
        });
      } else if (customerError) {
        toast({
          title: "Error loading customers",
          description: customerError.message || "Could not load customers",
          variant: "destructive"
        });
      } else {
        setOrders(fetchedOrders || []);
        setCustomers(customerData || []);
      }
      setLoading(false);
    };
    fetchOrdersAndCustomers();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!hasPermission('orders', 'edit')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit orders",
        variant: "destructive"
      });
      return;
    }

    setUpdatingOrderId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast({
        title: "Order status updated",
        description: `Order #${orderId.slice(-8)} set to ${newStatus}`,
      });
    }
    setUpdatingOrderId(null);
  };

  // Handle status update via dialog as well
  const handleUpdateStatusInDialog = async (newStatus: string) => {
    if (!selectedOrder) return;
    await handleStatusChange(selectedOrder.id, newStatus);
  };

  const handleAssignToBranch = (orderId: string, currentBranchId?: string | null) => {
    setAssignmentDialog({
      open: true,
      orderId,
      currentBranchId
    });
  };

  const handleAssignmentSuccess = async () => {
    // Refresh orders list
    const { orders: fetchedOrders } = await fetchAllOrders();
    setOrders(fetchedOrders || []);
    setAssignmentDialog({ open: false, orderId: '' });
  };

  // Get mobile number for customer_id
  const getCustomerMobile = (customer_id: string) => {
    return customers.find((c) => c.id === customer_id)?.mobile || "-";
  };

  // Apply Filters: by status, date, mobile search
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    // Date filter
    if (orderDate) {
      const orderDateStr = new Date(order.created_at).toLocaleDateString();
      const selectedDateStr = orderDate.toLocaleDateString();
      if (orderDateStr !== selectedDateStr) return false;
    }
    // Mobile search filter
    if (mobileSearch && mobileSearch.trim() !== "") {
      const mobile = getCustomerMobile(order.customer_id);
      if (!mobile.includes(mobileSearch.trim())) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-agri-primary" />
              <CardTitle className="text-2xl font-bold">Order Management</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-32">
                  <SelectValue>
                    {statusFilter === "all" ? "All Statuses" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem value={status} key={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Order Date Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-40 justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {orderDate ? format(orderDate, "PPP") : <span>Pick Order Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={orderDate}
                    onSelect={setOrderDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                  {orderDate && (
                    <div className="text-right mt-2">
                      <Button size="sm" variant="ghost" onClick={() => setOrderDate(undefined)}>Clear</Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              {/* Mobile Search */}
              <div className="flex items-center gap-1 border rounded px-2 py-1 bg-white">
                <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Mobile"
                  className="w-32 border-0 focus-visible:ring-0 text-base"
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  autoComplete="off"
                />
                {mobileSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 ml-2"
                    title="Clear"
                    onClick={() => setMobileSearch("")}
                  >
                    <span className="text-xs">✕</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8 text-muted-foreground">Loading orders...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">#{order.id.slice(-8)}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.payment_method === "upi" || order.payment_method === "card" ? "Online" : "Cash"}</Badge>
                      </TableCell>
                      <TableCell>₹{Number(order.total).toFixed(2)}</TableCell>
                      <TableCell>{getCustomerMobile(order.customer_id)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <ProtectedAction resource="orders" action="view">
                              <DropdownMenuItem onClick={() => {
                                setSelectedOrder(order);
                                setDetailsOpen(true);
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                            </ProtectedAction>
                            {hasPermission('orders', 'edit') && (
                              <DropdownMenuItem onClick={() => handleAssignToBranch(order.id, order.branch_id)}>
                                <Building className="h-4 w-4 mr-2" />
                                Assign to Branch
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <OrderDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        order={selectedOrder}
        onUpdateStatus={handleUpdateStatusInDialog}
        statusOptions={STATUS_OPTIONS}
      />

      {/* Branch Assignment Dialog */}
      <BranchAssignmentDialog
        open={assignmentDialog.open}
        onClose={() => setAssignmentDialog({ open: false, orderId: '' })}
        itemId={assignmentDialog.orderId}
        itemType="order"
        currentBranchId={assignmentDialog.currentBranchId}
        onSuccess={handleAssignmentSuccess}
      />
    </div>
  );
};

export default OrdersManagement;
