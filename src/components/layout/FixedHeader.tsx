
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { User, Camera, KeyRound, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface FixedHeaderProps {
  onChangePhoto: () => void;
  onChangePassword: () => void;
  rightContent?: React.ReactNode;
}

const FixedHeader: React.FC<FixedHeaderProps> = ({ 
  onChangePhoto, 
  onChangePassword,
  rightContent 
}) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/67ff7785-0e07-470a-a478-3e19a67e7253.png" 
            alt="Dostan Mart" 
            className="h-10 w-auto"
          />
        </div>
        
        <div className="flex items-center gap-4">
          {rightContent}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser?.profile_photo} alt={currentUser?.name} />
                  <AvatarFallback>
                    {currentUser?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>{currentUser?.name}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onChangePhoto}>
                <Camera className="mr-2 h-4 w-4" />
                <span>Change Photo</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onChangePassword}>
                <KeyRound className="mr-2 h-4 w-4" />
                <span>Change Password</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default FixedHeader;
