
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@/components/ui/sidebar';
import { LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const UserSection = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Redirect to employee login after logout
    window.location.href = '/employee-login';
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Access</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {currentUser ? (
            <>
              <SidebarMenuItem>
                <div className="px-4 py-2 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">{currentUser.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{currentUser.role} Role</p>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="flex items-center gap-3 w-full text-destructive hover:text-destructive">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/employee-login" 
                    className={`flex items-center gap-3 ${
                      location.pathname === '/employee-login' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                    }`}
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Employee Login</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/farmer-login" 
                    className={`flex items-center gap-3 ${
                      location.pathname === '/farmer-login' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                    }`}
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Farmer Login</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default UserSection;
