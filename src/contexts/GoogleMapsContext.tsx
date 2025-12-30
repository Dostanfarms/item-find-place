import React, { createContext, useContext, useEffect, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { supabase } from '@/integrations/supabase/client';

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
  apiKey: string;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: undefined,
  apiKey: '',
});

export const useGoogleMaps = () => useContext(GoogleMapsContext);

interface GoogleMapsProviderProps {
  children: React.ReactNode;
}

export const GoogleMapsProvider = ({ children }: GoogleMapsProviderProps) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [keyFetched, setKeyFetched] = useState(false);

  // Fetch Google Maps API key once on mount
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        if (data?.apiKey) {
          setApiKey(data.apiKey);
        }
      } catch (error) {
        console.error('Failed to fetch Google Maps API key:', error);
      } finally {
        setKeyFetched(true);
      }
    };
    fetchApiKey();
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    // Only load when we have the API key
    // The library handles not re-loading if already loaded
  });

  // Don't render children until we've attempted to fetch the key
  if (!keyFetched) {
    return null;
  }

  return (
    <GoogleMapsContext.Provider value={{ isLoaded: isLoaded && !!apiKey, loadError, apiKey }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};
