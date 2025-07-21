import { useEffect, useState } from "react";
import verifiedBadge from "@/assets/verified-badge.png";
import { supabase } from "@/integrations/supabase/client";
import { Search, Menu, MapPin, Phone, List, Map, Navigation, ChevronDown, ChevronUp, CheckCircle, Instagram, Store, ShieldCheck } from "lucide-react";
import { generateSalonCoordinates } from "@/utils/geocoding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  const {
    toast
  } = useToast();
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
          return {
            ...salon,
            distance
          };
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
    navigator.geolocation.getCurrentPosition(position => {
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
    }, error => {
      console.error('Erro de geolocalização:', error);
      let errorMessage = "Não foi possível acessar sua localização. Tente novamente.";
      switch (error.code) {
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
    }, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000
    });
  };
  const fetchSalons = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('salons').select('*').eq('is_active', true).order('name');
      if (error) {
        console.error('Erro ao buscar salões:', error);
        return;
      }
      const salonsWithCoords = (data || []).map(salon => {
        if (salon.latitude && salon.longitude && typeof salon.latitude === 'number' && typeof salon.longitude === 'number' && salon.latitude !== 0 && salon.longitude !== 0) {
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
      const {
        data,
        error
      } = await supabase.from('salon_banners').select('*').eq('is_active', true).order('order_position');
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
    return <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{
        borderColor: '#F8E7BF'
      }}></div>
      </div>;
  }
  return <div className="min-h-screen bg-white text-gray-900 overflow-y-auto">
      {/* Dialog de Localização */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="max-w-md mx-auto" aria-describedby="location-dialog-description">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              🎯 Encontre salões próximos!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4" id="location-dialog-description">
            <p className="text-center text-gray-600">
              Permita o acesso à sua localização para mostrarmos os salões mais próximos de você.
            </p>
            <div className="flex gap-3">
              <Button onClick={getUserLocation} disabled={gettingLocation} className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
                <Navigation className="h-4 w-4 mr-2" />
                {gettingLocation ? 'Obtendo...' : 'Usar localização'}
              </Button>
              <Button variant="outline" onClick={() => setShowLocationDialog(false)} className="flex-1">
                Agora não
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="bg-black border-b border-gray-200 px-4 py-4">
        <div className="max-w-md mx-auto md:max-w-4xl flex items-center justify-between">
          <img src="/lovable-uploads/f77b22c2-a495-423a-bce4-4ddc7b37074d.png" alt="ARO" className="h-8" />
          <Navigation className="h-6 w-6 text-white cursor-pointer" onClick={getUserLocation} />
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-4 py-8 max-w-md mx-auto md:max-w-4xl md:px-8 relative z-10">
        
        <div className="h-96 md:h-[500px] lg:h-[600px] bg-contain bg-center bg-no-repeat rounded-lg -mb-64 -mt-8 relative z-10" style={{
        backgroundImage: 'url(/lovable-uploads/97fb24e2-cd79-438d-9fcb-d9e51311a96d.png)'
      }}>
        </div>
        
        <div className="text-center mb-6">
          <div className="rounded-[16px] p-6 mb-6 md:p-8 relative z-10 bg-black mt-32">
            <h1 className="font-bold mb-2 text-white text-2xl md:text-3xl">
              Encontre os salões que utilizam
            </h1>
            <h2 className="font-bold mb-6 text-2xl md:text-3xl" style={{ color: '#F8E7BF' }}>
              Ap Professional!
            </h2>
            
            <div className="relative mb-4">
              <Input type="text" placeholder="Digite um endereço." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-white text-gray-500 pl-4 pr-12 py-3 md:py-4 rounded-xl w-full border-0 text-lg placeholder:text-gray-500" />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>

          {/* Filtros de distância - dropdown style */}
          <div className="mb-4">
            <Collapsible>
              <CollapsibleTrigger className="w-full bg-gray-100 rounded-lg p-3 flex items-center justify-between text-left">
                <span className="text-gray-700 font-medium">
                  {distanceFilter === 'all' ? 'Todos os salões' : `Até ${distanceFilter}km`}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => setDistanceFilter('50')}
                    disabled={!userLocation}
                    className={`w-full text-left p-2 rounded hover:bg-gray-50 ${
                      distanceFilter === '50' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    } ${!userLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Até 50km
                  </button>
                  <button
                    onClick={() => setDistanceFilter('100')}
                    disabled={!userLocation}
                    className={`w-full text-left p-2 rounded hover:bg-gray-50 ${
                      distanceFilter === '100' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    } ${!userLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Até 100km
                  </button>
                  <button
                    onClick={() => setDistanceFilter('all')}
                    className={`w-full text-left p-2 rounded hover:bg-gray-50 ${
                      distanceFilter === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    Todos os salões
                  </button>
                </div>
              </CollapsibleContent>
            </Collapsible>
            {userLocation && distanceFilter !== 'all' && <p className="text-xs text-green-600 mt-2">
                ✓ Mostrando salões até {distanceFilter}km de você
              </p>}
          </div>

          <div className="bg-gray-100 rounded-full p-1 flex gap-1 mb-6">
            <Button 
              variant={viewType === 'list' ? 'default' : 'ghost'} 
              onClick={() => setViewType('list')} 
              className={`flex items-center justify-center gap-2 flex-1 rounded-full text-sm ${
                viewType === 'list' 
                  ? 'bg-white text-black shadow-sm' 
                  : 'text-gray-600 hover:text-black hover:bg-white/50'
              }`}
            >
              <List className="h-4 w-4" />
              Lista
            </Button>
            <Button 
              variant={viewType === 'map' ? 'default' : 'ghost'} 
              onClick={() => setViewType('map')} 
              className={`flex items-center justify-center gap-2 flex-1 rounded-full text-sm ${
                viewType === 'map' 
                  ? 'bg-white text-black shadow-sm' 
                  : 'text-gray-600 hover:text-black hover:bg-white/50'
              }`}
            >
              <MapPin className="h-4 w-4" />
              Mapa
            </Button>
          </div>
        </div>

        {/* Map View */}
        {viewType === 'map' && <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Mapa dos Salões</h3>
            <GoogleMap salons={filteredSalons} userLocation={userLocation} />
          </div>}

        {/* Salons List */}
        {viewType === 'list' && <div className="space-y-4 md:space-y-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <h3 className="text-xl md:text-2xl font-semibold text-black flex items-center gap-2">
                Salões mais próximo de você
                <ChevronDown className="h-6 w-6" />
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {filteredSalons.map((salon, index) => {
            const midPoint = Math.floor(filteredSalons.length / 2);
            const showMidBanner = index === midPoint && banners.length > 0;
            const isLastSalon = index === filteredSalons.length - 1;
            const showEndBanner = isLastSalon && banners.length > 1;
            return <div key={salon.id}>
                    <Card className="bg-gray-50 border border-gray-200 hover:shadow-lg transition-shadow rounded-full p-4 w-full">
                      <CardContent className="p-0">
                        <div className="flex items-center gap-6">
                          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold flex-shrink-0 text-lg overflow-hidden">
                            {salon.photo_url ? <img src={salon.photo_url} alt={salon.name} className="w-full h-full object-cover rounded-full" /> : salon.name.charAt(0)}
                          </div>
                          
                           <div className="flex-1 min-w-0">
                               <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-xl text-gray-900">{salon.name}</h4>
                                <img src={verifiedBadge} alt="Verificado" className="h-8 w-8" />
                              </div>
                           
                            {/* Primeira linha: WhatsApp e Instagram */}
                            <div className="flex items-center gap-4 mb-1">
                              {salon.phone && <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-600" />
                                  <span className="text-sm text-gray-600">{formatPhone(salon.phone)}</span>
                                </div>}
                              
                              {salon.instagram && <div className="flex items-center gap-2">
                                  <Instagram className="h-4 w-4 text-gray-600" />
                                  <span className="text-sm text-gray-600">{salon.instagram}</span>
                                </div>}
                            </div>
                            
                            {/* Segunda linha: Endereço */}
                            {salon.address && <div className="flex items-start gap-2 mb-2">
                                <Store className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-blue-500">{salon.address}</span>
                              </div>}
                            
                            {/* Terceira linha: Distância */}
                            <div className="flex items-center gap-2 text-lg text-gray-700 font-medium">
                              <MapPin className="h-4 w-4 text-blue-500" />
                              {salon.distance ? `A ${salon.distance.toFixed(0)}km de você` : 'A 5km de você'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  
                  {showMidBanner}
                  
                  </div>;
          })}
            </div>

            {filteredSalons.length === 0 && <Card className="bg-white text-black border border-gray-200">
                <CardContent className="p-8 text-center">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-semibold text-xl mb-3 text-gray-900">Nenhum salão encontrado</h4>
                  <p className="text-gray-600 text-base">
                    {searchTerm ? `Nenhum salão encontrado para "${searchTerm}". Tente uma busca diferente.` : userLocation ? 'Tente aumentar o raio de busca ou alterar os filtros.' : 'Use sua localização para encontrar salões próximos.'}
                  </p>
                </CardContent>
              </Card>}
          </div>}

        {/* Banners */}
        {banners.length > 0 && <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Novidades</h3>
            <div className="space-y-4">
              {banners.slice(0, 2).map(banner => <Card key={banner.id} className="overflow-hidden rounded-none">
                  <CardContent className="p-0">
                    <div className="flex h-48">
                      <div className="w-1/2 bg-black flex items-center justify-center p-4">
                        <div className="text-center">
                          <h4 className="text-white text-3xl font-bold mb-2">{banner.title}</h4>
                          {banner.description && <p className="text-gray-300 text-sm">{banner.description}</p>}
                        </div>
                      </div>
                      <div className="w-1/2">
                        <img src={banner.image_url} alt={banner.title} className="w-full h-48 object-cover" />
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>}

        {/* Informativo Section */}
        <div className="mb-8">
          <h3 className="text-lg md:text-2xl font-semibold mb-4 text-gray-900">Informativo para você</h3>
          <Card className="bg-gradient-to-r from-orange-400 to-yellow-500 overflow-hidden">
            <CardContent className="p-0 relative h-48 md:h-64 bg-black rounded-lg">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
                  </div>
                  <p className="text-sm">Clique para reproduzir o vídeo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4 text-center">
            <p className="text-sm mb-2 text-gray-900">
              <strong>Atenção:</strong>
            </p>
            <p className="text-xs text-gray-600 mb-4">
              Este site apenas indica onde utilizam os produtos
              AP Professional. A responsabilidade pelos serviços prestados é
              exclusivamente do salão listado acima.
            </p>
            <Button style={{
            backgroundColor: '#F8E7BF',
            color: '#000'
          }} className="text-white hover:opacity-90 w-full bg-zinc-900 hover:bg-zinc-800">
              Saiba mais
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 px-4 bg-black">
        <div className="max-w-md mx-auto">
          <p className="text-white text-sm font-medium mb-4">Rede Social</p>
          <div className="flex justify-center mb-6">
            <a 
              href="https://instagram.com/anapaulacarvalhooficial" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <Instagram className="h-6 w-6 text-white" />
            </a>
          </div>
          <p className="text-xs text-gray-400">
            A & P COSMETICA LTDA - CNPJ: 38.730.213/0001-41
          </p>
          <p className="text-xs text-gray-400">
            © Todos os direitos reservados. 2025
          </p>
        </div>
      </footer>
    </div>;
};
export default SalonFinder;