import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  salons: Array<{
    id: string;
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }>;
  userLocation?: { lat: number; lng: number };
}

const SalonMap: React.FC<MapProps> = ({ salons, userLocation }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    // Por enquanto, usamos um token temporário - depois será configurado no Supabase
    const tempToken = 'pk.eyJ1IjoidGVtcC11c2VyIiwiYSI6ImNrZjB0NGRqdTBhajAzM29sOWZ0ODhzejQifQ.example';
    setMapboxToken(tempToken);
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: userLocation ? [userLocation.lng, userLocation.lat] : [-46.6333, -23.5505], // São Paulo default
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add user location marker if available
    if (userLocation) {
      new mapboxgl.Marker({ color: '#3b82f6' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<div>Sua localização</div>'))
        .addTo(map.current);
    }

    // Add salon markers
    salons.forEach((salon) => {
      if (salon.latitude && salon.longitude) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <h3 class="font-semibold">${salon.name}</h3>
            <p class="text-sm text-gray-600">${salon.address || ''}</p>
          </div>`
        );

        new mapboxgl.Marker({ color: '#d4af37' })
          .setLngLat([salon.longitude, salon.latitude])
          .setPopup(popup)
          .addTo(map.current!);
      }
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, salons, userLocation]);

  if (!mapboxToken) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Configurando mapa...</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-menu-gold mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default SalonMap;