
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar
} from '@/components/ui/sidebar';
import {
  ChevronDown,
  ChevronUp,
  Receipt,
  Settings,
  UserCog,
  Package,
  ShoppingCart,
  BarChart3,
  Ticket,
  Gift,
  DollarSign,
  Tag,
  Image
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/context/AuthContext';
import { getAccessibleResources } from '@/utils/employeeData';

const ManageMenu = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const { state } = useSidebar();
  const [manageOpen, setManageOpen] = useState(false);

  useEffect(() => {
    const managePathsToCheck = ['/sales-dashboard', '/orders', '/products', '/transactions', '/coupons', '/categories', '/employees', '/tickets', '/roles', '/settlements', '/banners'];
    if (managePathsToCheck.some(path => location.pathname.startsWith(path))) {
      setManageOpen(true);
    }
  }, [location.pathname]);

  // Items in the "Manage" section - added Orders
  const manageItems = [
    {
      title: 'Orders',
      icon: Package,
      path: '/orders',
      resource: 'orders'
    },
    {
      title: 'Sales Dashboard',
      icon: BarChart3,
      path: '/sales-dashboard',
      resource: 'sales'
    },
    {
      title: 'Products',
      icon: Package,
      path: '/products',
      resource: 'products'
    },
    {
      title: 'Transactions',
      icon: Receipt,
      path: '/transactions',
      resource: 'transactions'
    },
    {
      title: 'Coupons',
      icon: Gift,
      path: '/coupons',
      resource: 'coupons'
    },
    {
      title: 'Categories',
      icon: Tag,
      path: '/categories',
      resource: 'categories'
    },
    {
      title: 'Banners',
      icon: Image,
      path: '/banners',
      resource: 'banners'
    },
    {
      title: 'Employees',
      icon: UserCog,
      path: '/employees',
      resource: 'employees'
    },
    {
      title: 'Tickets',
      icon: Ticket,
      path: '/tickets',
      resource: 'tickets'
    },
    {
      title: 'Roles',
      icon: Settings,
      path: '/roles',
      resource: 'roles'
    },
    {
      title: 'Settlements',
      icon: DollarSign,
      path: '/settlements',
      resource: 'settlements'
    }
  ];

  const accessibleResources = currentUser ? getAccessibleResources(currentUser.role) : [];
  const filteredManageItems = currentUser
    ? manageItems.filter(item => accessibleResources.includes(item.resource))
    : manageItems;

  if (filteredManageItems.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Collapsible open={manageOpen} onOpenChange={setManageOpen} className="w-full">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  className="flex items-center justify-between w-full"
                  tooltip="Manage"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    <span>Manage</span>
                  </div>
                  {manageOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {filteredManageItems.map((item) => (
                    <SidebarMenuSubItem key={item.path}>
                      <SidebarMenuSubButton asChild>
                        <Link
                          to={item.path}
                          className={location.pathname === item.path ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default ManageMenu;
