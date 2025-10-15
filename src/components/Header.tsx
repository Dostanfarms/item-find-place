import { useState, useEffect, useRef } from "react";
import { Search, MapPin, User, ShoppingCart, LogOut, CreditCard, Heart, FileText, Settings, ChevronDown, AlertCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { LoginForm } from "@/components/auth/LoginForm";
import { SearchResults } from "@/components/SearchResults";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { useUserAuth } from "@/contexts/UserAuthContext";
import { useCart } from "@/contexts/CartContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
export const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("Detecting location...");
  const [locationGranted, setLocationGranted] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<{
    label: string;
    address: string;
  } | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const {
    user,
    login,
    logout,
    isAuthenticated
  } = useUserAuth();
  const {
    getTotalItems
  } = useCart();
  const navigateToPage = useNavigate();
  useEffect(() => {
    requestLocationPermission();
    if (isAuthenticated) {
      loadSelectedAddress();
    }
  }, [isAuthenticated]);

  const loadSelectedAddress = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('label, full_address')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setSelectedAddress({
          label: data.label,
          address: data.full_address,
        });
      }
    } catch (error) {
      console.error('No saved addresses found');
    }
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const requestLocationPermission = async () => {
    if ('geolocation' in navigator) {
      try {
        const permission = await navigator.permissions.query({
          name: 'geolocation'
        });
        if (permission.state === 'granted') {
          getCurrentLocation();
        } else if (permission.state === 'prompt') {
          navigator.geolocation.getCurrentPosition(position => {
            setLocationGranted(true);
            reverseGeocode(position.coords.latitude, position.coords.longitude);
          }, error => {
            console.error('Location access denied:', error);
            setCurrentLocation("Enable location access");
            toast({
              title: "Location Access",
              description: "Please enable location access to see nearby restaurants",
              variant: "destructive"
            });
          });
        } else {
          setCurrentLocation("Location access denied");
        }
      } catch (error) {
        console.error('Error requesting location:', error);
        setCurrentLocation("Location unavailable");
      }
    } else {
      setCurrentLocation("Location not supported");
    }
  };
  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(position => {
      setLocationGranted(true);
      reverseGeocode(position.coords.latitude, position.coords.longitude);
    }, error => {
      console.error('Error getting location:', error);
      setCurrentLocation("Unable to get location");
    });
  };
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Using a simple geocoding approach - in production, you'd use a proper geocoding service
      setCurrentLocation(`${lat.toFixed(3)}, ${lng.toFixed(3)}`);

      // You can integrate with services like Google Geocoding API, OpenStreetMap Nominatim, etc.
      // For now, we'll show coordinates and a generic location
      setTimeout(() => {
        setCurrentLocation("Current Location");
      }, 1000);
    } catch (error) {
      console.error('Geocoding error:', error);
      setCurrentLocation("Location found");
    }
  };
  const handleAuthSuccess = (userData: any) => {
    login(userData);
  };
  const handleRegisterRequired = () => {
    setShowRegister(true);
  };
  const handleLogout = () => {
    logout();
  };
  return <header className="sticky top-0 z-[100] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-full">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-foreground">Door Delivery</span>
          </div>

          {/* Location */}
          <div className="hidden md:flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors" onClick={requestLocationPermission}>
            <MapPin className={`h-4 w-4 ${locationGranted || selectedAddress ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Deliver to:</span>
              <span className="font-medium text-sm flex items-center gap-1">
                {selectedAddress ? selectedAddress.label : currentLocation}
                {!locationGranted && !selectedAddress && <AlertCircle className="h-3 w-3 text-orange-500" />}
              </span>
              {selectedAddress && (
                <span className="text-xs text-muted-foreground line-clamp-1 max-w-40">
                  {selectedAddress.address.split(',')[0]}
                </span>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Search for restaurants, cuisines, or dishes..." value={searchQuery} onChange={e => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value.trim().length > 0);
            }} onFocus={() => setShowSearchResults(searchQuery.trim().length > 0)} className="pl-10 bg-muted/50 border-0 focus:bg-background" />
              {showSearchResults && <SearchResults searchQuery={searchQuery} onClose={() => setShowSearchResults(false)} />}
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 h-10 px-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">{user?.mobile}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
                  <DropdownMenuLabel className="pb-2">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">{user?.mobile}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center space-x-2 py-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Payment Modes</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-2 py-2">
                    <Heart className="h-4 w-4" />
                    <span>Favourites</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-2 py-2" onClick={() => navigateToPage('/my-orders')}>
                    <FileText className="h-4 w-4" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-2 py-2">
                    <Settings className="h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center space-x-2 py-2 text-destructive focus:text-destructive" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <>
                <Button variant="ghost" size="sm" onClick={() => setShowRegister(true)} className="hidden md:flex">
                  Register
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowLogin(true)} className="hidden md:flex">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </>}
            
            <Button variant="ghost" size="sm" className="relative" onClick={() => navigateToPage('/cart')}>
              <ShoppingCart className="h-4 w-4" />
              {getTotalItems() > 0 && <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>}
            </Button>

            {/* Mobile Menu */}
            {!isAuthenticated && (
              <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-4 mt-6">
                    <Button 
                      variant="default" 
                      className="w-full justify-start" 
                      onClick={() => {
                        setShowMobileMenu(false);
                        setShowRegister(true);
                      }}
                    >
                      Register
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => {
                        setShowMobileMenu(false);
                        setShowLogin(true);
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>

      <RegisterForm isOpen={showRegister} onClose={() => setShowRegister(false)} onSuccess={handleAuthSuccess} />
      
      <LoginForm isOpen={showLogin} onClose={() => setShowLogin(false)} onSuccess={handleAuthSuccess} onRegisterRequired={handleRegisterRequired} />
    </header>;
};