
import React from 'react';
import { LogOut, User } from 'lucide-react';
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';

const UserSection = () => {
  const { currentUser, logout } = useAuth();
  const { state } = useSidebar();

  if (!currentUser) return null;

  const handleLogout = () => {
    console.log('Logout button clicked');
    logout();
  };

  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="flex items-center gap-3 p-3"
              tooltip={currentUser.name}
            >
              <User className="h-5 w-5" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground">{currentUser.role}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout} 
              className="flex items-center gap-3 p-3 text-red-600 hover:text-red-700 hover:bg-red-50"
              tooltip="Sign Out"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default UserSection;
