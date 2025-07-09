import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GoogleMapProps {
  salons: Array<{
    id: string;
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }>;
  userLocation?: { lat: number; lng: number };
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({ salons, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Carregar Google Maps API com chave do Supabase
    if (!window.google) {
      const loadGoogleMaps = async () => {
        try {
          const { data } = await supabase.functions.invoke('get-google-maps-key');
          const apiKey = data?.key;
          
          if (!apiKey) {
            console.error('Google Maps API key not configured');
            setIsLoaded(false);
            return;
          }

          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap&loading=async`;
          script.async = true;
          script.defer = true;
          
          window.initMap = () => {
            setIsLoaded(true);
          };
          
          document.head.appendChild(script);
        } catch (error) {
          console.error('Failed to load Google Maps API key:', error);
          setIsLoaded(false);
        }
      };
      
      loadGoogleMaps();
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const center = userLocation || { lat: -23.5505, lng: -46.6333 }; // São Paulo default
    
    // Criar o mapa
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry.fill',
          stylers: [{ saturation: -100 }]
        },
        {
          featureType: 'poi',
          elementType: 'all',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Adicionar marcador do usuário
    if (userLocation) {
      new window.google.maps.Marker({
        position: userLocation,
        map: mapInstance.current,
        title: 'Sua localização',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6"%3E%3Cpath d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/%3E%3C/svg%3E',
          scaledSize: new window.google.maps.Size(30, 30)
        }
      });
    }

    // Adicionar marcadores dos salões
    salons.forEach((salon) => {
      if (salon.latitude && salon.longitude) {
        const marker = new window.google.maps.Marker({
          position: { lat: salon.latitude, lng: salon.longitude },
          map: mapInstance.current,
          title: salon.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23d4af37"%3E%3Cpath d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/%3E%3C/svg%3E',
            scaledSize: new window.google.maps.Size(30, 30)
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-weight: 600;">${salon.name}</h3>
              <p style="margin: 0; color: #666; font-size: 14px;">${salon.address || ''}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance.current, marker);
        });
      }
    });
  }, [isLoaded, salons, userLocation]);

  if (!isLoaded) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Carregando mapa...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg border">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default GoogleMap;