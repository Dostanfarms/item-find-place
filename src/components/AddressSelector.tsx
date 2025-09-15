import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Plus, 
  MessageSquare,
  Home,
  Building2,
  Briefcase,
  MoreVertical
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  distance?: string;
  isSelected?: boolean;
  latitude?: number;
  longitude?: number;
}

interface AddressSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddressSelect: (address: SavedAddress) => void;
  selectedAddress?: SavedAddress;
}

const AddressSelector = ({ 
  open, 
  onOpenChange, 
  onAddressSelect, 
  selectedAddress 
}: AddressSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
    {
      id: '1',
      label: 'Home New',
      address: '6-1-103/101, Beside Dr Bhatia Medical Coaching Institute, Pulse Hospital Lane,...',
      distance: '3 m',
      isSelected: true
    },
    {
      id: '2',
      label: 'Hotel',
      address: '209 Oyo, Oyo Beside Mahankali Bar, Kranti Colony, Telephone Colony, Chen...',
      distance: '9.5 km'
    },
    {
      id: '3',
      label: 'Work',
      address: '3rd Floor, Musheerabad Main Rd, Musheerabad, Zamistanpur, Hyderaba...',
      distance: '776 m'
    }
  ]);

  const [recentSearches] = useState<SavedAddress[]>([
    {
      id: '4',
      label: 'Abhinav Colony',
      address: 'Abhinav Colony, Walker Town, Padmarao Nagar, Hyderabad, Telangana 500020, In...'
    },
    {
      id: '5',
      label: 'Postal Colony',
      address: 'Nehru Nagar, Postal Colony, Kurnool, Andhra Pradesh 518004, India',
      distance: '182 km'
    }
  ]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Create a current location address object
        const currentLocationAddress: SavedAddress = {
          id: 'current',
          label: 'Current Location',
          address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
          latitude,
          longitude,
          isSelected: true
        };

        onAddressSelect(currentLocationAddress);
        onOpenChange(false);
        setIsGettingLocation(false);
        
        toast({
          title: "Location Selected",
          description: "Your current location has been set as delivery address.",
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsGettingLocation(false);
        toast({
          title: "Location Error",
          description: "Could not get your current location. Please try again.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getAddressIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('home')) return <Home className="h-4 w-4" />;
    if (lowerLabel.includes('work') || lowerLabel.includes('office')) return <Briefcase className="h-4 w-4" />;
    if (lowerLabel.includes('hotel')) return <Building2 className="h-4 w-4" />;
    return <MapPin className="h-4 w-4" />;
  };

  const handleAddressSelect = (address: SavedAddress) => {
    onAddressSelect(address);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[90vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-4 pb-0 border-b">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className="p-0 h-auto"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className="text-lg font-semibold">Select Your Location</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Search Bar */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search an area or address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-muted/50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 rounded-xl"
                onClick={handleUseCurrentLocation}
                disabled={isGettingLocation}
              >
                <div className="p-2 bg-orange-100 rounded-full">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-xs font-medium text-center">
                  {isGettingLocation ? 'Getting...' : 'Use Current Location'}
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 rounded-xl"
              >
                <div className="p-2 bg-gray-100 rounded-full">
                  <Plus className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-xs font-medium text-center">
                  Add New Address
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 rounded-xl"
              >
                <div className="p-2 bg-green-100 rounded-full">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-xs font-medium text-center">
                  Request Address
                </span>
              </Button>
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="px-4 pb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              SAVED ADDRESSES
            </h3>
            <div className="space-y-3">
              {savedAddresses.map((address) => (
                <Card
                  key={address.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedAddress?.id === address.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleAddressSelect(address)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-full mt-1">
                        {getAddressIcon(address.label)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{address.label}</span>
                          {address.isSelected && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              SELECTED
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {address.address}
                        </p>
                        {address.distance && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {address.distance}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* View All Button */}
          <div className="px-4 pb-4">
            <Button variant="ghost" className="w-full text-orange-600 hover:text-orange-700">
              View all ↓
            </Button>
          </div>

          {/* Recently Searched */}
          <div className="px-4 pb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              RECENTLY SEARCHED
            </h3>
            <div className="space-y-3">
              {recentSearches.map((address) => (
                <Card
                  key={address.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => handleAddressSelect(address)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-full mt-1">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium mb-1">{address.label}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {address.address}
                        </p>
                        {address.distance && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {address.distance}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressSelector;