import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface CurrentLocationButtonProps {
  onLocationFound: (lat: number, lng: number) => void;
  className?: string;
}

const CurrentLocationButton = ({ onLocationFound, className }: CurrentLocationButtonProps) => {
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationFound(latitude, longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <Button
      variant="outline"
      onClick={handleCurrentLocation}
      className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-white shadow-lg border-2 rounded-full px-4 py-2 flex items-center gap-2 ${className}`}
    >
      <div className="p-1 bg-orange-100 rounded-full">
        <MapPin className="h-4 w-4 text-orange-600" />
      </div>
      <span className="text-sm font-medium">Current location</span>
    </Button>
  );
};

export default CurrentLocationButton;