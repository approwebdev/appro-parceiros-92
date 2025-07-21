import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Menu, MapPin, Phone, List, Map, Navigation, ChevronDown, ChevronUp, CheckCircle, Instagram } from "lucide-react";
import { generateSalonCoordinates } from "@/utils/geocoding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GoogleMap from "@/components/GoogleMap";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Salon {
  id: string;
  name: string;
  slug: string;
  phone?: string;
  address?: string;
  instagram?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  plan?: string;
  photo_url?: string;
}

interface Banner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  is_active: boolean;
  order_position: number;
}

const SalonFinder = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [distanceFilter, setDistanceFilter] = useState<'50' | '100' | 'all'>('all');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSalons();
    fetchBanners();
    // Solicitar localização automaticamente após carregar os salões
    const timer = setTimeout(() => {
      if (!userLocation) {
        setShowLocationDialog(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Recalcular distâncias quando a localização for obtida
  useEffect(() => {
    if (userLocation && salons.length > 0) {
      console.log('Recalculando distâncias para', salons.length, 'salões');
      setSalons(prevSalons => prevSalons.map(salon => {
        if (salon.latitude && salon.longitude) {
          const distance = calculateDistance(userLocation.lat, userLocation.lng, salon.latitude, salon.longitude);
          console.log(`Distância para ${salon.name}: ${distance.toFixed(1)}km`);
          return { ...salon, distance };
        }
        return salon;
      }));
    }
  }, [userLocation, salons.length]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getUserLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Seu navegador não suporta geolocalização.",
        variant: "destructive"
      });
      setGettingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('Localização obtida:', location);
        setUserLocation(location);
        
        toast({
          title: "Localização obtida!",
          description: "Mostrando salões próximos a você."
        });
        setGettingLocation(false);
        setShowLocationDialog(false);
      },
      (error) => {
        console.error('Erro de geolocalização:', error);
        let errorMessage = "Não foi possível acessar sua localização. Tente novamente.";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permissão de localização negada. Habilite nas configurações do navegador.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Localização indisponível. Verifique se o GPS está ativado.";
            break;
          case error.TIMEOUT:
            errorMessage = "Tempo limite para obter localização. Tente novamente.";
            break;
        }
        
        toast({
          title: "Erro ao obter localização",
          description: errorMessage,
          variant: "destructive"
        });
        setGettingLocation(false);
        setShowLocationDialog(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  const fetchSalons = async () => {
    try {
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erro ao buscar salões:', error);
        return;
      }

      const salonsWithCoords = (data || []).map(salon => {
        if (salon.latitude && salon.longitude && 
            typeof salon.latitude === 'number' && 
            typeof salon.longitude === 'number' && 
            salon.latitude !== 0 && salon.longitude !== 0) {
          return salon;
        }

        // Usar função de geocodificação inteligente
        const coords = generateSalonCoordinates(salon);
        
        return {
          ...salon,
          latitude: coords.lat,
          longitude: coords.lng
        };
      });
      
      setSalons(salonsWithCoords);
    } catch (error) {
      console.error('Erro ao buscar salões:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('salon_banners')
        .select('*')
        .eq('is_active', true)
        .order('order_position');

      if (error) {
        console.error('Erro ao buscar banners:', error);
        return;
      }
      setBanners(data || []);
    } catch (error) {
      console.error('Erro ao buscar banners:', error);
    }
  };

  // Filtro melhorado para busca
  const filteredSalons = salons.filter(salon => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true;
    
    const nameMatch = salon.name.toLowerCase().includes(searchLower);
    const addressMatch = salon.address?.toLowerCase().includes(searchLower);
    const instagramMatch = salon.instagram?.toLowerCase().includes(searchLower);
    
    return nameMatch || addressMatch || instagramMatch;
  }).filter(salon => {
    // Debug do filtro de distância
    console.log(`Filtrando ${salon.name}: distância=${salon.distance}, filtro=${distanceFilter}`);
    
    if (distanceFilter === 'all') return true;
    if (!userLocation || !salon.distance) return true; // Mostrar todos se não há localização
    
    const maxDistance = parseInt(distanceFilter);
    const withinDistance = salon.distance <= maxDistance;
    console.log(`${salon.name}: ${salon.distance.toFixed(1)}km <= ${maxDistance}km? ${withinDistance}`);
    return withinDistance;
  }).sort((a, b) => {
    // Ordenar por distância se houver, senão por nome
    if (userLocation && a.distance && b.distance) {
      return a.distance - b.distance;
    }
    return a.name.localeCompare(b.name);
  });

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const openWhatsApp = (phone: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white font-figtree overflow-hidden salon-finder-page">
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 768px) {
            .salon-finder-page .mobile-header {
              padding: 2rem 1rem !important;
            }
            
            .salon-finder-page .mobile-search-container {
              padding: 0 1rem !important;
            }
            
            .salon-finder-page .mobile-title {
              font-size: 2.5rem !important;
              line-height: 1.1 !important;
            }
            
            .salon-finder-page .mobile-subtitle {
              font-size: 2.5rem !important;
            }
          }

          @media (max-width: 380px) {
            .salon-finder-page .mobile-title {
              font-size: 2rem !important;
            }
            
            .salon-finder-page .mobile-subtitle {
              font-size: 2rem !important;
            }
          }
        `
      }} />

      {/* Dialog de Localização */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="max-w-md mx-auto bg-zinc-900 border-zinc-800" aria-describedby="location-dialog-description">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-white">
              🎯 Encontre salões próximos!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4" id="location-dialog-description">
            <p className="text-center text-zinc-400">
              Permita o acesso à sua localização para mostrarmos os salões mais próximos de você.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={getUserLocation} 
                disabled={gettingLocation} 
                className="flex-1 bg-white text-black hover:bg-gray-200"
              >
                <Navigation className="h-4 w-4 mr-2" />
                {gettingLocation ? 'Obtendo...' : 'Usar localização'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowLocationDialog(false)} 
                className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-800"
              >
                Agora não
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CONTAINER PRINCIPAL DO HEADER */}
      <motion.div 
        className="relative w-full pt-[clamp(3rem,5vh,4rem)] mobile-header" 
        style={{ height: "clamp(100px, 12vh, 140px)" }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-center items-center w-full h-full px-[8%]">
          {/* LOGO APPRO */}
          <motion.div 
            className="relative" 
            style={{ width: "clamp(90px, 8vw, 120px)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-full transform transition duration-200 ease-in-out hover:scale-110">
              <img
                src="/lovable-uploads/f77b22c2-a495-423a-bce4-4ddc7b37074d.png"
                alt="Logo Appro"
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* CONTAINER PRINCIPAL DO CONTEÚDO */}
      <div className="relative w-full h-[calc(100vh-clamp(100px,12vh,140px))] overflow-y-auto">
        {/* BLOCO DE TEXTO E BUSCA */}
        <motion.div 
          className="px-[8%] py-8 mobile-search-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Título Principal */}
          <div className="text-center mb-8">
            <motion.h1
              className="font-bold mb-2 mobile-title"
              style={{
                fontSize: "clamp(3rem, 8vw, 5rem)",
                lineHeight: "1.1",
                color: "#FFFFFF"
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Encontre o Salão mais
            </motion.h1>
            <motion.h2
              className="font-bold mb-8 mobile-subtitle"
              style={{
                fontSize: "clamp(3rem, 8vw, 5rem)",
                lineHeight: "1.1",
                color: "#E8D2A9"
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              próximo de você.
            </motion.h2>
          </div>

          {/* Barra de Busca */}
          <motion.div 
            className="relative mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Input 
              type="text" 
              placeholder="Buscar salão, endereço ou Instagram..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="bg-white text-black pl-4 pr-12 py-4 rounded-xl w-full border-0 text-lg placeholder:text-gray-500" 
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
          </motion.div>

          {/* Botão de Localização */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Button 
              onClick={getUserLocation} 
              disabled={gettingLocation} 
              className="w-full mb-6 bg-white/10 border border-white/20 text-white hover:bg-white/20 py-4 rounded-xl backdrop-blur-sm"
            >
              <Navigation className="h-4 w-4 mr-2" />
              {gettingLocation ? 'Obtendo localização...' : 'Usar minha localização'}
            </Button>
          </motion.div>

          {/* Filtros de Distância */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-300">Filtrar por distância:</p>
              {!userLocation && (
                <p className="text-xs text-zinc-500">Obtenha sua localização para filtrar</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant={distanceFilter === '50' ? 'default' : 'outline'} 
                onClick={() => userLocation && setDistanceFilter('50')} 
                size="sm" 
                disabled={!userLocation}
                className={`flex-1 rounded-xl ${
                  distanceFilter === '50' && userLocation 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                } ${!userLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                50km
              </Button>
              <Button 
                variant={distanceFilter === '100' ? 'default' : 'outline'} 
                onClick={() => userLocation && setDistanceFilter('100')} 
                size="sm" 
                disabled={!userLocation}
                className={`flex-1 rounded-xl ${
                  distanceFilter === '100' && userLocation 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                } ${!userLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                100km
              </Button>
              <Button 
                variant={distanceFilter === 'all' ? 'default' : 'outline'} 
                onClick={() => setDistanceFilter('all')} 
                size="sm" 
                className={`flex-1 rounded-xl ${
                  distanceFilter === 'all' 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                Todos
              </Button>
            </div>
            {userLocation && distanceFilter !== 'all' && (
              <p className="text-xs text-green-400 mt-2">
                ✓ Mostrando salões até {distanceFilter}km de você
              </p>
            )}
          </motion.div>

          {/* Botões de Visualização */}
          <motion.div 
            className="flex gap-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Button 
              variant={viewType === 'list' ? 'default' : 'outline'} 
              onClick={() => setViewType('list')} 
              className={`flex items-center gap-2 flex-1 rounded-xl ${
                viewType === 'list' 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <List className="h-4 w-4" />
              Lista
            </Button>
            <Button 
              variant={viewType === 'map' ? 'default' : 'outline'} 
              onClick={() => setViewType('map')} 
              className={`flex items-center gap-2 flex-1 rounded-xl ${
                viewType === 'map' 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <Map className="h-4 w-4" />
              Mapa
            </Button>
          </motion.div>
        </motion.div>

        {/* Visualização de Mapa */}
        {viewType === 'map' && (
          <motion.div 
            className="px-[8%] mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white">Mapa dos Salões</h3>
            <div className="rounded-xl overflow-hidden">
              <GoogleMap salons={filteredSalons} userLocation={userLocation} />
            </div>
          </motion.div>
        )}

        {/* Lista de Salões */}
        {viewType === 'list' && (
          <motion.div 
            className="px-[8%] pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {userLocation ? (
                  <span>Salões <span style={{ color: '#E8D2A9' }}>próximos de você</span></span>
                ) : (
                  'Todos os salões'
                )}
              </h3>
              {filteredSalons.length > 0 && (
                <Badge className="bg-white/10 border-white/20 text-white">
                  {filteredSalons.length} encontrados
                </Badge>
              )}
            </div>
            
            <div className="space-y-4">
              {filteredSalons.map((salon, index) => {
                const midPoint = Math.floor(filteredSalons.length / 2);
                const showMidBanner = index === midPoint && banners.length > 0;
                const isLastSalon = index === filteredSalons.length - 1;
                const showEndBanner = isLastSalon && banners.length > 1;
                
                return (
                  <motion.div 
                    key={salon.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 rounded-xl">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 text-xl overflow-hidden">
                            {salon.photo_url ? (
                              <img src={salon.photo_url} alt={salon.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              salon.name.charAt(0)
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-xl text-white">{salon.name}</h4>
                                {salon.plan && salon.plan !== 'basico' && (
                                  <CheckCircle className="h-6 w-6 text-blue-400" />
                                )}
                              </div>
                              {salon.distance && (
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                  {salon.distance.toFixed(1)}km
                                </Badge>
                              )}
                            </div>
                            
                            {salon.address && (
                              <div className="flex items-start gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-zinc-300">{salon.address}</p>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 mt-4">
                              {salon.phone && (
                                <Button 
                                  onClick={() => openWhatsApp(salon.phone)} 
                                  size="sm" 
                                  className="bg-green-600 text-white hover:bg-green-700 rounded-lg"
                                >
                                  <Phone className="h-4 w-4 mr-1" />
                                  Chamar
                                </Button>
                              )}
                              
                              {salon.instagram && (
                                <a 
                                  href={`https://instagram.com/${salon.instagram.replace('@', '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-pink-400 hover:text-pink-300 transition-colors"
                                >
                                  <Instagram className="h-4 w-4" />
                                  {salon.instagram}
                                </a>
                              )}
                              
                              <a 
                                href={`/menu/${salon.slug}`} 
                                className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors ml-auto"
                              >
                                Ver menu
                              </a>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Banners inseridos entre salões */}
                    {showMidBanner && (
                      <motion.div 
                        className="my-6"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="relative bg-gradient-to-r from-zinc-800 to-zinc-900 w-full h-48 rounded-xl overflow-hidden border border-white/10">
                          <div className="absolute inset-0 p-6 flex items-center justify-center">
                            <div className="text-center">
                              <h3 className="text-white text-xl font-bold mb-2">{banners[0].title}</h3>
                              <p className="text-zinc-300 text-sm mb-4">{banners[0].description}</p>
                              <Button className="bg-white text-black hover:bg-gray-200 rounded-lg">
                                Saiba mais
                              </Button>
                            </div>
                          </div>
                          {banners[0].image_url && (
                            <img
                              src={banners[0].image_url}
                              alt="Banner"
                              className="absolute right-0 top-0 h-full w-1/3 object-cover opacity-30"
                            />
                          )}
                        </div>
                      </motion.div>
                    )}

                    {showEndBanner && (
                      <motion.div 
                        className="my-6"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="relative bg-gradient-to-r from-zinc-800 to-zinc-900 w-full h-48 rounded-xl overflow-hidden border border-white/10">
                          <div className="absolute inset-0 p-6 flex items-center justify-center">
                            <div className="text-center">
                              <h3 className="text-white text-xl font-bold mb-2">{banners[1].title}</h3>
                              <p className="text-zinc-300 text-sm mb-4">{banners[1].description}</p>
                              <Button className="bg-white text-black hover:bg-gray-200 rounded-lg">
                                Saiba mais
                              </Button>
                            </div>
                          </div>
                          {banners[1].image_url && (
                            <img
                              src={banners[1].image_url}
                              alt="Banner"
                              className="absolute right-0 top-0 h-full w-1/3 object-cover opacity-30"
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {filteredSalons.length === 0 && (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-2">Nenhum salão encontrado</h3>
                  <p className="text-zinc-400">
                    {userLocation 
                      ? `Não encontramos salões em um raio de ${distanceFilter === 'all' ? 'qualquer distância' : distanceFilter}.`
                      : 'Nenhum salão disponível no momento.'}
                  </p>
                  {userLocation && distanceFilter !== 'all' && (
                    <Button 
                      onClick={() => setDistanceFilter('all')} 
                      className="mt-4 bg-white text-black hover:bg-gray-200 rounded-lg"
                    >
                      Ver todos os salões
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SalonFinder;