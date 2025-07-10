import React, { useEffect, useRef, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    google: any;
    initGoogleMap: () => void;
  }
}

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
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const updateMapMarkers = () => {
    if (!mapInstanceRef.current || !window.google) return;

    const map = mapInstanceRef.current;

    // Marcador do usuário
    if (userLocation) {
      new window.google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: map,
        title: 'Sua localização',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }
      });
    }

    // Marcadores dos salões
    const bounds = new window.google.maps.LatLngBounds();
    let hasMarkers = false;

    if (userLocation) {
      bounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng));
      hasMarkers = true;
    }

    salons.forEach((salon) => {
      if (salon.latitude && salon.longitude) {
        const marker = new window.google.maps.Marker({
          position: { lat: salon.latitude, lng: salon.longitude },
          map: map,
          title: salon.name,
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: '#d4af37',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 1,
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 4px 0; font-weight: 600;">${salon.name}</h3>
              <p style="margin: 0; color: #666; font-size: 14px;">${salon.address || ''}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        bounds.extend(new window.google.maps.LatLng(salon.latitude, salon.longitude));
        hasMarkers = true;
      }
    });

    if (hasMarkers) {
      map.fitBounds(bounds);
      window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom()! > 15) {
          map.setZoom(15);
        }
      });
    }
  };

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        console.log('Google Maps: Iniciando carregamento...');
        
        // Verificar se já está carregado
        if (window.google && window.google.maps && mapRef.current && !mapInstanceRef.current) {
          console.log('Google Maps: Já carregado, criando mapa...');
          createMap();
          return;
        }

        // Se já tem instância do mapa, não recarregar
        if (mapInstanceRef.current) {
          console.log('Google Maps: Mapa já existe, atualizando...');
          updateMapMarkers();
          return;
        }

        // Buscar chave da API
        const { data: keyData, error: keyError } = await supabase.functions.invoke('get-google-maps-key');
        
        if (keyError || !keyData?.key) {
          console.error('Google Maps: Erro ao obter chave:', keyError);
          setHasError(true);
          setIsLoaded(true);
          return;
        }

        console.log('Google Maps: Chave obtida, carregando script...');

        // Verificar se script já existe
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript && window.google && window.google.maps) {
          console.log('Google Maps: Script já carregado, criando mapa...');
          createMap();
          return;
        }

        // Callback global único
        const callbackName = `initGoogleMap_${Date.now()}`;
        (window as any)[callbackName] = () => {
          console.log('Google Maps: Callback executado');
          delete (window as any)[callbackName];
          if (mapRef.current) {
            createMap();
          }
        };

        // Remover script anterior se existir
        if (existingScript) {
          existingScript.remove();
        }

        // Carregar script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${keyData.key}&callback=${callbackName}&libraries=places&loading=async`;
        script.async = true;
        script.defer = true;
        
        script.onerror = () => {
          console.error('Google Maps: Erro ao carregar script');
          setHasError(true);
          setIsLoaded(true);
          delete (window as any)[callbackName];
        };

        document.head.appendChild(script);

      } catch (error) {
        console.error('Google Maps: Erro geral:', error);
        setHasError(true);
        setIsLoaded(true);
      }
    };

    const createMap = () => {
      try {
        if (!mapRef.current) {
          console.log('Google Maps: Ref do mapa não encontrado, aguardando...');
          setTimeout(() => {
            if (mapRef.current) {
              createMap();
            }
          }, 100);
          return;
        }

        if (!window.google || !window.google.maps) {
          console.log('Google Maps: API não carregada ainda');
          return;
        }

        console.log('Google Maps: Criando mapa...');

        const center = userLocation 
          ? { lat: userLocation.lat, lng: userLocation.lng }
          : { lat: -23.5505, lng: -46.6333 };

        const map = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: 12,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        });

        mapInstanceRef.current = map;

        updateMapMarkers();

        console.log('Google Maps: Mapa criado com sucesso');
        setIsLoaded(true);

      } catch (error) {
        console.error('Google Maps: Erro ao criar mapa:', error);
        setHasError(true);
        setIsLoaded(true);
      }
    };


    loadGoogleMaps();

    return () => {
      // Cleanup apenas quando componente desmonta
      mapInstanceRef.current = null;
    };
  }, []);

  // Atualizar marcadores quando dados mudarem
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMapMarkers();
    }
  }, [salons, userLocation]);

  if (!isLoaded && !hasError) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Carregando mapa...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg border">
        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex flex-col items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center max-w-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">📍 Localização dos Salões</h3>
            <p className="text-sm text-gray-600 mb-4">
              Mapa interativo indisponível
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