
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, CreditCard, Ticket, TrendingDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FixedHeader from '@/components/layout/FixedHeader';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

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

  const handleChangePhoto = () => {
    // TODO: Implement photo change functionality
    console.log('Change photo clicked');
  };

  const handleChangePassword = () => {
    // TODO: Implement password change functionality
    console.log('Change password clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FixedHeader 
        onChangePhoto={handleChangePhoto}
        onChangePassword={handleChangePassword}
        rightContent={
          <Button onClick={handleNewSale} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        }
      />
      
      <div className="pt-16">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {currentUser?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's your quick actions dashboard.
            </p>
          </div>

          {/* Quick Actions Card */}
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <button 
                    onClick={handleViewOrders}
                    className="p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex flex-col items-center"
                  >
                    <ShoppingCart className="h-12 w-12 text-purple-600 mb-3" />
                    <p className="text-sm font-medium">Orders</p>
                  </button>
                  <button 
                    onClick={handleViewTransactions}
                    className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex flex-col items-center"
                  >
                    <CreditCard className="h-12 w-12 text-blue-600 mb-3" />
                    <p className="text-sm font-medium">Transactions</p>
                  </button>
                  <button 
                    onClick={handleViewTickets}
                    className="p-6 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors flex flex-col items-center"
                  >
                    <Ticket className="h-12 w-12 text-orange-600 mb-3" />
                    <p className="text-sm font-medium">Tickets</p>
                  </button>
                  <button 
                    onClick={handleTodaySales}
                    className="p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex flex-col items-center"
                  >
                    <TrendingDown className="h-12 w-12 text-green-600 mb-3" />
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
