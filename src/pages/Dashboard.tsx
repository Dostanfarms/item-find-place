
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, Calendar, Plus, Receipt, CreditCard, Ticket, TrendingDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FixedHeader from '@/components/layout/FixedHeader';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Mock data - replace with real data from your APIs
  const stats = [
    {
      title: "Total Farmers",
      value: "156",
      icon: Users,
      change: "+12%",
      changeType: "positive" as const
    },
    {
      title: "Active Products",
      value: "2,341",
      icon: Package,
      change: "+8%",
      changeType: "positive" as const
    },
    {
      title: "Total Orders",
      value: "1,234",
      icon: ShoppingCart,
      change: "+23%",
      changeType: "positive" as const
    },
    {
      title: "Revenue",
      value: "₹45,231",
      icon: DollarSign,
      change: "+15%",
      changeType: "positive" as const
    }
  ];

  const handleNewSale = () => {
    navigate('/sales');
  };

  const handleViewOrders = () => {
    navigate('/orders-management');
  };

  const handleViewTransactions = () => {
    navigate('/transactions');
  };

  const handleViewTickets = () => {
    navigate('/tickets');
  };

  const handleTodaySales = () => {
    navigate('/sales-dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FixedHeader 
        onChangePhoto={() => {}} 
        onChangePassword={() => {}} 
        rightContent={
          <Button onClick={handleNewSale} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        }
      />
      <div className="pt-16">
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {currentUser?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your business today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-green-600">{stat.change}</span>
                    <span className="text-sm text-gray-600 ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">New farmer registered</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Product updated</p>
                      <p className="text-xs text-gray-500">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">New order received</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleViewOrders}
                    className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <ShoppingCart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Orders</p>
                  </button>
                  <button 
                    onClick={handleViewTransactions}
                    className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Transactions</p>
                  </button>
                  <button 
                    onClick={handleViewTickets}
                    className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <Ticket className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Tickets</p>
                  </button>
                  <button 
                    onClick={handleTodaySales}
                    className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <TrendingDown className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Today Sales</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
