
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Sprout,
  Receipt,
  Ticket,
  Tag,
  Images,
  Building2,
  UserCheck,
  Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProtectedComponent from '@/components/ProtectedComponent';

const Sidebar = () => {
  const location = useLocation();
  const { hasPermission } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/dashboard',
      resource: 'dashboard',
      action: 'view'
    },
    {
      icon: Package,
      label: 'Products',
      path: '/products',
      resource: 'products',
      action: 'view'
    },
    {
      icon: ShoppingCart,
      label: 'Orders',
      path: '/orders',
      resource: 'orders',
      action: 'view'
    },
    {
      icon: Users,
      label: 'Customers',
      path: '/customers',
      resource: 'customers',
      action: 'view'
    },
    {
      icon: Sprout,
      label: 'Farmers',
      path: '/farmers',
      resource: 'farmers',
      action: 'view'
    },
    {
      icon: Receipt,
      label: 'Transactions',
      path: '/transactions',
      resource: 'transactions',
      action: 'view'
    },
    {
      icon: Receipt,
      label: 'Settlements',
      path: '/settlements',
      resource: 'settlements',
      action: 'view'
    },
    {
      icon: Ticket,
      label: 'Tickets',
      path: '/tickets',
      resource: 'tickets',
      action: 'view'
    }
  ];

  const masterItems = [
    {
      icon: Tag,
      label: 'Categories',
      path: '/categories',
      resource: 'categories',
      action: 'view'
    },
    {
      icon: Tag,
      label: 'Coupons',
      path: '/coupons',
      resource: 'coupons',
      action: 'view'
    },
    {
      icon: Images,
      label: 'Banners',
      path: '/banners',
      resource: 'banners',
      action: 'view'
    }
  ];

  const adminItems = [
    {
      icon: Building2,
      label: 'Branches',
      path: '/branches',
      resource: 'branches',
      action: 'view'
    },
    {
      icon: UserCheck,
      label: 'Employees',
      path: '/employees',
      resource: 'employees',
      action: 'view'
    },
    {
      icon: Shield,
      label: 'Roles',
      path: '/roles',
      resource: 'roles',
      action: 'view'
    }
  ];

  return (
    <div className="w-64 bg-white border-r flex flex-col h-full">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800">AgriPay</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <nav className="px-4 space-y-2">
          {/* Main Navigation */}
          {navItems.map((item) => (
            <ProtectedComponent 
              key={item.path}
              resource={item.resource} 
              action={item.action}
            >
              <Link to={item.path}>
                <Button
                  variant={isActive(item.path) ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            </ProtectedComponent>
          ))}

          {/* Masters Section */}
          {masterItems.some(item => hasPermission(item.resource, item.action)) && (
            <>
              <Separator className="my-4" />
              <div className="px-2 py-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Masters
                </h3>
              </div>
              {masterItems.map((item) => (
                <ProtectedComponent 
                  key={item.path}
                  resource={item.resource} 
                  action={item.action}
                >
                  <Link to={item.path}>
                    <Button
                      variant={isActive(item.path) ? 'default' : 'ghost'}
                      className="w-full justify-start"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                </ProtectedComponent>
              ))}
            </>
          )}

          {/* Admin Section */}
          {adminItems.some(item => hasPermission(item.resource, item.action)) && (
            <>
              <Separator className="my-4" />
              <div className="px-2 py-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Administration
                </h3>
              </div>
              {adminItems.map((item) => (
                <ProtectedComponent 
                  key={item.path}
                  resource={item.resource} 
                  action={item.action}
                >
                  <Link to={item.path}>
                    <Button
                      variant={isActive(item.path) ? 'default' : 'ghost'}
                      className="w-full justify-start"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                </ProtectedComponent>
              ))}
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
