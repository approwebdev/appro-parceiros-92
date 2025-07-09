import React, { useEffect, useRef, useState } from 'react';
import * as maptilerSdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

interface MapTilerMapProps {
  salons: Array<{
    id: string;
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }>;
  userLocation?: { lat: number; lng: number };
}

const MapTilerMap: React.FC<MapTilerMapProps> = ({ salons, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maptilerSdk.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // Timeout para evitar carregamento infinito
    const loadingTimeout = setTimeout(() => {
      console.warn('MapTiler: Timeout de carregamento, mostrando fallback');
      setHasError(true);
      setIsLoaded(true);
    }, 10000); // 10 segundos timeout

    const initializeMap = async () => {
      try {
        // Configurar API key do MapTiler
        maptilerSdk.config.apiKey = 'bC55peR1KGcjYHWppadW';
        console.log('MapTiler: Inicializando mapa...');

        const center: [number, number] = userLocation ? [userLocation.lng, userLocation.lat] : [-46.6333, -23.5505];
        
        // Criar o mapa do MapTiler
        mapInstance.current = new maptilerSdk.Map({
          container: mapRef.current!,
          style: maptilerSdk.MapStyle.STREETS,
          center: center,
          zoom: 12
        });

        mapInstance.current.on('load', () => {
          console.log('MapTiler: Mapa carregado com sucesso');
          clearTimeout(loadingTimeout);
          setIsLoaded(true);
          
          if (!mapInstance.current) return;

          try {
            // Adicionar marcador do usuário
            if (userLocation) {
              new maptilerSdk.Marker({ 
                color: '#3b82f6',
                scale: 1.2
              })
                .setLngLat([userLocation.lng, userLocation.lat])
                .setPopup(new maptilerSdk.Popup().setHTML('<div style="padding: 8px;"><strong>Sua localização</strong></div>'))
                .addTo(mapInstance.current);
            }

            // Adicionar marcadores dos salões
            salons.forEach((salon) => {
              if (salon.latitude && salon.longitude && mapInstance.current) {
                const marker = new maptilerSdk.Marker({ 
                  color: '#d4af37',
                  scale: 1.2
                })
                  .setLngLat([salon.longitude, salon.latitude])
                  .setPopup(
                    new maptilerSdk.Popup().setHTML(`
                      <div style="padding: 8px;">
                        <h3 style="margin: 0 0 4px 0; font-weight: 600;">${salon.name}</h3>
                        <p style="margin: 0; color: #666; font-size: 14px;">${salon.address || ''}</p>
                      </div>
                    `)
                  )
                  .addTo(mapInstance.current);
              }
            });

            // Ajustar visualização para mostrar todos os marcadores
            if (salons.length > 0 || userLocation) {
              const bounds = new maptilerSdk.LngLatBounds();
              
              if (userLocation) {
                bounds.extend([userLocation.lng, userLocation.lat]);
              }
              
              salons.forEach(salon => {
                if (salon.latitude && salon.longitude) {
                  bounds.extend([salon.longitude, salon.latitude]);
                }
              });

              if (!bounds.isEmpty()) {
                mapInstance.current.fitBounds(bounds, {
                  padding: 50,
                  maxZoom: 15
                });
              }
            }
          } catch (markerError) {
            console.error('MapTiler: Erro ao adicionar marcadores:', markerError);
          }
        });

        mapInstance.current.on('error', (e) => {
          console.error('MapTiler: Erro no mapa:', e.error);
          clearTimeout(loadingTimeout);
          setHasError(true);
          setIsLoaded(true);
        });

      } catch (error) {
        console.error('MapTiler: Erro ao inicializar:', error);
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
        mapInstance.current.remove();
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

export default MapTilerMap;