import React, { useEffect, useRef, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface GoogleMapProps {
  salons: Array<{
    id: string;
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    instagram?: string;
    is_verified?: boolean;
    plan?: string;
    plan_type?: string;
    distance?: number;
  }>;
  userLocation?: { lat: number; lng: number };
}

declare global {
  interface Window {
    google: any;
    googleMapsLoaded?: boolean;
    initializeMap?: () => void;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({ salons, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('Iniciando...');
  const mountedRef = useRef(true);

  // Effect para carregar a API do Google Maps (apenas uma vez)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const loadGoogleMapsAPI = async () => {
      try {
        console.log('[GoogleMap] Iniciando carregamento da API...');
        setLoadingStep('Obtendo chave da API...');

        // Verificar se já está carregado
        if (window.google?.maps) {
          console.log('[GoogleMap] API já carregada');
          window.googleMapsLoaded = true;
          setIsLoaded(true);
          setIsLoading(false);
          return;
        }

        // Verificar se já existe um script carregando
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          console.log('[GoogleMap] Script já existe, aguardando carregamento...');
          setLoadingStep('Aguardando carregamento...');
          return;
        }

        // Buscar chave da API
        const { data: keyData, error } = await supabase.functions.invoke('get-google-maps-key');
        
        if (error || !keyData?.key) {
          console.error('[GoogleMap] Erro ao obter chave:', error);
          throw new Error('Falha ao obter chave da API');
        }

        console.log('[GoogleMap] Chave obtida, carregando script...');
        setLoadingStep('Carregando script do Google Maps...');

        // Função callback global para quando o Google Maps carregar
        window.initializeMap = () => {
          console.log('[GoogleMap] Callback do Google Maps executado');
          window.googleMapsLoaded = true;
          setIsLoaded(true);
          setIsLoading(false);
        };

        // Carregar script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${keyData.key}&libraries=places&callback=initializeMap`;
        script.async = true;
        script.defer = true;
        
        script.onerror = (e) => {
          console.error('[GoogleMap] Erro ao carregar script:', e);
          if (mountedRef.current) {
            setHasError(true);
            setIsLoading(false);
            setLoadingStep('Erro no carregamento');
          }
        };

        document.head.appendChild(script);

        // Timeout de segurança para carregamento da API
        timeoutId = setTimeout(() => {
          if (mountedRef.current && !window.googleMapsLoaded) {
            console.error('[GoogleMap] Timeout no carregamento da API');
            setHasError(true);
            setIsLoading(false);
            setLoadingStep('Timeout na API');
          }
        }, 20000);

      } catch (error) {
        console.error('[GoogleMap] Erro ao carregar API:', error);
        if (mountedRef.current) {
          setHasError(true);
          setIsLoading(false);
          setLoadingStep('Erro ao carregar API');
        }
      }
    };

    if (!window.googleMapsLoaded && !isLoaded) {
      loadGoogleMapsAPI();
    } else if (window.googleMapsLoaded) {
      setIsLoaded(true);
      setIsLoading(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []); // Sem dependências - carrega apenas uma vez

  // Effect para criar o mapa quando a API estiver pronta
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const createMap = () => {
      if (!mapRef.current || !window.google?.maps || !mountedRef.current) {
        return false;
      }

      try {
        console.log('[GoogleMap] Criando mapa...');
        setLoadingStep('Criando mapa...');

        const center = userLocation || { lat: -23.5505, lng: -46.6333 };

        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 12,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        });

        // Marcador do usuário
        if (userLocation) {
          new window.google.maps.Marker({
            position: userLocation,
            map,
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
            const position = { lat: salon.latitude, lng: salon.longitude };
            
            const marker = new window.google.maps.Marker({
              position,
              map,
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
                <div style="padding: 16px; width: 320px; font-family: system-ui, -apple-system, sans-serif; overflow: visible;">
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <h3 style="margin: 0; font-weight: 600; color: #1f2937; font-size: 18px;">${salon.name}</h3>
                    ${(salon.is_verified || salon.plan_type === 'verificado_azul' || salon.plan_type === 'verificado_dourado') ? `
                      <img src="${salon.plan_type === 'verificado_dourado' || salon.plan === 'premium' || salon.plan === 'profissional' ? '/lovable-uploads/b689eb05-022b-4de0-9b7a-e4c94527301d.png' : '/lovable-uploads/0a15abc3-681d-456b-9d90-deecf0d0f549.png'}" 
                           alt="Verificado" style="width: 20px; height: 20px;">
                    ` : ''}
                  </div>
                  
                  ${salon.address ? `
                    <div style="margin-bottom: 12px;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 600;">📍 Endereço:</span>
                      <p style="margin: 4px 0 0 0; color: #374151; font-size: 14px; line-height: 1.5;">${salon.address}</p>
                    </div>
                  ` : ''}
                  
                  
                  <div style="display: flex; gap: 12px; margin-top: 12px; flex-wrap: wrap;">
                    ${salon.phone ? `
                      <a href="https://wa.me/55${salon.phone.replace(/\D/g, '')}" 
                         target="_blank"
                         style="display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #25d366; color: white; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        📱 WhatsApp
                      </a>
                    ` : ''}
                    
                    ${salon.instagram ? `
                      <a href="https://instagram.com/${salon.instagram.replace('@', '')}" 
                         target="_blank"
                         style="display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #e4405f; color: white; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        📷 Instagram
                      </a>
                    ` : ''}
                  </div>
                  
                  ${salon.distance ? `
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                      <span style="color: #10b981; font-size: 13px; font-weight: 600;">📏 ${salon.distance.toFixed(1)}km de distância</span>
                    </div>
                  ` : ''}
                </div>
              `,
              maxWidth: 350,
              disableAutoPan: false
            });

            marker.addListener('click', () => infoWindow.open(map, marker));
            bounds.extend(new window.google.maps.LatLng(salon.latitude, salon.longitude));
            hasMarkers = true;
          }
        });

        if (hasMarkers) {
          map.fitBounds(bounds);
          window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
            if (map.getZoom()! > 15) map.setZoom(15);
          });
        }

        console.log('[GoogleMap] Mapa criado com sucesso');
        setIsLoaded(true);
        setIsLoading(false);
        setLoadingStep('Concluído');
        return true;

      } catch (error) {
        console.error('[GoogleMap] Erro ao criar mapa:', error);
        if (mountedRef.current) {
          setHasError(true);
          setIsLoading(false);
          setLoadingStep('Erro na criação');
        }
        return false;
      }
    };

    const waitForGoogleMaps = () => {
      console.log('[GoogleMap] Aguardando Google Maps estar pronto...');
      setLoadingStep('Aguardando Google Maps...');

      // Verificar a cada 500ms se o Google Maps está disponível
      intervalId = setInterval(() => {
        if (window.google?.maps && window.googleMapsLoaded) {
          console.log('[GoogleMap] Google Maps está pronto');
          clearInterval(intervalId);
          createMap();
        }
      }, 500);

      // Timeout de segurança para criação do mapa
      timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        if (mountedRef.current && !isLoaded) {
          console.error('[GoogleMap] Timeout aguardando Google Maps');
          setHasError(true);
          setIsLoading(false);
          setLoadingStep('Timeout aguardando Maps');
        }
      }, 20000);
    };

    // Só tentar criar o mapa se os dados estão disponíveis
    if (salons.length > 0 || userLocation) {
      if (window.google?.maps && window.googleMapsLoaded) {
        createMap();
      } else {
        waitForGoogleMaps();
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [salons, userLocation, isLoaded]); // Depende dos dados

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">{loadingStep}</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Tentar novamente
          </button>
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