import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Menu, MapPin, Phone, List, Map, Navigation, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
}
const SalonFinder = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [distanceFilter, setDistanceFilter] = useState<'50' | '100' | 'all'>('all');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [isLocationFilterOpen, setIsLocationFilterOpen] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchSalons();
  }, []);

  // Função para calcular distância entre dois pontos
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distância em km
  };

  // Função para obter localização do usuário
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
      setUserLocation(location);

      // Calcular distâncias para todos os salões
      setSalons(prevSalons => prevSalons.map(salon => {
        if (salon.latitude && salon.longitude) {
          const distance = calculateDistance(location.lat, location.lng, salon.latitude, salon.longitude);
          return {
            ...salon,
            distance
          };
        }
        return salon;
      }));
      toast({
        title: "Localização obtida!",
        description: "Mostrando salões próximos a você."
      });
      setGettingLocation(false);
    }, error => {
      toast({
        title: "Erro ao obter localização",
        description: "Não foi possível acessar sua localização. Tente novamente.",
        variant: "destructive"
      });
      setGettingLocation(false);
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

      // Adicionar coordenadas simuladas para demonstração
      const salonsWithCoords = (data || []).map((salon, index) => ({
        ...salon,
        latitude: -23.5505 + (Math.random() - 0.5) * 0.2,
        // São Paulo +/- variação
        longitude: -46.6333 + (Math.random() - 0.5) * 0.2
      }));
      setSalons(salonsWithCoords);
    } catch (error) {
      console.error('Erro ao buscar salões:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar salões por busca e distância
  const filteredSalons = salons.filter(salon => salon.name.toLowerCase().includes(searchTerm.toLowerCase()) || salon.address?.toLowerCase().includes(searchTerm.toLowerCase())).filter(salon => {
    if (distanceFilter === 'all' || !salon.distance) return true;
    const maxDistance = parseInt(distanceFilter);
    return salon.distance <= maxDistance;
  }).sort((a, b) => {
    if (a.distance && b.distance) return a.distance - b.distance;
    return 0;
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <img src="/lovable-uploads/4645a4ff-beda-4f6f-90f1-ea6a54167f18.png" alt="ARO" className="h-8" />
          <Button variant="ghost" size="icon" className="text-gray-900">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-4 py-8 max-w-md mx-auto">
        {/* Background Image div above the gray container */}
        <div className="h-64 bg-cover bg-center bg-no-repeat rounded-lg mb-4" style={{
        backgroundImage: 'url(/lovable-uploads/1572fc57-750b-4248-a2aa-a7bf7e6da5a2.png)'
      }}></div>
        
        <div className="text-center mb-6">
          {/* Search Container with dark gray background */}
          <div className="rounded-lg p-6 mb-6" style={{
          backgroundColor: '#242424'
        }}>
            <h1 className="text-2xl font-bold mb-1 text-white">
              Encontre o Salão mais
            </h1>
            <h2 className="text-2xl font-bold mb-6" style={{
            color: '#F8E7BF'
          }}>
              próximo de você.
            </h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <Input type="text" placeholder="Buscar salão ou endereço..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-white text-black pl-4 pr-12 py-3 rounded-lg w-full border border-gray-300" />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            </div>
          </div>

          {/* Get Location Button - Always visible */}
          <Button onClick={getUserLocation} disabled={gettingLocation} variant="outline" className="w-full mb-4 border-gray-300 text-gray-700 hover:bg-gray-50">
            <Navigation className="h-4 w-4 mr-2" />
            {gettingLocation ? 'Obtendo localização...' : 'Usar minha localização'}
          </Button>

          {/* Distance Filters - Collapsible, but show one by default */}
          {userLocation && <Collapsible open={isLocationFilterOpen} onOpenChange={setIsLocationFilterOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full mb-4 border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Navigation className="h-4 w-4 mr-2" />
                  Filtros de Distância
                  {isLocationFilterOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-3 mb-4">
                <div className="flex gap-2">
                  <Button variant={distanceFilter === '50' ? 'default' : 'outline'} onClick={() => setDistanceFilter('50')} size="sm" className="flex-1">
                    50km
                  </Button>
                  <Button variant={distanceFilter === '100' ? 'default' : 'outline'} onClick={() => setDistanceFilter('100')} size="sm" className="flex-1">
                    100km
                  </Button>
                  <Button variant={distanceFilter === 'all' ? 'default' : 'outline'} onClick={() => setDistanceFilter('all')} size="sm" className="flex-1">
                    Todos
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>}

          {/* View Type Buttons */}
          <div className="flex gap-2 mb-6">
            <Button variant={viewType === 'list' ? 'default' : 'outline'} onClick={() => setViewType('list')} className="flex items-center gap-2 flex-1">
              <List className="h-4 w-4" />
              Lista
            </Button>
            <Button variant={viewType === 'map' ? 'default' : 'outline'} onClick={() => setViewType('map')} className="flex items-center gap-2 flex-1">
              <Map className="h-4 w-4" />
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
        {viewType === 'list' && <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {userLocation ? <span>Salões <span style={{
                color: '#F8E7BF'
              }}>próximos de você</span></span> : 'Todos os salões'}
              </h3>
              {userLocation && filteredSalons.length > 0 && <Badge variant="outline" className="border-gray-300 text-gray-600">
                  {filteredSalons.length} encontrados
                </Badge>}
            </div>
            
            {filteredSalons.map(salon => <Card key={salon.id} className="bg-white text-black border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold flex-shrink-0">
                      {salon.name.charAt(0)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg text-gray-900">{salon.name}</h4>
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex gap-2">
                          {salon.plan === 'verificado_azul' && <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                              Verificado
                            </span>}
                          {salon.plan === 'verificado_dourado' && <span className="text-white px-2 py-1 rounded text-xs whitespace-nowrap" style={{
                      backgroundColor: '#F8E7BF',
                      color: '#000'
                    }}>
                              Verificado
                            </span>}
                          <span className="bg-gray-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                            Parceiro
                          </span>
                        </div>
                      </div>
                      
                      {salon.phone && <div className="flex items-center gap-2 mb-1">
                          <Phone className="h-4 w-4 text-green-600" />
                          <button onClick={() => openWhatsApp(salon.phone!)} className="text-green-600 hover:underline">
                            {formatPhone(salon.phone)}
                          </button>
                        </div>}
                      
                      {salon.address && <div className="flex items-start gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{salon.address}</span>
                        </div>}
                      
                      <div className="text-sm text-gray-500">
                        {salon.distance ? `A ${salon.distance.toFixed(1)}km de você` : 'Localização não disponível'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>)}

            {filteredSalons.length === 0 && <Card className="bg-white text-black border border-gray-200">
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-semibold text-lg mb-2 text-gray-900">Nenhum salão encontrado</h4>
                  <p className="text-gray-600 text-sm">
                    {userLocation ? 'Tente aumentar o raio de busca ou alterar os filtros.' : 'Use sua localização para encontrar salões próximos.'}
                  </p>
                </CardContent>
              </Card>}
          </div>}

        {/* Informativo Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Informativo para você</h3>
          <Card className="bg-gradient-to-r from-orange-400 to-yellow-500 overflow-hidden">
            <CardContent className="p-0 relative h-48">
              <img src="/lovable-uploads/7b0ce177-78db-44ee-9a51-a94e3561d5cd.png" alt="Ana Paula - Profissional de beleza" className="w-full h-full object-cover" />
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded">
                <span className="text-2xl font-bold">02</span>
                <br />
                <span className="text-xs">2024</span>
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
    </div>;
};
export default SalonFinder;