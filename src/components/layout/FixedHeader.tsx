
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { User, Settings, Key, LogOut, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface FixedHeaderProps {
  onChangePhoto: () => void;
  onChangePassword: () => void;
}

const FixedHeader: React.FC<FixedHeaderProps> = ({ onChangePhoto, onChangePassword }) => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-4 fixed top-0 right-0 left-0 z-50">
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 h-auto p-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={(currentUser as any).profile_photo || undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-medium">{currentUser.name}</div>
                <div className="text-xs text-gray-500">{currentUser.role}</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onChangePhoto}>
              <Camera className="h-4 w-4 mr-2" />
              Change Photo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onChangePassword}>
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

export default FixedHeader;
