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
    // Fallback simples sem API do Google Maps
    const loadSimpleMap = () => {
      setIsLoaded(true);
    };

    // Tentar carregar Google Maps com chave do Supabase
    const loadGoogleMaps = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        
        if (error || !data?.key) {
          console.log('Google Maps API key not available, using fallback');
          loadSimpleMap();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.key}&libraries=places&callback=initMap&loading=async`;
        script.async = true;
        script.defer = true;
        
        script.onerror = () => {
          console.log('Failed to load Google Maps, using fallback');
          loadSimpleMap();
        };
        
        window.initMap = () => {
          setIsLoaded(true);
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.log('Error loading Google Maps, using fallback:', error);
        loadSimpleMap();
      }
    };

    if (!window.google) {
      loadGoogleMaps();
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Se o Google Maps não estiver disponível, mostrar mapa simples
    if (!window.google) {
      // Criar um mapa simples sem Google Maps
      const mapElement = mapRef.current;
      mapElement.innerHTML = `
        <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; text-align: center; padding: 20px; box-sizing: border-box;">
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; backdrop-filter: blur(10px);">
            <h3 style="margin: 0 0 10px 0; font-size: 18px;">📍 Localização dos Salões</h3>
            <p style="margin: 0 0 15px 0; font-size: 14px; opacity: 0.9;">Mapa interativo indisponível</p>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
              ${salons.map(salon => `
                <div style="background: rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 15px; font-size: 12px;">
                  ${salon.name}
                </div>
              `).join('')}
            </div>
            ${userLocation ? `<p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.8;">📍 Sua localização: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}</p>` : ''}
          </div>
        </div>
      `;
      return;
    }

    const center = userLocation || { lat: -23.5505, lng: -46.6333 }; // São Paulo default
    
    // Criar o mapa do Google
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