import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

const LocationPicker = ({ 
  open, 
  onOpenChange, 
  onLocationSelect, 
  initialLat = 28.6139, 
  initialLng = 77.2090 
}: LocationPickerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [selectedLat, setSelectedLat] = useState(initialLat);
  const [selectedLng, setSelectedLng] = useState(initialLng);
  const [mapboxToken, setMapboxToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Get current location when dialog opens
  useEffect(() => {
    if (open && navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLat(latitude);
          setSelectedLng(longitude);
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationLoading(false);
          // Keep default coordinates if geolocation fails
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [open]);
  
  // Fetch Mapbox token when dialog opens
  useEffect(() => {
    if (open && !mapboxToken) {
      const fetchToken = async () => {
        setLoading(true);
        try {
          const response = await fetch('https://zgyxybgogjzeuocuoane.supabase.co/functions/v1/get-mapbox-token');
          const data = await response.json();
          if (data.token) {
            setMapboxToken(data.token);
          }
        } catch (error) {
          console.error('Failed to fetch Mapbox token:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchToken();
    }
  }, [open, mapboxToken]);
  
  useEffect(() => {
    if (!open || !mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [selectedLng, selectedLat],
      zoom: 15, // Higher zoom for better location detail
    });

    // Add marker with red color like Google Maps
    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: '#EA4335' // Google Maps red color
    })
      .setLngLat([selectedLng, selectedLat])
      .addTo(map.current);

    // Update coordinates when marker is dragged
    marker.current.on('dragend', () => {
      const lngLat = marker.current!.getLngLat();
      setSelectedLat(lngLat.lat);
      setSelectedLng(lngLat.lng);
    });

    // Add click event to map
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      setSelectedLat(lat);
      setSelectedLng(lng);
      marker.current!.setLngLat([lng, lat]);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [open, mapboxToken]);

  // Update map center and marker when coordinates change
  useEffect(() => {
    if (map.current && marker.current) {
      map.current.setCenter([selectedLng, selectedLat]);
      marker.current.setLngLat([selectedLng, selectedLat]);
    }
  }, [selectedLat, selectedLng]);

  const handleConfirm = () => {
    onLocationSelect(selectedLat, selectedLng);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Select Seller Location</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
          
          {!loading && !mapboxToken && (
            <div className="text-center py-8">
              <p className="text-sm text-destructive">Failed to load map. Please try again.</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="mt-2"
              >
                Reload
              </Button>
            </div>
          )}
          
          {!loading && mapboxToken && (
            <>
              <div className="space-y-2">
                {locationLoading && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Getting your current location...</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  📍 Drag the red marker or click on the map to select the seller location
                  {!locationLoading && (
                    <span className="block text-xs mt-1">
                      {navigator.geolocation ? 'Started with your current location' : 'Using default location (Delhi)'}
                    </span>
                  )}
                </p>
                <div ref={mapContainer} className="w-full h-96 rounded-lg border shadow-sm" />
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-2">Selected Coordinates:</p>
                <p className="text-xs text-muted-foreground">
                  Lat: {selectedLat.toFixed(6)}, Lng: {selectedLng.toFixed(6)}
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleConfirm}
                  className="bg-[#EA4335] hover:bg-[#EA4335]/90 text-white"
                >
                  Confirm & Proceed
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPicker;