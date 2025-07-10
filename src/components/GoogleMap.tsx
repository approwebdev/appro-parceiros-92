import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from "@/integrations/supabase/client";

/// <reference types="google.maps" />

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

const GoogleMap: React.FC<GoogleMapProps> = ({ salons, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // Timeout para evitar carregamento infinito
    const loadingTimeout = setTimeout(() => {
      console.warn('Google Maps: Timeout de carregamento, mostrando fallback');
      setHasError(true);
      setIsLoaded(true);
    }, 8000);

    const initializeMap = async () => {
      try {
        console.log('Google Maps: Obtendo chave da API...');
        
        // Buscar a chave do Google Maps da função edge
        const { data: keyData, error: keyError } = await supabase.functions.invoke('get-google-maps-key');
        
        if (keyError || !keyData?.key) {
          console.error('Erro ao obter chave do Google Maps:', keyError);
          clearTimeout(loadingTimeout);
          setHasError(true);
          setIsLoaded(true);
          return;
        }

        console.log('Google Maps: Inicializando loader...');
        
        const loader = new Loader({
          apiKey: keyData.key,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        
        console.log('Google Maps: API carregada com sucesso');

        const center = userLocation 
          ? { lat: userLocation.lat, lng: userLocation.lng }
          : { lat: -23.5505, lng: -46.6333 }; // São Paulo como padrão

        mapInstance.current = new google.maps.Map(mapRef.current!, {
          center: center,
          zoom: 12,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        console.log('Google Maps: Mapa inicializado com sucesso');
        clearTimeout(loadingTimeout);
        setIsLoaded(true);

        // Adicionar marcador do usuário
        if (userLocation && mapInstance.current) {
          new google.maps.Marker({
            position: { lat: userLocation.lat, lng: userLocation.lng },
            map: mapInstance.current,
            title: 'Sua localização',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#fff" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="#fff"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(24, 24)
            }
          });
        }

        // Adicionar marcadores dos salões
        const bounds = new google.maps.LatLngBounds();
        let hasValidMarkers = false;

        if (userLocation) {
          bounds.extend(new google.maps.LatLng(userLocation.lat, userLocation.lng));
          hasValidMarkers = true;
        }

        salons.forEach((salon) => {
          if (salon.latitude && salon.longitude && mapInstance.current) {
            const marker = new google.maps.Marker({
              position: { lat: salon.latitude, lng: salon.longitude },
              map: mapInstance.current,
              title: salon.name,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#d4af37" stroke="#fff" stroke-width="1"/>
                    <circle cx="12" cy="9" r="2.5" fill="#fff"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(32, 32)
              }
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; max-width: 200px;">
                  <h3 style="margin: 0 0 4px 0; font-weight: 600; font-size: 16px;">${salon.name}</h3>
                  <p style="margin: 0; color: #666; font-size: 14px;">${salon.address || ''}</p>
                </div>
              `
            });

            marker.addListener('click', () => {
              infoWindow.open(mapInstance.current, marker);
            });

            bounds.extend(new google.maps.LatLng(salon.latitude, salon.longitude));
            hasValidMarkers = true;
          }
        });

        // Ajustar visualização para mostrar todos os marcadores
        if (hasValidMarkers && mapInstance.current) {
          mapInstance.current.fitBounds(bounds, {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50
          });
          
          // Limitar o zoom máximo
          const listener = google.maps.event.addListener(mapInstance.current, 'bounds_changed', () => {
            if (mapInstance.current!.getZoom()! > 15) {
              mapInstance.current!.setZoom(15);
            }
            google.maps.event.removeListener(listener);
          });
        }

      } catch (error) {
        console.error('Google Maps: Erro ao inicializar mapa:', error);
        clearTimeout(loadingTimeout);
        setHasError(true);
        setIsLoaded(true);
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      clearTimeout(loadingTimeout);
      if (mapInstance.current) {
        mapInstance.current = null;
      }
    };
  }, [salons, userLocation]);

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

  // Fallback visual se o mapa não carregar ou houver erro
  if (!mapInstance.current || hasError) {
    return (
      <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg border">
        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex flex-col items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center max-w-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">📍 Localização dos Salões</h3>
            <p className="text-sm text-gray-600 mb-4">
              {hasError ? 'Erro ao carregar mapa interativo' : 'Mapa interativo indisponível'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {salons.slice(0, 6).map(salon => (
                <div key={salon.id} className="bg-blue-500/20 px-3 py-1 rounded-full text-xs text-blue-800">
                  {salon.name}
                </div>
              ))}
              {salons.length > 6 && (
                <div className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-600">
                  +{salons.length - 6} mais
                </div>
              )}
            </div>
            {userLocation && (
              <p className="text-xs text-gray-500 mt-3">
                📍 Sua localização: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            )}
          </div>
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