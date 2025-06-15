
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, User, LogOut, Ticket } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const CustomerHome = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [currentBanner, setCurrentBanner] = useState(0);

  const banners = [
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80',
    'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80',
    'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80'
  ];

  useEffect(() => {
    const currentCustomer = localStorage.getItem('currentCustomer');
    if (!currentCustomer) {
      navigate('/customer-login');
      return;
    }
    setCustomer(JSON.parse(currentCustomer));
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

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

  if (!customer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-agri-primary" />
            <span className="text-lg font-bold">DostanFarms</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{customer.name}</span>
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
                <DropdownMenuItem onClick={() => navigate('/customer-profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/customer-tickets')}>
                  <Ticket className="mr-2 h-4 w-4" />
                  <span>Support Tickets</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/customer-order-history')}>
                  <Package className="mr-2 h-4 w-4" />
                  <span>My Orders</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  localStorage.removeItem('currentCustomer');
                  navigate('/customer-login');
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Banner Slider */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="relative overflow-hidden rounded-lg">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentBanner * 100}%)` }}
          >
            {banners.map((banner, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <img 
                  src={banner} 
                  alt={`Banner ${index + 1}`}
                  className="w-full h-55 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
          
          {/* Banner indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentBanner ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentBanner(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Content can be added here later */}
      </div>
    </div>
  );
};

export default CustomerHome;
