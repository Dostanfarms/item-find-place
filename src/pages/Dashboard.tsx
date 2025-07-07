
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCoupons } from '@/hooks/useCoupons';
import { useTickets } from '@/hooks/useTickets';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/context/AuthContext';
import {
  TrendingUp,
  Users,
  Package,
  IndianRupee,
  ShoppingCart,
  Tag,
  Ticket
} from 'lucide-react';
import FixedHeader from '@/components/layout/FixedHeader';
import ProfileChangeDialog from '@/components/profile/ProfileChangeDialog';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { coupons } = useCoupons();
  const { tickets } = useTickets();
  const { transactions } = useTransactions();
  const [showProfileDialog, setShowProfileDialog] = React.useState(false);
  const [profileMode, setProfileMode] = React.useState<'photo' | 'password'>('photo');

  const handleChangePhoto = () => {
    setProfileMode('photo');
    setShowProfileDialog(true);
  };

  const handleChangePassword = () => {
    setProfileMode('password');
    setShowProfileDialog(true);
  };

  // Filter coupons by branch for non-admin users
  const filteredCoupons = currentUser?.role?.toLowerCase() === 'admin' 
    ? coupons 
    : coupons.filter(coupon => 
        !coupon.branch_id || coupon.branch_id === currentUser?.branch_id
      );

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

  const actionButtons = [
    {
      title: "Products",
      description: `${products.length} products\nValue: ₹${totalProductValue.toFixed(2)}`,
      icon: <Package className="h-6 w-6" />,
      onClick: () => navigate('/products'),
      color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-900"
    },
    {
      title: "Sales",
      description: `₹${totalSales.toFixed(2)} total\n${transactions.length} sales`,
      icon: <IndianRupee className="h-6 w-6" />,
      onClick: () => navigate('/transactions'),
      color: "bg-green-100 hover:bg-green-200 text-green-900"
    },
    {
      title: "Today's Sales",
      description: `₹${todaySales.toFixed(2)} today`,
      icon: <TrendingUp className="h-6 w-6" />,
      onClick: () => navigate('/transactions'),
      color: "bg-blue-100 hover:bg-blue-200 text-blue-900"
    },
    {
      title: "Customers",
      description: `${customers.length} customers`,
      icon: <Users className="h-6 w-6" />,
      onClick: () => navigate('/customers'),
      color: "bg-teal-100 hover:bg-teal-200 text-teal-900"
    },
    {
      title: "Coupons",
      description: `${filteredCoupons.filter(c => c.is_active).length} active`,
      icon: <Tag className="h-6 w-6" />,
      onClick: () => navigate('/coupons'),
      color: "bg-purple-100 hover:bg-purple-200 text-purple-900"
    },
    {
      title: "Support Tickets",
      description: `${tickets.length} total\n${tickets.filter(t => t.status === 'pending').length} pending`,
      icon: <Ticket className="h-6 w-6" />,
      onClick: () => navigate('/tickets'),
      color: "bg-orange-100 hover:bg-orange-200 text-orange-900"
    }
  ];

  // Handler for the new sale button
  const handleNewSaleClick = () => {
    navigate('/sales');
  };

  return (
    <div className="pt-16">
      <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to DostanFarms Dashboard</p>
          </div>
          <Button onClick={handleNewSaleClick} className="bg-green-600 hover:bg-green-700 text-white">
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Sale</span>
            <span className="sm:hidden">Sale</span>
          </Button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {actionButtons.map((action, idx) => (
              <Button
                key={action.title}
                onClick={action.onClick}
                className={`flex flex-col items-start p-5 h-full w-full min-h-[110px] transition-all ${action.color} shadow group rounded-lg`}
              >
                <div className="mb-2">{action.icon}</div>
                <div className="font-semibold text-base">{action.title}</div>
                <div className="text-xs whitespace-pre-line text-left">{action.description}</div>
              </Button>
            ))}
          </div>
        </div>

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
