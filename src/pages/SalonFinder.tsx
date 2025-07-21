
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Phone, List, Map, Navigation, CheckCircle, Instagram, BellIcon, ChevronDown, Filter } from "lucide-react";
import { FaWhatsapp, FaBell } from "react-icons/fa";
import { generateSalonCoordinates } from "@/utils/geocoding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GoogleMap from "@/components/GoogleMap";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
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
  const [showNotifications, setShowNotifications] = useState(false);
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

  const handleLogoClick = () => {
    navigate('/menu-digital');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white font-figtree overflow-y-auto">
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 768px) {
            .search-container {
              padding: 1rem !important;
            }
            
            .salon-title {
              font-size: 3.5rem !important;
            }
            
            .search-text {
              font-size: 2.5rem !important;
            }
          }
        `
      }} />

      {/* Dialog de Localização */}
      <AnimatePresence>
        {showLocationDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white text-center mb-4">
                🎯 Encontre salões próximos!
              </h3>
              <p className="text-zinc-400 text-center mb-6">
                Permita o acesso à sua localização para mostrarmos os salões mais próximos de você.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={getUserLocation} 
                  disabled={gettingLocation}
                  className="flex-1 bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <Navigation className="h-4 w-4 mr-2 inline" />
                  {gettingLocation ? 'Obtendo...' : 'Usar localização'}
                </button>
                <button 
                  onClick={() => setShowLocationDialog(false)}
                  className="flex-1 border border-zinc-700 text-white py-3 px-4 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Agora não
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header 
        className="relative w-full pt-[clamp(3rem,5vh,4rem)]" 
        style={{ height: "clamp(100px, 12vh, 140px)" }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center w-full h-full px-[8%]">
          {/* LOGO APPRO */}
          <motion.div 
            className="relative" 
            style={{ width: "clamp(90px, 8vw, 120px)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <button 
              className="w-full transform transition duration-200 ease-in-out hover:scale-110"
              onClick={handleLogoClick}
            >
              <img
                src="/catalogo/icons/logo appro cinza.svg"
                alt="Logo Appro"
                className="w-full h-auto"
              />
            </button>
          </motion.div>

          {/* WHATSAPP + SINO */}
          <motion.div 
            className="flex items-center relative" 
            style={{ gap: "clamp(1.2rem, 2vw, 1.8rem)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <a 
              href="https://wa.me/5511999999999" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group transform transition-all duration-200 ease-in-out hover:scale-110"
            >
              <FaWhatsapp
                className="transition-all duration-200 text-gray-400"
                style={{ 
                  width: "clamp(24px, 2vw, 32px)", 
                  height: "auto"
                }}
              />
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-900 text-white text-xs py-1 px-2 rounded-md -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Fale conosco
              </div>
            </a>

            <button 
              className="group transform transition-all duration-200 ease-in-out hover:scale-110 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell
                className="transition-all duration-200 text-gray-400"
                style={{ 
                  width: "clamp(24px, 2vw, 32px)", 
                  height: "auto"
                }}
              />
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-900 text-white text-xs py-1 px-2 rounded-md -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Notificações
              </div>
            </button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content Section */}
      <motion.div 
        className="relative w-full min-h-[calc(100vh-clamp(100px,12vh,140px))] px-[8%] py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Hero Title */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h1 className="font-bold mb-2 text-white salon-title" style={{ fontSize: "clamp(4rem, 8vw, 6rem)", lineHeight: "1" }}>
            Encontre o Salão
          </h1>
          <h2 className="font-bold mb-8 search-text" style={{ 
            fontSize: "clamp(3rem, 6vw, 4.5rem)", 
            lineHeight: "1",
            color: "#E8D2A9" 
          }}>
            mais próximo de você
          </h2>
        </motion.div>

        {/* Search Container */}
        <motion.div 
          className="max-w-2xl mx-auto mb-8 search-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {/* Search Input */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Buscar salão, endereço ou Instagram..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 text-white placeholder-white/60 text-lg focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
            <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white/60 h-6 w-6" />
          </div>

          {/* Location Button */}
          <motion.button
            onClick={getUserLocation}
            disabled={gettingLocation}
            className="w-full bg-white text-black font-semibold py-4 px-6 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6 text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Navigation className="h-5 w-5 mr-3 inline" />
            {gettingLocation ? 'Obtendo localização...' : 'Usar minha localização'}
          </motion.button>

          {/* Distance Filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/80 text-sm font-medium">Filtrar por distância:</p>
              {!userLocation && (
                <p className="text-white/50 text-xs">Obtenha sua localização para filtrar</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['50', '100', 'all'].map((distance) => (
                <motion.button
                  key={distance}
                  onClick={() => userLocation || distance === 'all' ? setDistanceFilter(distance as any) : null}
                  disabled={!userLocation && distance !== 'all'}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    distanceFilter === distance
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  } ${(!userLocation && distance !== 'all') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  whileHover={userLocation || distance === 'all' ? { scale: 1.05 } : {}}
                  whileTap={userLocation || distance === 'all' ? { scale: 0.95 } : {}}
                >
                  {distance === 'all' ? 'Todos' : `${distance}km`}
                </motion.button>
              ))}
            </div>
            {userLocation && distanceFilter !== 'all' && (
              <p className="text-green-400 text-xs mt-2 text-center">
                ✓ Mostrando salões até {distanceFilter}km de você
              </p>
            )}
          </div>

          {/* View Toggle */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { type: 'list', icon: List, label: 'Lista' },
              { type: 'map', icon: Map, label: 'Mapa' }
            ].map(({ type, icon: Icon, label }) => (
              <motion.button
                key={type}
                onClick={() => setViewType(type as any)}
                className={`flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium transition-all ${
                  viewType === type
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-5 w-5" />
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Map View */}
        {viewType === 'map' && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-white">Mapa dos Salões</h3>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
              <GoogleMap salons={filteredSalons} userLocation={userLocation} />
            </div>
          </motion.div>
        )}

        {/* Salons List */}
        {viewType === 'list' && (
          <motion.div 
            className="space-y-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-white mb-2">
                {userLocation ? (
                  <>Salões <span style={{ color: '#E8D2A9' }}>próximos de você</span></>
                ) : (
                  'Todos os salões'
                )}
              </h3>
              {filteredSalons.length > 0 && (
                <p className="text-white/60">{filteredSalons.length} salões encontrados</p>
              )}
            </div>
            
            {filteredSalons.map((salon, index) => (
              <motion.div
                key={salon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all"
              >
                <div className="flex items-start gap-6">
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
                          <CheckCircle className="h-6 w-6 text-green-400" />
                        )}
                      </div>
                    </div>
                    
                    {salon.phone && (
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-5 w-5 text-green-400" />
                        <button 
                          onClick={() => openWhatsApp(salon.phone!)} 
                          className="text-green-400 hover:text-green-300 transition-colors"
                        >
                          {formatPhone(salon.phone)}
                        </button>
                      </div>
                    )}
                    
                    {salon.address && (
                      <div className="flex items-start gap-2 mb-3">
                        <MapPin className="h-5 w-5 text-white/60 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80">{salon.address}</span>
                      </div>
                    )}
                    
                    {salon.instagram && (
                      <div className="flex items-center gap-2 mb-3">
                        <Instagram className="h-5 w-5 text-purple-400" />
                        <a 
                          href={`https://instagram.com/${salon.instagram.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          {salon.instagram}
                        </a>
                      </div>
                    )}
                    
                    <div className="text-white/60 font-medium">
                      {salon.distance ? `A ${salon.distance.toFixed(1)}km de você` : 'Localização não disponível'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredSalons.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center"
              >
                <MapPin className="h-16 w-16 text-white/40 mx-auto mb-4" />
                <h4 className="font-semibold text-xl mb-3 text-white">Nenhum salão encontrado</h4>
                <p className="text-white/60">
                  {searchTerm 
                    ? `Nenhum salão encontrado para "${searchTerm}". Tente uma busca diferente.`
                    : userLocation 
                      ? 'Tente aumentar o raio de busca ou alterar os filtros.' 
                      : 'Use sua localização para encontrar salões próximos.'
                  }
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Footer */}
      <footer className="text-center py-6 px-4 bg-zinc-900">
        <div className="max-w-md mx-auto">
          <p className="text-xs text-gray-400">
            A.R.P COSMETICA LTDA - CNPJ: 38.730.230.0001-41
          </p>
          <p className="text-xs text-gray-400">
            RUA VISCONDE DE ITAORNA, 1503 - SAO CAETANO DO SUL
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SalonFinder;
