
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
  Settings,
  UserCog,
  Package,
  Gift,
  Tag,
  Image
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/context/AuthContext';
import { getAccessibleResources } from '@/utils/employeeData';

const MastersMenu = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const { state } = useSidebar();
  const [mastersOpen, setMastersOpen] = useState(false);

  useEffect(() => {
    const mastersPathsToCheck = ['/products', '/category-products', '/coupons', '/categories', '/banners', '/employees', '/roles'];
    if (mastersPathsToCheck.some(path => location.pathname.startsWith(path))) {
      setMastersOpen(true);
    }
  }, [location.pathname]);

  // Items in the "Masters" section
  const mastersItems = [
    {
      title: 'Products',
      icon: Package,
      path: '/category-products',
      resource: 'products'
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
      title: 'Roles',
      icon: Settings,
      path: '/roles',
      resource: 'roles'
    }
  ];

  const accessibleResources = currentUser ? getAccessibleResources(currentUser.role) : [];
  const filteredMastersItems = currentUser
    ? mastersItems.filter(item => accessibleResources.includes(item.resource))
    : mastersItems;

  console.log('MastersMenu - Current user:', currentUser);
  console.log('MastersMenu - Accessible resources:', accessibleResources);
  console.log('MastersMenu - Filtered masters items:', filteredMastersItems);

  // Show the Masters section if user has access to any masters items
  if (!currentUser || filteredMastersItems.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Collapsible open={mastersOpen} onOpenChange={setMastersOpen} className="w-full">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  className="flex items-center justify-between w-full"
                  tooltip="Masters"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    <span>Masters</span>
                  </div>
                  {mastersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {filteredMastersItems.map((item) => (
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

export default MastersMenu;
