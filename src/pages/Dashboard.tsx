
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCoupons } from '@/hooks/useCoupons';
import { useTickets } from '@/hooks/useTickets';
import { useTransactions } from '@/hooks/useTransactions';
import { TrendingUp, Users, Package, IndianRupee, ShoppingCart, Tag, Ticket } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { coupons } = useCoupons();
  const { tickets } = useTickets();
  const { transactions } = useTransactions();

  // Calculate total value of products
  const totalProductValue = products.reduce((total, product) => {
    return total + product.price_per_unit * product.quantity;
  }, 0);

  // Calculate total sales from transactions
  const totalSales = transactions.reduce((total, transaction) => {
    return total + Number(transaction.total);
  }, 0);

  // Calculate today's sales
  const today = new Date().toDateString();
  const todaySales = transactions.filter(transaction => new Date(transaction.created_at).toDateString() === today).reduce((total, transaction) => total + Number(transaction.total), 0);

  const stats = [
    {
      title: "Total Products",
      value: products.length.toString(),
      change: `Value: ₹${totalProductValue.toFixed(2)}`,
      icon: <Package className="h-6 w-6" />
    },
    {
      title: "Total Sales",
      value: `₹${totalSales.toFixed(2)}`,
      change: `${transactions.length} transactions`,
      icon: <IndianRupee className="h-6 w-6" />
    },
    {
      title: "Today's Sales",
      value: `₹${todaySales.toFixed(2)}`,
      change: `${transactions.filter(t => new Date(t.created_at).toDateString() === today).length} transactions today`,
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      title: "Total Customers",
      value: customers.length.toString(),
      change: "+New registrations",
      icon: <Users className="h-6 w-6" />
    },
    {
      title: "Active Coupons",
      value: coupons.filter(c => c.is_active).length.toString(),
      change: `${coupons.length} total coupons`,
      icon: <Tag className="h-6 w-6" />
    },
    {
      title: "Support Tickets",
      value: tickets.length.toString(),
      change: `${tickets.filter(t => t.status === 'pending').length} pending`,
      icon: <Ticket className="h-6 w-6" />
    }
  ];

  // Handler for the new sale button
  const handleNewSaleClick = () => {
    navigate('/sales');
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to DostanFarms Dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewSaleClick} className="bg-green-600 hover:bg-green-700">
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Sale</span>
            <span className="sm:hidden">Sale</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="text-muted-foreground">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Transactions synced with Supabase</p>
                  <p className="text-xs text-muted-foreground">Real-time sales tracking</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Products synced with database</p>
                  <p className="text-xs text-muted-foreground">Inventory management active</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Customer data synchronized</p>
                  <p className="text-xs text-muted-foreground">Database connected</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Sales dashboard operational</p>
                  <p className="text-xs text-muted-foreground">Ready for transactions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* The Quick Actions card has been removed as per request */}
      </div>
    </div>
  );
};

export default Dashboard;
