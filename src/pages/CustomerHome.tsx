
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, User, LogOut, List, Ticket } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const CustomerHome = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    const currentCustomer = localStorage.getItem('currentCustomer');
    if (!currentCustomer) {
      navigate('/customer-login');
      return;
    }
    setCustomer(JSON.parse(currentCustomer));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentCustomer');
    navigate('/customer-login');
  };

  const handleProfileClick = () => {
    navigate('/customer-profile');
  };

  const handleTicketsClick = () => {
    navigate('/customer-tickets');
  };

  const handleOrdersClick = () => {
    navigate('/customer-orders');
  };

  if (!customer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-agri-primary" />
            <span className="text-lg font-bold">DostanFarms</span>
          </div>
          
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={customer.profile_photo} alt={customer.name} />
                  <AvatarFallback>
                    {customer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem onClick={handleProfileClick}>
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTicketsClick}>
                <Ticket className="mr-2 h-4 w-4" />
                <span>Support Tickets</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOrdersClick}>
                <List className="mr-2 h-4 w-4" />
                <span>My Orders</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Welcome Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Welcome, {customer.name}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Mobile: {customer.mobile}</p>
            <p className="text-muted-foreground">Email: {customer.email}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerHome;
