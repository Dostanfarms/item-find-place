
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Menu, User, Settings, Key, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/components/ui/sidebar';

const AdminHeader = () => {
  const { currentUser, logout } = useAuth();
  const { toggleSidebar } = useSidebar();

  if (!currentUser) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleChangePassword = () => {
    // TODO: Implement change password functionality
    console.log('Change password clicked');
  };

  const handleProfileSettings = () => {
    // TODO: Implement profile settings functionality
    console.log('Profile settings clicked');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-800">AgriPay Admin</h1>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={(currentUser as any).profile_photo || undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">{currentUser.name}</div>
                <div className="text-xs text-gray-500">{currentUser.role}</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleProfileSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleChangePassword}>
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;
