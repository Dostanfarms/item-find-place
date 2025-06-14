
import React from 'react';
import { 
  BarChart3,
  Users,
  UserCheck
} from 'lucide-react';
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const TopLevelMenu = () => {
  const { checkPermission } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();

  const getNavClass = (path: string) => {
    const isActive = location.pathname === path;
    return isActive 
      ? "bg-muted text-primary font-medium" 
      : "hover:bg-muted/50";
  };

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      resource: "dashboard",
      action: "view" as const,
      tooltip: "Dashboard"
    },
    {
      title: "Customers",
      url: "/customers",
      icon: Users,
      resource: "customers",
      action: "view" as const,
      tooltip: "Customers"
    },
    {
      title: "Farmers",
      url: "/farmers",
      icon: UserCheck,
      resource: "farmers",
      action: "view" as const,
      tooltip: "Farmers"
    }
  ];

  const visibleMenuItems = menuItems.filter(item => 
    checkPermission(item.resource, item.action)
  );

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleMenuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.tooltip}>
                <NavLink 
                  to={item.url} 
                  className={getNavClass(item.url)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default TopLevelMenu;
