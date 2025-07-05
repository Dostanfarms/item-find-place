import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { useProducts } from '@/hooks/useProducts';
import { TrendingUp, ShoppingCart, Package, IndianRupee, Menu } from 'lucide-react';

const SalesDashboard = () => {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const { products } = useProducts();

  // Calculate stats
  const totalSales = transactions.reduce((sum, t) => sum + Number(t.total), 0);
  const todaysSales = transactions.filter(t => new Date(t.created_at).toDateString() === new Date().toDateString()).reduce((sum, t) => sum + Number(t.total), 0);

  // Generate weekly sales data from actual transactions
  const getWeeklySalesData = () => {
    const weeklyData = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
      
      const daySales = transactions
        .filter(t => new Date(t.created_at).toDateString() === date.toDateString())
        .reduce((sum, t) => sum + Number(t.total), 0);
      
      weeklyData.push({
        name: dayName,
        sales: daySales
      });
    }
    
    return weeklyData;
  };

  // Generate monthly sales data from actual transactions
  const getMonthlySalesData = () => {
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthSales = transactions
        .filter(t => {
          const transactionDate = new Date(t.created_at);
          return transactionDate.getMonth() === date.getMonth() && 
                 transactionDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, t) => sum + Number(t.total), 0);
      
      monthlyData.push({
        name: monthName,
        sales: monthSales
      });
    }
    
    return monthlyData;
  };

  // Get today's category-wise sales with proper discount calculation
  const getTodayCategorySales = () => {
    const today = new Date().toDateString();
    const todayTransactions = transactions.filter(t => new Date(t.created_at).toDateString() === today);
    
    const categoryMap = new Map();
    
    console.log('Today\'s transactions:', todayTransactions);
    console.log('Available products:', products);
    
    todayTransactions.forEach(transaction => {
      if (Array.isArray(transaction.items)) {
        const transactionSubtotal = Number(transaction.subtotal);
        const transactionDiscount = Number(transaction.discount);
        const transactionTotal = Number(transaction.total);
        
        // Calculate discount ratio to apply proportionally
        const discountRatio = transactionSubtotal > 0 ? (transactionSubtotal - transactionDiscount) / transactionSubtotal : 1;
        
        transaction.items.forEach(item => {
          // Find the product by name to get its category
          const product = products.find(p => p.name === item.name);
          console.log(`Looking for product: "${item.name}", found:`, product);
          
          let category;
          if (product && product.category && product.category.trim() !== '') {
            category = product.category;
          } else {
            // If product not found or has no category, skip this item or handle differently
            console.warn(`Product "${item.name}" not found in products list or has no category`);
            return; // Skip items without proper category instead of marking as Uncategorized
          }
          
          const currentValue = categoryMap.get(category) || 0;
          const itemSubtotal = Number(item.price) * Number(item.quantity);
          // Apply discount proportionally to this item
          const itemTotalAfterDiscount = itemSubtotal * discountRatio;
          
          categoryMap.set(category, currentValue + itemTotalAfterDiscount);
        });
      }
    });
    
    const result = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }));
    
    console.log('Category breakdown result:', result);
    return result;
  };

  const salesData = getWeeklySalesData();
  const monthlySalesData = getMonthlySalesData();
  const todayCategoryData = getTodayCategorySales();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold">Sales Dashboard</h1>
            <p className="text-muted-foreground">Track your sales performance</p>
          </div>
        </div>
        <Button onClick={() => navigate('/sales')} className="bg-green-600 hover:bg-green-700">
          <ShoppingCart className="h-4 w-4 mr-2" />
          New Sale
        </Button>
      </div>

      <div className="flex-1 flex flex-col gap-6 min-h-0">
        {/* Stats Cards */}
        <div className="flex-none grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalSales.toFixed(2)}</div>
              <p className="text-xs text-green-600">+20.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{todaysSales.toFixed(2)}</div>
              <p className="text-xs text-green-600">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-green-600">+5 from yesterday</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          <Card className="flex flex-col">
            <CardHeader className="flex-none">
              <CardTitle>Weekly Sales</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Sales']} />
                  <Bar dataKey="sales" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="flex-none">
              <CardTitle>Monthly Sales</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Sales']} />
                  <Bar dataKey="sales" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Today's Category Sales */}
        {todayCategoryData.length > 0 && (
          <Card className="flex-none">
            <CardHeader>
              <CardTitle>Today's Category-wise Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={todayCategoryData} 
                        cx="50%" 
                        cy="50%" 
                        labelLine={false} 
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                        outerRadius={80} 
                        fill="#8884d8" 
                        dataKey="value"
                      >
                        {todayCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Sales']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Category Breakdown</h4>
                  {todayCategoryData.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="text-sm font-medium">₹{category.value}</span>
                    </div>
                  ))}
                  <div className="mt-4 pt-2 border-t">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total</span>
                      <span>₹{todayCategoryData.reduce((sum, cat) => sum + cat.value, 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SalesDashboard;
