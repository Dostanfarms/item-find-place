import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Wallet, RotateCcw, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RevenueStats {
  totalRevenue: number;
  settledToSellers: number;
  refundedToUsers: number;
  totalProfit: number;
  deliveryFees: number;
  platformFees: number;
  gstCollected: number;
}

const Revenue = () => {
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    settledToSellers: 0,
    refundedToUsers: 0,
    totalProfit: 0,
    deliveryFees: 0,
    platformFees: 0,
    gstCollected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueStats();
  }, []);

  const fetchRevenueStats = async () => {
    try {
      // Fetch all delivered orders for revenue calculation
      const { data: deliveredOrders, error: ordersError } = await supabase
        .from("orders")
        .select("total_amount, delivery_fee, platform_fee, gst_charges, items")
        .eq("status", "delivered");

      if (ordersError) throw ordersError;

      // Calculate total revenue from delivered orders
      let totalRevenue = 0;
      let deliveryFees = 0;
      let platformFees = 0;
      let gstCollected = 0;
      let totalItemsCost = 0;

      (deliveredOrders || []).forEach((order) => {
        totalRevenue += order.total_amount || 0;
        deliveryFees += order.delivery_fee || 0;
        platformFees += order.platform_fee || 0;
        gstCollected += order.gst_charges || 0;
        
        // Calculate items cost (seller_price * quantity)
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach((item: any) => {
          totalItemsCost += (item.seller_price || 0) * (item.quantity || 1);
        });
      });

      // Fetch settled amounts to sellers (completed withdrawals)
      const { data: settlements, error: settlementsError } = await supabase
        .from("seller_wallet_transactions")
        .select("amount")
        .eq("type", "withdrawal")
        .not("description", "like", "%Pending%");

      if (settlementsError) throw settlementsError;

      const settledToSellers = (settlements || []).reduce((sum, s) => sum + Math.abs(s.amount), 0);

      // Fetch refunded amounts (orders with status = refunded)
      const { data: refundedOrders, error: refundsError } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("status", "refunded");

      if (refundsError) throw refundsError;

      const refundedToUsers = (refundedOrders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);

      // Calculate profit: Platform fees + Delivery fees + (Franchise price - Seller price) markup
      // Simplified: Total revenue - (items cost paid to sellers) - refunds
      const totalProfit = platformFees + deliveryFees + gstCollected;

      setStats({
        totalRevenue,
        settledToSellers,
        refundedToUsers,
        totalProfit,
        deliveryFees,
        platformFees,
        gstCollected,
      });
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      icon: DollarSign,
      description: "All payments received from users",
      color: "bg-green-500",
      textColor: "text-green-600",
      trend: "up",
    },
    {
      title: "Settled to Sellers",
      value: stats.settledToSellers,
      icon: Wallet,
      description: "Amount paid out to sellers",
      color: "bg-blue-500",
      textColor: "text-blue-600",
      trend: "down",
    },
    {
      title: "Refunds to Users",
      value: stats.refundedToUsers,
      icon: RotateCcw,
      description: "Refunded for cancelled/rejected orders",
      color: "bg-orange-500",
      textColor: "text-orange-600",
      trend: "down",
    },
    {
      title: "Total Profit",
      value: stats.totalProfit,
      icon: TrendingUp,
      description: "Platform fees + Delivery fees + Commission + Zippy Pass",
      color: "bg-purple-500",
      textColor: "text-purple-600",
      trend: "up",
    },
  ];

  const breakdownCards = [
    {
      title: "Delivery Fees",
      value: stats.deliveryFees,
      description: "Total delivery charges collected",
    },
    {
      title: "Platform Fees",
      value: stats.platformFees,
      description: "Platform service charges",
    },
    {
      title: "GST Collected",
      value: stats.gstCollected,
      description: "Total GST on orders",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Revenue Dashboard</h2>
        <p className="text-muted-foreground text-sm">Overview of all financial metrics</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {loading ? "..." : formatCurrency(stat.value)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Breakdown */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Profit Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {breakdownCards.map((item) => (
              <div key={item.title} className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="text-xl font-semibold text-foreground">
                  {loading ? "..." : formatCurrency(item.value)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="border-border bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Earnings (After Settlements & Refunds)</p>
              <p className="text-3xl font-bold text-foreground">
                {loading ? "..." : formatCurrency(stats.totalRevenue - stats.settledToSellers - stats.refundedToUsers)}
              </p>
            </div>
            <div className="p-4 bg-primary rounded-full">
              <TrendingUp className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Revenue;
