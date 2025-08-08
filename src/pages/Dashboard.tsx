
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingBag, Users, TrendingUp, DollarSign } from 'lucide-react';
import FixedHeader from '@/components/layout/FixedHeader';
import ProfileChangeDialog from '@/components/profile/ProfileChangeDialog';

const Dashboard = () => {
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileMode, setProfileMode] = useState<'photo' | 'password'>('photo');

  const handleChangePhoto = () => {
    setProfileMode('photo');
    setShowProfileDialog(true);
  };

  const handleChangePassword = () => {
    setProfileMode('password');
    setShowProfileDialog(true);
  };

  // Mock data for demonstration
  const salesData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 },
  ];

  const stats = [
    {
      title: 'Total Sales',
      value: '₹45,231',
      icon: DollarSign,
      change: '+12.5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Orders',
      value: '1,234',
      icon: ShoppingBag,
      change: '+8.2%',
      changeType: 'positive' as const,
    },
    {
      title: 'Customers',
      value: '5,678',
      icon: Users,
      change: '+3.1%',
      changeType: 'positive' as const,
    },
    {
      title: 'Growth',
      value: '15.3%',
      icon: TrendingUp,
      change: '+2.4%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="pt-20">
      <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${
                  stat.changeType === 'positive' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <ProfileChangeDialog
          open={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
          mode={profileMode}
        />
      </div>
    </div>
  );
};

export default Dashboard;
